import { NextRequest, NextResponse } from 'next/server';
import { getPrismaForRequest } from '@/lib/site-context';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = getPrismaForRequest(request);
  try {
    const paperId = params.id;

    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      select: {
        id: true,
        title: true,
        status: true,
        filePath: true,
        _count: {
          select: { downloads: true }
        }
      }
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: paper.id,
      title: paper.title,
      status: paper.status,
      filePath: paper.filePath,
      hasFile: !!paper.filePath,
      downloads: paper._count.downloads
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
