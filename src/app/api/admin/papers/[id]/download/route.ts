import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';
import { getCanonicalResearchPaper } from '@/lib/papers/paper-service';
import { generatePreviewPdfFromData } from '@/lib/papers/pdf-service';
import { downloadFromR2 } from '@/lib/r2-upload';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const paper = await getCanonicalResearchPaper(params.id, prisma);
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const safeTitle = (paper.title || 'research-paper')
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .slice(0, 60);

    console.log('[DOWNLOAD] paper.pdfPath —', (paper as any).pdfPath ?? 'NULL');

    // If PDF is saved in R2, serve it directly
    if ((paper as any).pdfPath) {
      console.log('[DOWNLOAD] Serving PDF from R2 —', (paper as any).pdfPath);
      const pdfBuffer = await downloadFromR2((paper as any).pdfPath);
      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // No saved PDF — extract images from DOCX and generate fresh
    console.log('[DOWNLOAD] No saved PDF — generating fresh with images from DOCX');

    let sections = paper.sections.map((s: any) => ({
      heading: s.heading,
      content: s.content || '',
      isFullWidth: s.isFullWidth ?? true,
    }));

    // Download DOCX from R2 and extract images
    if ((paper as any).sourceFilePath) {
      try {
        const docxBuffer = await downloadFromR2((paper as any).sourceFilePath);
        const imageMap: Map<string, string> = new Map();

        await mammoth.convertToHtml(
          { buffer: docxBuffer },
          {
            convertImage: mammoth.images.imgElement((image) =>
              image.read('base64').then((imageBuffer) => {
                const src = `data:${image.contentType};base64,${imageBuffer}`;
                imageMap.set(`img-${imageMap.size}`, src);
                return { src };
              })
            ),
          }
        );

        console.log('[DOWNLOAD] Images extracted from DOCX —', imageMap.size, 'images');
      } catch (docxError) {
        console.warn('[DOWNLOAD] DOCX image extraction failed (non-fatal):', docxError);
      }
    }

    const pdfBuffer = await generatePreviewPdfFromData({
      title: paper.title || '',
      abstract: paper.abstract || '',
      keywords: Array.isArray(paper.keywords) ? paper.keywords as string[] : [],
      doi: paper.doi || undefined,
      bodyColumnMode: (paper as any).bodyColumnMode === 'single-column' ? 'single-column' : 'two-column',
      authors: paper.authors.map((a: any) => ({
        name: a.name,
        email: a.email || undefined,
        affiliation: a.affiliation || undefined,
      })),
      sections,
      issue: paper.issue ? {
        volume: paper.issue.volume,
        issueNumber: paper.issue.issueNumber,
        year: paper.issue.year,
        publishDate: paper.issue.publishDate.toISOString(),
      } : null,
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error downloading research paper PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
