import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paperId = params.id;
    console.log('PDF request for paper:', paperId);

    // Get paper details
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      select: {
        id: true,
        title: true,
        status: true,
        filePath: true,
      }
    });

    if (!paper) {
      console.log('Paper not found:', paperId);
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    console.log('Paper found:', { id: paper.id, title: paper.title, status: paper.status, filePath: paper.filePath });

    if (!paper.filePath) {
      console.log('No filePath for paper:', paperId);
      return NextResponse.json(
        { error: 'PDF file not available for this paper' },
        { status: 404 }
      );
    }

    // Construct the file path
    let filePath: string;
    if (paper.filePath.startsWith('/uploads/')) {
      filePath = join(process.cwd(), 'public', paper.filePath);
    } else if (paper.filePath.startsWith('/')) {
      filePath = join(process.cwd(), 'public', paper.filePath);
    } else {
      filePath = join(process.cwd(), 'public', 'uploads', paper.filePath);
    }

    console.log('Resolved file path:', filePath);

    // Check if file exists
    let fileStats;
    try {
      fileStats = await stat(filePath);
    } catch (err) {
      console.error('PDF file not found at:', filePath, 'Error:', err);
      return NextResponse.json(
        { error: 'PDF file not found on server', path: filePath },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await readFile(filePath);
    console.log('Read PDF file, size:', fileBuffer.length);

    // Return the file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${encodeURIComponent(paper.title)}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Failed to serve PDF', details: String(error) },
      { status: 500 }
    );
  }
}
