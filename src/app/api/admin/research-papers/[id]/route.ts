import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions, isAdminOrSuperAdmin } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';

export const dynamic = 'force-dynamic';

async function requireAdmin(request: NextRequest) {
  const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
  const session = await getServerSession(_authOptions);
  if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) return null;
  return session;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const session = await requireAdmin(request);
    if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const paper = await prisma.paper.findUnique({
      where: { id: params.id },
      include: {
        paperAuthors: {
          include: { user: { select: { firstName: true, lastName: true, email: true, institution: true } } },
          orderBy: { authorOrder: 'asc' },
        },
        sections: { orderBy: { sectionOrder: 'asc' } },
        issue: { select: { id: true, title: true, volume: true, issueNumber: true, year: true } },
      },
    });

    if (!paper) return NextResponse.json({ error: 'Paper not found' }, { status: 404 });

    return NextResponse.json({ paper });
  } catch (error) {
    console.error('Error fetching paper:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const session = await requireAdmin(request);
    if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const { title, abstract, keywords, doi, issueId, status, bodyColumnMode } = body;

    const paper = await prisma.paper.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(abstract !== undefined ? { abstract } : {}),
        ...(keywords !== undefined ? { keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords } : {}),
        ...(doi !== undefined ? { doi } : {}),
        ...(issueId !== undefined ? { issueId: issueId || null } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(bodyColumnMode !== undefined ? { bodyColumnMode } : {}),
      },
    });

    return NextResponse.json({ paper });
  } catch (error) {
    console.error('Error updating paper:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const session = await requireAdmin(request);
    if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await prisma.paper.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting paper:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
