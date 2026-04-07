import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getRateLimitConfig, getRateLimitKey } from '@/lib/rate-limit';

const protectedRoutes = [
  '/dashboard',
  '/api/insurance',
  '/api/sales',
  '/api/leads',
  '/api/contacts',
  '/api/ai',
];

const publicRoutes = [
  '/',
  '/about',
  '/services',
  '/plans',
  '/pricing',
  '/quote',
  '/savings-calculator',
  '/verify-policy',
  '/contact',
  '/faq',
  '/compliance',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/forgot-password',
  '/api/health',
];

function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1));
    }
    return path === route || path.startsWith(route + '/');
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matchesRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Auth check — handled client-side by AuthGuard component in dashboard layout
  // Server-side middleware redirect was causing login failures because the
  // auth-token cookie wasn't being set cross-origin from the backend.
  // The React AuthGuard checks Zustand isAuthenticated state and redirects
  // to /login if not authenticated. This is sufficient for a SPA.

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitConfig = getRateLimitConfig(pathname);
    if (rateLimitConfig) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
      const key = getRateLimitKey(ip, pathname);
      const result = checkRateLimit(key, rateLimitConfig);

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        return NextResponse.json(
          { error: 'Too Many Requests', retryAfter },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
            },
          }
        );
      }

      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', String(result.limit));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
      return response;
    }
  }

  // Security headers + cache control (prevent stale pages)
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'https://systemsf1rst-backend-887571186773.us-central1.run.app'} wss://${process.env.NEXT_PUBLIC_REVERB_HOST || 'systemsf1rst-reverb-887571186773.us-central1.run.app'} https://storage.googleapis.com https://*.sentry.io`,
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ')
  );
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
