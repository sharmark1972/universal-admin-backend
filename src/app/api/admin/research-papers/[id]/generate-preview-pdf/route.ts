import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions, isAdminOrSuperAdmin } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';
import { getResearchPaperDraft } from '@/lib/research-papers/research-paper-service';
import { generatePreviewPdfFromData } from '@/lib/research-papers/pdf-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const draft = await getResearchPaperDraft(params.id, prisma);
    if (!draft) {
      return NextResponse.json({ error: 'Research paper draft not found' }, { status: 404 });
    }

    const pdfBuffer = await generatePreviewPdfFromData({
      title: draft.title || '',
      abstract: draft.abstract || '',
      keywords: Array.isArray(draft.keywords) ? draft.keywords : [],
      doi: draft.doi || undefined,
      bodyColumnMode: (draft as any).bodyColumnMode === 'single-column' ? 'single-column' : 'two-column',
      authors: draft.authors.map((a: any) => ({
        name: a.name,
        email: a.email || undefined,
        affiliation: a.affiliation || undefined,
      })),
      sections: draft.sections.map((s: any) => ({
        heading: s.heading,
        content: s.content || '',
        isFullWidth: s.isFullWidth ?? true,
      })),
      issue: draft.issue ? {
        volume: draft.issue.volume,
        issueNumber: draft.issue.issueNumber,
        year: draft.issue.year,
        publishDate: draft.issue.publishDate.toISOString(),
      } : null,
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating research paper preview PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 400 },
    );
  }
}
