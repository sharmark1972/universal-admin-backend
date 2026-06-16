import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfigByDomain } from '@/config/sites';

const ALLOWED_PATHS = [
  '/maintenance',
  '/api/maintenance',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/images',
  '/static',
  '/uploads',
];

const ADMIN_PATHS = ['/admin', '/api/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Resolve site from Host header
  const host = request.headers.get('host') ?? '';
  const siteConfig = getSiteConfigByDomain(host);

  // Unknown domain → 404
  if (!siteConfig) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Inject x-site-slug into request headers — all API routes + Server Components read this
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-slug', siteConfig.slug);

  // Always allow these paths
  if (ALLOWED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Admin paths always pass through
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Maintenance mode check
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const maintenanceCode = process.env.MAINTENANCE_CODE ?? '';

  if (isMaintenanceMode) {
    const bypassCookie = request.cookies.get('maintenance-bypass');
    const queryCode = request.nextUrl.searchParams.get('code');

    if (bypassCookie?.value === maintenanceCode || queryCode === maintenanceCode) {
      if (queryCode === maintenanceCode) {
        const response = NextResponse.next({ request: { headers: requestHeaders } });
        response.cookies.set('maintenance-bypass', maintenanceCode, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
        });
        return response;
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};