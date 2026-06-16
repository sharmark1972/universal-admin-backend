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
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const journals = await prisma.journal.findMany({
      orderBy: [{ isDefault: 'desc' }, { abbreviation: 'asc' }],
    });

    return NextResponse.json({ journals });
  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
  const session = await getServerSession(_authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, abbreviation, website, issnPrint, issnOnline, origin, doiAllotted } = body;

    if (!name?.trim() || !abbreviation?.trim()) {
      return NextResponse.json({ error: 'Name and abbreviation are required' }, { status: 400 });
    }

    const existing = await prisma.journal.findUnique({ where: { abbreviation: abbreviation.trim().toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: 'A journal with this abbreviation already exists' }, { status: 400 });
    }

    const journal = await prisma.journal.create({
      data: {
        name: name.trim(),
        abbreviation: abbreviation.trim().toUpperCase(),
        website: website?.trim() || null,
        issnPrint: issnPrint?.trim() || null,
        issnOnline: issnOnline?.trim() || null,
        origin: origin?.trim() || null,
        doiAllotted: doiAllotted === true,
        isDefault: false,
      },
    });

    return NextResponse.json({ journal }, { status: 201 });
  } catch (error) {
    console.error('Error creating journal:', error);
    return NextResponse.json({ error: 'Failed to create journal' }, { status: 500 });
  }
}
