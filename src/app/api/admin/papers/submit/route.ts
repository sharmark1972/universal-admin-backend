import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions, isAdminOrSuperAdmin } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';
import { storeResearchPaperFile } from '@/lib/papers/storage';
import { uploadToR2 } from '@/lib/r2-upload';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    if (!session?.user || (!isAdminOrSuperAdmin(session.user.role) && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const formData = await request.formData();

    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const keywordsRaw = formData.get('keywords') as string;
    const doi = formData.get('doi') as string | null;
    const issueId = formData.get('issueId') as string | null;
    const bodyColumnMode = (formData.get('bodyColumnMode') as string) || 'two-column';
    const authorsRaw = formData.get('authors') as string;
    const sectionsRaw = formData.get('sections') as string;
    const sourceFileName = formData.get('sourceFileName') as string;
    const sourceFileSize = parseInt(formData.get('sourceFileSize') as string) || 0;
    const docxFile = formData.get('docx') as File | null;
    const pdfFile = formData.get('pdf') as File | null;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!abstract?.trim()) {
      return NextResponse.json({ error: 'Abstract is required' }, { status: 400 });
    }

    // Parse JSON fields
    let keywords: string[] = [];
    let authors: Array<{ name: string; email: string; affiliation?: string | null; isCorresponding: boolean }> = [];
    let sections: Array<{ heading: string; content: string; isFullWidth: boolean }> = [];

    try {
      keywords = JSON.parse(keywordsRaw || '[]');
      authors = JSON.parse(authorsRaw || '[]');
      sections = JSON.parse(sectionsRaw || '[]');
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in authors, sections, or keywords' }, { status: 400 });
    }

    // Email is now optional for authors

    // Upload DOCX to R2 if provided
    let storedSourceFilePath: string | null = null;
    if (docxFile && docxFile.size > 0) {
      const stored = await storeResearchPaperFile(docxFile);
      storedSourceFilePath = stored.fileUrl;
    }

    // Upload PDF to R2 if provided
    let pdfPath: string | null = null;
    if (pdfFile && pdfFile.size > 0) {
      try {
        const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
        const safeTitle = (title || 'research-paper')
          .replace(/[^a-z0-9]/gi, '-')
          .replace(/-+/g, '-')
          .toLowerCase()
          .slice(0, 60);

        pdfPath = await uploadToR2(
          pdfBuffer,
          `${safeTitle}-${Date.now()}.pdf`,
          `research-papers/pdfs`,
          'application/pdf',
        );
      } catch (pdfError) {
        console.error('PDF upload failed:', pdfError);
      }
    }

    const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : '';

    const rawStatus = (formData.get('status') as string) || 'SUBMITTED';
    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'ACCEPTED', 'PUBLISHED', 'REJECTED'];
    const paperStatus = validStatuses.includes(rawStatus) ? rawStatus : 'SUBMITTED';

    // Ensure submitter user exists in database (auto-create if needed)
    let submitterUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!submitterUser) {
      // Map SUPER_ADMIN to ADMIN for database (SUPER_ADMIN not in UserRole enum)
      const dbRole = session.user.role === 'SUPER_ADMIN' ? 'ADMIN' : session.user.role;

      submitterUser = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || `user-${session.user.id}@system`,
          firstName: session.user.firstName || 'User',
          lastName: session.user.lastName || 'Admin',
          passwordHash: '',
          role: dbRole as any,
          isVerified: true,
        },
      });
    }

    // Save directly to papers table
    const paper = await prisma.paper.create({
      data: {
        title: title.trim(),
        abstract: abstract.trim(),
        keywords: keywordsString || null,
        filePath: pdfPath || '',
        status: paperStatus as any,
        publishedAt: paperStatus === 'PUBLISHED' ? new Date() : null,
        submitterId: submitterUser.id,
        issueId: issueId || null,
        doi: doi || null,
        sourceFilePath: storedSourceFilePath,
        sourceFileName: sourceFileName || (docxFile?.name ?? null),
        sourceFileSize: (docxFile?.size ?? sourceFileSize) || null,
        bodyColumnMode,
      },
    });

    // Save sections
    if (sections.length > 0) {
      await prisma.paperSection.createMany({
        data: sections
          .filter((s) => s.heading || s.content)
          .map((s, index) => ({
            paperId: paper.id,
            heading: s.heading.trim(),
            content: s.content,
            isFullWidth: s.isFullWidth ?? true,
            sectionOrder: index,
          })),
      });
    }

    // Save authors — only create User if email is provided
    for (let i = 0; i < authors.length; i++) {
      const a = authors[i];
      const email = a.email?.trim().toLowerCase();

      // Only create/link user if email is provided
      if (email) {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          const nameParts = a.name.trim().split(' ');
          user = await prisma.user.create({
            data: {
              email,
              firstName: nameParts[0] || a.name,
              lastName: nameParts.slice(1).join(' ') || 'Author',
              passwordHash: '',
              role: 'AUTHOR',
              isVerified: false,
            },
          });
        }

        await prisma.paperAuthor.create({
          data: {
            paperId: paper.id,
            userId: user.id,
            authorOrder: i + 1,
            isCorresponding: a.isCorresponding,
          },
        });
      }
      // If no email: don't create user or paperAuthor entry - author only appears in PDF from form data
    }

    return NextResponse.json({ paperId: paper.id, message: 'Paper submitted successfully' });
  } catch (error) {
    console.error('Error submitting paper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
