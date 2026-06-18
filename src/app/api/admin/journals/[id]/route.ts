import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions, isAdminOrSuperAdmin } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const journal = await prisma.journal.findUnique({ where: { id: params.id } });
    if (!journal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
    }

    return NextResponse.json({ journal });
  } catch (error) {
    console.error('Error fetching journal:', error);
    return NextResponse.json({ error: 'Failed to fetch journal' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
  const session = await getServerSession(_authOptions);
    if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const existing = await prisma.journal.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, abbreviation, website, issnPrint, issnOnline, origin, doiAllotted, isActive } = body;

    if (!name?.trim() || !abbreviation?.trim()) {
      return NextResponse.json({ error: 'Name and abbreviation are required' }, { status: 400 });
    }

    const abbr = abbreviation.trim().toUpperCase();
    if (abbr !== existing.abbreviation) {
      const conflict = await prisma.journal.findUnique({ where: { abbreviation: abbr } });
      if (conflict) {
        return NextResponse.json({ error: 'A journal with this abbreviation already exists' }, { status: 400 });
      }
    }

    const journal = await prisma.journal.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        abbreviation: abbr,
        website: website?.trim() || null,
        issnPrint: issnPrint?.trim() || null,
        issnOnline: issnOnline?.trim() || null,
        origin: origin?.trim() || null,
        doiAllotted: doiAllotted === true,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ journal });
  } catch (error) {
    console.error('Error updating journal:', error);
    return NextResponse.json({ error: 'Failed to update journal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
  const session = await getServerSession(_authOptions);
    if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const journal = await prisma.journal.findUnique({ where: { id: params.id } });
    if (!journal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
    }

    if (journal.isDefault) {
      return NextResponse.json({ error: 'Default journal cannot be deleted' }, { status: 400 });
    }

    // Soft delete - set isActive false
    await prisma.journal.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal:', error);
    return NextResponse.json({ error: 'Failed to delete journal' }, { status: 500 });
  }
}
