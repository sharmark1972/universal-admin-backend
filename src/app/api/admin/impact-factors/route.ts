import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions, isAdminOrSuperAdmin } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';
import { uploadToR2 } from '@/lib/r2-upload';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    
    if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const impactFactors = await prisma.impactFactor.findMany({
      orderBy: {
        year: 'desc'
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

    return NextResponse.json(impactFactors);
  } catch (error) {
    console.error('Error fetching impact factors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch impact factors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
  const session = await getServerSession(_authOptions);
    
    if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const year = parseInt(formData.get('year') as string);
    const value = parseFloat(formData.get('value') as string);
    const certificateFile = formData.get('certificate') as File | null;

    // Validate required fields
    if (!year || !value) {
      return NextResponse.json(
        { error: 'Year and value are required' },
        { status: 400 }
      );
    }

    // Check if year already exists
    const existingFactor = await prisma.impactFactor.findUnique({
      where: { year }
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

      // Upload to R2
      certificatePath = await uploadToR2(buffer, certificateFile.name, 'impact-factors');
    }

    const impactFactor = await prisma.impactFactor.create({
      data: {
        year,
        value,
        certificatePath,
        createdBy: session.user.id
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
    return NextResponse.json(impactFactor, { status: 201 });
  } catch (error) {
    console.error('Error creating impact factor:', error);
    return NextResponse.json(
      { error: 'Failed to create impact factor' },
      { status: 500 }
    );
  }
}
