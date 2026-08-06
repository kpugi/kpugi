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

  // 1. Handle go.kpugi.com subdomain requests seamlessly
  if (hostname.startsWith('go.kpugi.com') || hostname.startsWith('go.localhost')) {
    const urlParam = req.nextUrl.searchParams.get('url');
    if (!urlParam) {
      return NextResponse.redirect(new URL('https://kpugi.com/browse', req.url));
    }
    if (req.nextUrl.pathname === '/') {
      return NextResponse.rewrite(new URL(`/go${req.nextUrl.search}`, req.url));
    }
  }

  // 2. Rate limiter for public API endpoints
  if (ratelimit && req.nextUrl.pathname.startsWith('/api/')) {
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
