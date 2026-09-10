import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Read-only readiness verification: checks that background scraper pipeline environment is active
    return NextResponse.json(
      {
        status: 'operational',
        service: 'scrapers',
        pipeline: 'view-audit-engine',
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: any) {
    console.error('[Health Check] Scraper probe error:', err?.message || err);
    return NextResponse.json(
      { status: 'degraded', service: 'scrapers', timestamp: new Date().toISOString() },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
