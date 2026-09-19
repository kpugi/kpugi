import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { redis, isRedisConfigured } from '@/lib/redis/client';

const ratelimit = isRedisConfigured && redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
    })
  : null;

const isProtectedRoute = createRouteMatcher([
  '/c/(.*)',
  '/b/(.*)',
  '/dashboard(.*)',
  '/campaigns(.*)',
  '/wallet(.*)',
  '/submissions(.*)',
  '/accounts(.*)',
  '/earnings(.*)',
  '/onboarding(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') || '';

  // Determine base origin (production vs local development)
  const isDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const mainOrigin = isDev
    ? `http://${hostname.replace(/^(go|admin)\./, '')}`
    : 'https://kpugi.com';

  // 1. Handle go.kpugi.com subdomain requests seamlessly by redirecting to primary /go prelander
  if (hostname.startsWith('go.kpugi.com') || hostname.startsWith('go.localhost')) {
    const urlParam = req.nextUrl.searchParams.get('url');
    if (!urlParam) {
      return NextResponse.redirect(new URL('/browse', mainOrigin));
    }
    return NextResponse.redirect(
      new URL(`/go?url=${encodeURIComponent(urlParam)}`, mainOrigin)
    );
  }

  // 2. Handle admin.kpugi.com subdomain — rewrite to /admin/* internally.
  //    Layer 1 gate: requires a valid Clerk session. Actual admin authorization
  //    is enforced by Postgres RLS (is_admin() function) in every server action.
  const isAdminSubdomain =
    hostname.startsWith('admin.kpugi.com') ||
    hostname.startsWith('admin.localhost');

  if (isAdminSubdomain) {
    const { userId } = await auth();

    // Unauthenticated → redirect to main site sign-in
    if (!userId) {
      const signInUrl = new URL(`${mainOrigin}/sign-in`);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Rewrite admin.kpugi.com/anything → /admin/anything (same deployment)
    const pathname = req.nextUrl.pathname;
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = pathname.startsWith('/admin')
      ? pathname
      : `/admin${pathname === '/' ? '' : pathname}`;

    const rewriteResponse = NextResponse.rewrite(rewriteUrl);
    // Mark admin requests as non-indexable
    rewriteResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    rewriteResponse.headers.set('X-Content-Type-Options', 'nosniff');
    rewriteResponse.headers.set('X-Frame-Options', 'DENY');
    rewriteResponse.headers.set('Referrer-Policy', 'no-referrer');
    return rewriteResponse;
  }

  // If in production someone visits kpugi.com/admin directly, redirect to admin.kpugi.com
  if (!isAdminSubdomain && !isDev && req.nextUrl.pathname.startsWith('/admin')) {
    const adminUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, 'https://admin.kpugi.com');
    return NextResponse.redirect(adminUrl);
  }

  // If in dev someone visits localhost:3000/admin directly, ensure protected
  if (!isAdminSubdomain && isDev && req.nextUrl.pathname.startsWith('/admin')) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // 2. Rate limiter for public API endpoints (exclude health check probes)
  if (ratelimit && req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/health')) {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
    const { success, limit, remaining, reset } = await ratelimit.limit(`ratelimit_${ip}`);
    
    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  response.headers.set('ngrok-skip-browser-warning', 'true');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Enforce non-indexable status for all authenticated dashboard & management routes
  if (isProtectedRoute(req)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
