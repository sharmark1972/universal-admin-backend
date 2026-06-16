'use client';

import { getSession } from 'next-auth/react';
import { getAdminSiteSlug } from '@/lib/admin-site';

export function getActiveSiteSlug(): string {
  return getAdminSiteSlug();
}

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const session = await getSession();
  const role = session?.user?.role;
  const sessionSiteSlug = session?.user?.siteSlug;

  let activeSite: string | null = null;

  if (role === 'SUPER_ADMIN') {
    // Only send x-active-site for superadmin if they explicitly selected a site
    const stored = typeof window !== 'undefined'
      ? localStorage.getItem('superadmin_active_site')
      : null;
    if (stored) activeSite = stored;
  } else {
    // Normal admin: always use their own session siteSlug
    activeSite = sessionSiteSlug ?? null;
  }

  const extraHeaders: Record<string, string> = {};
  if (activeSite) extraHeaders['x-active-site'] = activeSite;

  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...extraHeaders,
    },
  });
}
