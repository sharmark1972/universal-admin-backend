import { NextRequest, NextResponse } from 'next/server';
import { getPrismaForRequest } from '@/lib/site-context';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const prisma = getPrismaForRequest(request);
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (isActive !== null) where.isActive = isActive === 'true';

    const members = await prisma.reviewerBoardMember.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching reviewer board members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviewer board members' },
      { status: 500 }
    );
  }
}
