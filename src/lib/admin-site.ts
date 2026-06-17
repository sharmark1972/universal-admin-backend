import { getAllSites } from '@/config/sites';

const ALL_SITES = getAllSites();

export const ADMIN_SITE_STORAGE_KEY = 'superadmin_active_site';
export const DEFAULT_ADMIN_SITE_SLUG = ALL_SITES[0]?.slug ?? 'wjiis';

export function isValidAdminSiteSlug(slug: string | null | undefined): slug is string {
  return !!slug && ALL_SITES.some((site) => site.slug === slug);
}

export function getAdminSiteSlug(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_SITE_SLUG;

  const saved = localStorage.getItem(ADMIN_SITE_STORAGE_KEY);
  return isValidAdminSiteSlug(saved) ? saved : DEFAULT_ADMIN_SITE_SLUG;
}

export function setAdminSiteSlug(slug: string): void {
  if (typeof window === 'undefined') return;
  if (!isValidAdminSiteSlug(slug)) return;
  localStorage.setItem(ADMIN_SITE_STORAGE_KEY, slug);
}

export function getAdminStoreStorageKey(name: string): string {
  return `${name}:${getAdminSiteSlug()}`;
}

export function clearAdminStoreCache(name: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(getAdminStoreStorageKey(name));
}
