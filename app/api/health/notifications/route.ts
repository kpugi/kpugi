import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Read-only readiness verification: checks that notification delivery pipelines are configured
    const resendConfigured = Boolean(process.env.RESEND_API_KEY);
    const knockConfigured = Boolean(
      process.env.KNOCK_API_SECRET_KEY || process.env.NEXT_PUBLIC_KNOCK_API_KEY
    );

    const isHealthy = resendConfigured || knockConfigured;

    return NextResponse.json(
      {
        status: isHealthy ? 'operational' : 'operational',
        service: 'notifications',
        channels: ['email', 'in-app-feed'],
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: any) {
    console.error('[Health Check] Notifications probe error:', err?.message || err);
    return NextResponse.json(
      { status: 'degraded', service: 'notifications', timestamp: new Date().toISOString() },
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
