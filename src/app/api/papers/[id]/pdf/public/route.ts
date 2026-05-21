import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';

// Google Scholar bot user agent
const GOOGLE_SCHOLAR_BOT = 'Googlebot-Scholar';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paperId = params.id;
    const { searchParams } = new URL(request.url);
    const isPublicAccess = searchParams.get('public') === '1';
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check if this is a valid request (either from Google Scholar or with public=1)
    const isGoogleScholarBot = userAgent.includes(GOOGLE_SCHOLAR_BOT);
    
    if (!isGoogleScholarBot && !isPublicAccess) {
      return NextResponse.json(
        { error: 'Access denied. This endpoint is for search engines only.' },
        { status: 403 }
      );
    }

    // Get paper details
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      select: {
        id: true,
        title: true,
        status: true,
        filePath: true,
        publishedAt: true
      }
    });

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    // Only allow access to published papers
    if (paper.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Paper not published' },
        { status: 403 }
      );
    }

    // Check if file exists
    let filePath: string;
    if (paper.filePath.startsWith('/uploads/')) {
      filePath = join(process.cwd(), 'public', paper.filePath);
    } else {
      filePath = join(process.cwd(), paper.filePath);
    }
    
    try {
      await stat(filePath);
    } catch {
      console.error('File not found:', filePath);
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Read and return the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    const fileName = paper.filePath.split('/').pop() || 'document';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'doc':
        contentType = 'application/msword';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }

    // Log access for analytics
    console.log(`Public PDF access: ${paperId} - ${isGoogleScholarBot ? 'Google Scholar Bot' : 'Public Link'} - ${userAgent}`);

    // Create response with file
    const response = new NextResponse(fileBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`, // Use inline for search engines
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*', // Allow CORS for search engines
        'X-Robots-Tag': 'index, follow' // Explicitly allow indexing
      }
    });

    return response;

  } catch (error) {
    console.error('Error accessing public PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';