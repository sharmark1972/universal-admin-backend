import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';
import { uploadToR2 } from '@/lib/r2-upload';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const impactFactor = await prisma.impactFactor.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!impactFactor) {
      return NextResponse.json({ error: 'Impact factor not found' }, { status: 404 });
    }

    return NextResponse.json(impactFactor);
  } catch (error) {
    console.error('Error fetching impact factor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch impact factor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
  const session = await getServerSession(_authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const year = parseInt(formData.get('year') as string);
    const value = parseFloat(formData.get('value') as string);
    const certificateFile = formData.get('certificate') as File | null;
    const isActive = formData.get('isActive') === 'true';

    // Validate required fields
    if (!year || !value) {
      return NextResponse.json(
        { error: 'Year and value are required' },
        { status: 400 }
      );
    }

    // Check if year already exists for other impact factors
    const existingFactor = await prisma.impactFactor.findFirst({
      where: {
        year,
        id: { not: params.id }
      }
    });

    if (existingFactor) {
      return NextResponse.json(
        { error: 'Impact factor for this year already exists' },
        { status: 400 }
      );
    }

    let certificatePath: string | null = null;
    
    // Handle certificate upload
    if (certificateFile) {
      const bytes = await certificateFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `impact_factor_${year}_${Date.now()}.pdf`;
      certificatePath = await uploadToR2(buffer, filename, 'certificates', certificateFile.type || 'application/pdf');
    }

    const impactFactor = await prisma.impactFactor.update({
      where: { id: params.id },
      data: {
        year,
        value,
        certificatePath,
        isActive
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    revalidatePath('/impact-factors');
    revalidatePath('/');
    return NextResponse.json(impactFactor);
  } catch (error) {
    console.error('Error updating impact factor:', error);
    return NextResponse.json(
      { error: 'Failed to update impact factor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
  const session = await getServerSession(_authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.impactFactor.delete({
      where: { id: params.id }
    });

    revalidatePath('/impact-factors');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting impact factor:', error);
    return NextResponse.json(
      { error: 'Failed to delete impact factor' },
      { status: 500 }
    );
  }
}
