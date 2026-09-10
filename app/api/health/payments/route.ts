import { NextResponse } from 'next/server';
import { paystackFetch } from '@/lib/paystack/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Zero sensitive operations: checks Paystack API connectivity by fetching 1 public bank code
    await paystackFetch('/bank?country=nigeria&perPage=1');

    return NextResponse.json(
      { status: 'operational', service: 'payments', timestamp: new Date().toISOString() },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err: any) {
    console.error('[Health Check] Paystack probe failed:', err?.message || err);
    return NextResponse.json(
      { status: 'degraded', service: 'payments', timestamp: new Date().toISOString() },
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
