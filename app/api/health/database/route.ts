import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    // Lightweight count query with head: true to avoid fetching any data rows
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1);

    if (error) {
      console.error('[Health Check] Database probe failed:', error.message);
      return NextResponse.json(
        { status: 'degraded', service: 'database', timestamp: new Date().toISOString() },
        { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    return NextResponse.json(
      { status: 'operational', service: 'database', timestamp: new Date().toISOString() },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err: any) {
    console.error('[Health Check] Database unexpected error:', err?.message || err);
    return NextResponse.json(
      { status: 'degraded', service: 'database', timestamp: new Date().toISOString() },
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
