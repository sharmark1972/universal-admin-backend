import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(
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

    const body = await request.json().catch(() => ({}));
    const issueId = body.issueId || null;

    const paper = await prisma.paper.findUnique({ where: { id: params.id } });
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const updated = await prisma.paper.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        ...(issueId ? { issueId } : {}),
      },
    });

    revalidatePath('/library');
    revalidatePath('/archives');
    revalidatePath('/');
    if (updated.issueId) revalidatePath(`/issues/${updated.issueId}`);

    return NextResponse.json({ paper: updated, message: 'Paper published successfully' });
  } catch (error) {
    console.error('Error publishing paper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 400 },
    );
  }
}
