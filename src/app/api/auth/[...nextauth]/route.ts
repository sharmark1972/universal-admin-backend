import NextAuth from 'next-auth';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/lib/auth-factory';
import { getPrismaClient } from '@/lib/prisma-registry';

function handler(req: Request, context: { params: { nextauth: string[] } }) {
  const siteSlug = headers().get('x-site-slug') ?? 'wjiis';
  const prisma = getPrismaClient(siteSlug);
  const authOptions = getAuthOptions(prisma, siteSlug);
  return NextAuth(authOptions)(req as never, context);
}

export { handler as GET, handler as POST };