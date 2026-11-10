import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
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

const clerkHandler = clerkMiddleware(async (auth, req) => {
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

    // Unauthenticated → redirect to main site sign-in with clean public redirect URL
    if (!userId) {
      const publicUrl = isDev
        ? req.url
        : `https://${hostname}${req.nextUrl.pathname}${req.nextUrl.search}`;
      const signInUrl = new URL(`${mainOrigin}/sign-in`);
      signInUrl.searchParams.set('redirect_url', publicUrl);
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

  // If in production someone visits kpugi.com/admin directly, seamlessly redirect to admin.kpugi.com
  if (!isAdminSubdomain && !isDev && req.nextUrl.pathname.startsWith('/admin')) {
    const pathAfterAdmin = req.nextUrl.pathname.replace(/^\/admin/, '') || '/';
    const adminUrl = new URL(pathAfterAdmin + req.nextUrl.search, 'https://admin.kpugi.com');
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

  // 2. Rate limiter for public API endpoints (exclude health check probes and authorized load test runner)
  const loadTestSecret = process.env.LOAD_TEST_SECRET;
  const isLoadTestAuthorized =
    Boolean(loadTestSecret) &&
    req.headers.get('x-load-test-token') === loadTestSecret;

  if (ratelimit && !isLoadTestAuthorized && req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/health') && !req.nextUrl.pathname.startsWith('/api/webhooks')) {
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
    // In local dev, allow accessing /onboarding without blocking when live Clerk keys are present
    if (isDev && req.nextUrl.pathname.startsWith('/onboarding')) {
      // Allow through for local development and testing
    } else {
      await auth.protect();
    }
  }

  // 3. Pre-launch Countdown Mode & Public Gate
  const isPrelaunchMode = process.env.NEXT_PUBLIC_PRELAUNCH_MODE === 'true';
  const hasVipCookie = req.cookies.get('kpugi_vip_access')?.value === 'true';
  const codeParam = req.nextUrl.searchParams.get('code')?.toUpperCase();
  const isVipCode = codeParam === 'KPUGI-VIP-20NOV' || codeParam === 'KPUGI-LAUNCH-2026';

  const isPublicMarketingRoute =
    req.nextUrl.pathname.startsWith('/browse') ||
    req.nextUrl.pathname.startsWith('/brands') ||
    req.nextUrl.pathname.startsWith('/creators') ||
    req.nextUrl.pathname.startsWith('/creator') ||
    req.nextUrl.pathname.startsWith('/how-it-works') ||
    req.nextUrl.pathname.startsWith('/pricing') ||
    req.nextUrl.pathname.startsWith('/advertise') ||
    req.nextUrl.pathname.startsWith('/calculator') ||
    req.nextUrl.pathname.startsWith('/roiestimator');

  if (!isDev && isPrelaunchMode && isPublicMarketingRoute && !hasVipCookie && !isVipCode) {
    const { userId } = await auth();
    // If not signed in and has no VIP code, redirect directly to countdown landing page
    if (!userId) {
      const countdownUrl = new URL('/', req.url);
      countdownUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(countdownUrl);
    }
  }

  const response = NextResponse.next();

  // If VIP access code provided in query param, persist VIP access cookie
  if (isVipCode && !hasVipCookie) {
    response.cookies.set('kpugi_vip_access', 'true', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
  }
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

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const hostname = req.headers.get('host') || '';
  const isDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // In local development, bypass clerkMiddleware for all public & marketing routes
  // to avoid Clerk production handshake redirects (where clerk.kpugi.com rejects localhost:3000)
  if (isDev) {
    const pathname = req.nextUrl.pathname;
    const isPublic =
      pathname === '/' ||
      pathname.startsWith('/creators') ||
      pathname.startsWith('/creator') ||
      pathname.startsWith('/brands') ||
      pathname.startsWith('/browse') ||
      pathname.startsWith('/preview') ||
      pathname.startsWith('/how-it-works') ||
      pathname.startsWith('/pricing') ||
      pathname.startsWith('/about') ||
      pathname.startsWith('/advertise') ||
      pathname.startsWith('/calculator') ||
      pathname.startsWith('/roiestimator') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up');

    if (isPublic) {
      const res = NextResponse.next();
      res.headers.set('ngrok-skip-browser-warning', 'true');
      return res;
    }
  }

  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
