import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireAdmin();
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
  try {
    const session = await requireAdmin();
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
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await prisma.paper.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting paper:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
