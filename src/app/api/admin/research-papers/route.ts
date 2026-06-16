import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const search = searchParams.get('search') || '';
    const issueId = searchParams.get('issueId') || '';

    const where: any = {};
    if (status !== 'ALL') where.status = status;
    if (issueId) where.issueId = issueId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { abstract: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;
    const [papers, total] = await Promise.all([
      prisma.paper.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          paperAuthors: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } },
            orderBy: { authorOrder: 'asc' },
          },
          sections: { orderBy: { sectionOrder: 'asc' } },
          issue: { select: { id: true, title: true, volume: true, issueNumber: true, year: true } },
          _count: { select: { downloads: true, reviews: true } },
        },
      }),
      prisma.paper.count({ where }),
    ]);

    return NextResponse.json({ papers, total, page, limit });
  } catch (error) {
    console.error('Error listing papers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
