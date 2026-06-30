import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions, isAdminOrSuperAdmin } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';
import { generateIssueCover } from '@/lib/issueCoverGenerator';
import { getSiteConfig } from '@/config/sites';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get site slug from x-active-site header (sent by adminFetch)
    const _siteSlug = request.headers.get('x-active-site') ?? request.headers.get('x-site-slug') ?? 'wjiis';
    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);
    const session = await getServerSession(_authOptions);
    if (!session?.user || !isAdminOrSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { volume, issueNumber, year, title } = await request.json();

    if (!volume || !issueNumber || !year || !title) {
      return NextResponse.json({ error: 'volume, issueNumber, year, title required' }, { status: 400 });
    }

    // Get site configuration for journal details
    const siteConfig = getSiteConfig(_siteSlug);

    const coverUrl = await generateIssueCover({
      volume: String(volume),
      issueNumber: String(issueNumber),
      year: parseInt(year),
      title: String(title),
      journalName: siteConfig?.name,
      journalShortName: siteConfig?.shortName,
      issnPrint: siteConfig?.issnPrint,
      issnOnline: siteConfig?.issnOnline,
    });

    return NextResponse.json({ success: true, coverUrl });
  } catch (error) {
    console.error('Cover generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate cover' }, { status: 500 });
  }
}
