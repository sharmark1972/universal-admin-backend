import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { readFile } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get ebook from database
    const ebook = await prisma.ebook.findUnique({
      where: {
        id: params.id,
        is_published: true
      },
      select: {
        id: true,
        title: true,
        file_path: true,
        access_type: true
      }
    });

    if (!ebook) {
      return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
    }

    // Check access permissions
    // For now, allow all public ebooks and logged-in users for other types
    // In a real implementation, you'd check user session and purchase status here

    // Read the PDF file
    const fullPath = join(process.cwd(), 'public', ebook.file_path);
    const fileBuffer = await readFile(fullPath);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${ebook.title}.pdf"`);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading ebook:', error);
    return NextResponse.json(
      { error: 'Failed to download ebook' },
      { status: 500 }
    );
  }
}