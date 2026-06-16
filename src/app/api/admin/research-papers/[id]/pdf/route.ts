import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';
import { getResearchPaperDraft } from '@/lib/research-papers/research-paper-service';
import { buildStoredFileResponse, getFileNameFromPath } from '@/lib/file-storage';

export const dynamic = 'force-dynamic';

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') === 'preview' ? 'preview' : 'final';
    const draft = await getResearchPaperDraft(params.id, prisma);

    if (!draft) {
      return NextResponse.json({ error: 'Research paper draft not found' }, { status: 404 });
    }

    const path = type === 'preview' ? draft.previewPdfPath : draft.pdfPath;
    if (!path) {
      return NextResponse.json({ error: 'PDF has not been generated yet' }, { status: 404 });
    }

    return buildStoredFileResponse(path, {
      filename: getFileNameFromPath(path),
      disposition: 'inline',
      cacheControl: 'private, max-age=0',
    });
  } catch (error) {
    console.error('Error serving research paper PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
