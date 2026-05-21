import { NextRequest, NextResponse } from 'next/server';

// Pages that should be accessible during maintenance
const ALLOWED_PATHS = [
  '/maintenance',
  '/api/maintenance',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/images',
  '/static',
  '/uploads'
];

// Admin paths that should always be accessible
const ADMIN_PATHS = [
  '/admin',
  '/api/admin'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for allowed paths
  if (ALLOWED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check maintenance mode from environment variable
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const maintenanceCode = process.env.MAINTENANCE_CODE || '';

  // If maintenance mode is not enabled, continue normally
  if (!isMaintenanceMode) {
    return NextResponse.next();
  }

  // Check if user has bypass code in cookie or query parameter
  const bypassCookie = request.cookies.get('maintenance-bypass');
  const queryCode = request.nextUrl.searchParams.get('code');

  if (bypassCookie?.value === maintenanceCode ||
      queryCode === maintenanceCode) {
    
    // Set bypass cookie if code was provided via query parameter
    if (queryCode === maintenanceCode) {
      const response = NextResponse.next();
      response.cookies.set('maintenance-bypass', maintenanceCode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      });
      return response;
    }
    
    return NextResponse.next();
  }

  // Check if it's an admin path and user is authenticated admin
  if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
    // For admin paths, we'll let them through and handle auth in the actual pages
    return NextResponse.next();
  }

  // Redirect to maintenance page
  const maintenanceUrl = new URL('/maintenance', request.url);
  return NextResponse.redirect(maintenanceUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};