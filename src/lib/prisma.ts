// Backward-compat bridge — use getPrismaClient(siteSlug) in API routes instead.
// This fallback is used by lib/ services that have not yet been updated.
import { getPrismaClient } from '@/lib/prisma-registry';

export const prisma = getPrismaClient('wjiis');