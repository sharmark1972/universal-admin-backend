import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions, isAdminOrSuperAdmin } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const url = new URL(request.url);
    const siteFromParam = url.searchParams.get('site');
    const siteFromHeader = request.headers.get('x-active-site');

    const _siteSlug = siteFromParam ?? siteFromHeader ?? request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    
    if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Get conferences with participant counts
    const [conferences, totalConferences] = await Promise.all([
      prisma.conference.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          status: true,
          videoUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.conference.count({ where }),
    ]);

    // Transform the data
    const transformedConferences = conferences;

    const totalPages = Math.ceil(totalConferences / limit);

    const response = NextResponse.json({
      conferences: transformedConferences,
      totalConferences,
      totalPages,
      currentPage: page,
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error fetching conferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conferences' },
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

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      status,
      videoUrl
    } = body;

    // Validate required fields
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startDate, endDate' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate video URL if provided
    if (videoUrl) {
      try {
        new URL(videoUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid video URL format' },
          { status: 400 }
        );
      }
    }

    // Create conference
    const conference = await prisma.conference.create({
      data: {
        title,
        description,
        startDate: start,
        endDate: end,
        location,
        status: status || 'UPCOMING',
        videoUrl,
        createdBy: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        status: true,
        videoUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Conference created successfully',
      conference,
    });
  } catch (error) {
    console.error('Error creating conference:', error);
    return NextResponse.json(
      { error: 'Failed to create conference' },
      { status: 500 }
    );
  }
}
