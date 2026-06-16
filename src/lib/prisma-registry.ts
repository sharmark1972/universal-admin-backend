import { PrismaClient } from '@prisma/client';
import { getSiteConfig } from '@/config/sites';

type PrismaPool = Map<string, PrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prismaPool: PrismaPool | undefined;
};

function getPool(): PrismaPool {
  if (!globalForPrisma.prismaPool) {
    globalForPrisma.prismaPool = new Map();
  }
  return globalForPrisma.prismaPool;
}

export function getPrismaClient(siteSlug: string): PrismaClient {
  const pool = getPool();

  if (pool.has(siteSlug)) {
    return pool.get(siteSlug)!;
  }

  const siteConfig = getSiteConfig(siteSlug);
  if (!siteConfig) {
    throw new Error(`Unknown site slug: "${siteSlug}"`);
  }

  const dbUrl = process.env[siteConfig.dbEnvVar];
  if (!dbUrl) {
    throw new Error(`Missing env var "${siteConfig.dbEnvVar}" for site "${siteSlug}"`);
  }

  const client = new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  pool.set(siteSlug, client);
  return client;
}
