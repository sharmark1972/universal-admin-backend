import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getSiteConfigByDomain, getSiteConfig, SiteConfig } from '@/config/sites';
import { getPrismaClient } from '@/lib/prisma-registry';
import { getAuthOptions } from '@/lib/auth-factory';
import { PrismaClient } from '@prisma/client';

export const SITE_SLUG_HEADER = 'x-site-slug';
export const ACTIVE_SITE_HEADER = 'x-active-site';

// --- API routes mein use karein (NextRequest available hota hai) ---

export function getSiteSlugFromRequest(request: NextRequest | Request): string {
  const headers =
    (request as NextRequest).headers ??
    (request as Request).headers;

  const slug =
    (request as NextRequest).headers?.get(SITE_SLUG_HEADER) ??
    (request as Request).headers?.get?.(SITE_SLUG_HEADER) ??
    '';
  if (slug) {
    const config = getSiteConfig(slug);
    if (!config) throw new Error(`No site config for slug: "${slug}"`);
    return slug;
  }

  const host = headers?.get('host') ?? '';
  const hostSlug = resolveSiteSlugFromHost(host);
  if (hostSlug) return hostSlug;

  throw new Error(`Unable to resolve site slug for host: "${host || 'unknown'}"`);
}

export function getPrismaForRequest(request: NextRequest | Request): PrismaClient {
  const slug = getSiteSlugFromRequest(request);
  return getPrismaClient(slug);
}

// Super-admin aware — agar x-active-site header hai aur role SUPER_ADMIN hai toh us site ka prisma use karo.
// Normal admin ke liye x-active-site ignore hota hai — session siteSlug ya x-site-slug use hota hai.
export async function getPrismaForAdminRequest(request: NextRequest | Request): Promise<PrismaClient> {
  const siteSlugFromRequest = getSiteSlugFromRequest(request);
  const authOptions = getAuthOptions(getPrismaClient(siteSlugFromRequest), siteSlugFromRequest);
  const session = await getServerSession(authOptions);

  if (session?.user?.role === 'SUPER_ADMIN') {
    const activeSite =
      (request as NextRequest).headers?.get(ACTIVE_SITE_HEADER) ??
      (request as Request).headers?.get?.(ACTIVE_SITE_HEADER) ??
      '';
    if (activeSite && getSiteConfig(activeSite)) {
      return getPrismaClient(activeSite);
    }
  }

  // Normal admin: use their session siteSlug or fallback to request slug
  const sessionSiteSlug = session?.user?.siteSlug;
  if (sessionSiteSlug && getSiteConfig(sessionSiteSlug)) {
    return getPrismaClient(sessionSiteSlug);
  }

  return getPrismaForRequest(request);
}

export async function getActiveSiteSlug(request: NextRequest | Request): Promise<string> {
  const siteSlugFromRequest = getSiteSlugFromRequest(request);
  const authOptions = getAuthOptions(getPrismaClient(siteSlugFromRequest), siteSlugFromRequest);
  const session = await getServerSession(authOptions);

  if (session?.user?.role === 'SUPER_ADMIN') {
    const activeSite =
      (request as NextRequest).headers?.get(ACTIVE_SITE_HEADER) ??
      (request as Request).headers?.get?.(ACTIVE_SITE_HEADER) ??
      '';
    if (activeSite && getSiteConfig(activeSite)) return activeSite;
  }

  const sessionSiteSlug = session?.user?.siteSlug;
  if (sessionSiteSlug && getSiteConfig(sessionSiteSlug)) return sessionSiteSlug;

  return siteSlugFromRequest;
}

export function getSiteConfigForRequest(request: NextRequest | Request): SiteConfig {
  const slug = getSiteSlugFromRequest(request);
  const config = getSiteConfig(slug);
  if (!config) throw new Error(`No site config for slug: "${slug}"`);
  return config;
}

// --- Server Components mein use karein ---

export function getCurrentSiteSlug(): string {
  const slug = headers().get(SITE_SLUG_HEADER);
  if (!slug) throw new Error('x-site-slug header missing in Server Component');
  return slug;
}

export function getCurrentSiteConfig(): SiteConfig {
  const slug = getCurrentSiteSlug();
  const config = getSiteConfig(slug);
  if (!config) throw new Error(`No site config for slug: "${slug}"`);
  return config;
}

export function getCurrentPrisma(): PrismaClient {
  return getPrismaClient(getCurrentSiteSlug());
}

// --- Middleware mein use karein ---

export function resolveSiteSlugFromHost(host: string): string | null {
  const config = getSiteConfigByDomain(host);
  return config?.slug ?? null;
}
