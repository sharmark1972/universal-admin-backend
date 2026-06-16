import { NextRequest, NextResponse } from 'next/server';
import { getPrismaForRequest } from '@/lib/site-context';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const prisma = getPrismaForRequest(request);
  try {
    // Get all active impact factors ordered by year (most recent first)
    const impactFactors = await prisma.impactFactor.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        year: 'desc'
      },
      select: {
        id: true,
        year: true,
        value: true,
        certificatePath: true,
        createdAt: true
      }
    });

    // Get the current (latest) impact factor
    const currentImpactFactor = impactFactors.length > 0 ? impactFactors[0] : null;

    return NextResponse.json({
      impactFactors,
      currentImpactFactor
    });
  } catch (error) {
    console.error('Error fetching impact factors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch impact factors' },
      { status: 500 }
    );
  }
}
