import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getPrismaForAdminRequest } from '@/lib/site-context';

export const dynamic = 'force-dynamic';

// GET /api/admin/seo - Get all SEO configurations
export async function GET(request: NextRequest) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const seoData = await prisma.sEOConfig.findMany({
      orderBy: {
        page: 'asc'
      }
    });

    return NextResponse.json({ seoData });
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/seo - Create new SEO configuration
export async function POST(request: NextRequest) {
  const prisma = await getPrismaForAdminRequest(request);
  try {
    const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
  const session = await getServerSession(_authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      page,
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonicalUrl,
      robots
    } = body;

    // Validate required fields
    if (!page || !title || !description) {
      return NextResponse.json(
        { error: 'Page, title, and description are required' },
        { status: 400 }
      );
    }

    // Check if SEO config for this page already exists
    const existingConfig = await prisma.sEOConfig.findUnique({
      where: { page }
    });

    if (existingConfig) {
      return NextResponse.json(
        { error: 'SEO configuration for this page already exists' },
        { status: 409 }
      );
    }

    const seoConfig = await prisma.sEOConfig.create({
      data: {
        page,
        title,
        description,
        keywords: keywords || null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        twitterImage: twitterImage || null,
        canonicalUrl: canonicalUrl || null,
        robots: robots || 'index, follow'
      }
    });

    return NextResponse.json({ seoConfig }, { status: 201 });
  } catch (error) {
    console.error('Error creating SEO config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
