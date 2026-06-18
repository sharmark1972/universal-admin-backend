import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions, isAdminOrSuperAdmin } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import {
  enhanceExtractedResearchPaperData,
  ExtractionMode,
} from '@/lib/papers/paper-service';
import type { ExtractedStructuredData } from '@/lib/papers/docx-extractor';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
  if (!session?.user || (!isAdminOrSuperAdmin(session.user.role) && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  let body: {
    structured?: ExtractedStructuredData;
    sourceFileName?: string;
    sourceFileSize?: number;
    extractionMode?: ExtractionMode;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.structured?.rawHtml) {
    return NextResponse.json({ error: 'Extracted document data is required' }, { status: 400 });
  }

  const steps: ExtractionMode[] = [];
  const result = await enhanceExtractedResearchPaperData(
    body.structured,
    body.sourceFileName || '',
    body.sourceFileSize || 0,
    (step) => steps.push(step),
    body.extractionMode || 'auto',
  );

  return NextResponse.json({ ...result, steps });
}
