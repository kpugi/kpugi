import { NextResponse } from 'next/server';
import { triggerScraperRun } from '@/lib/scraper/trigger';
import { sendHeartbeat } from '@/lib/monitoring/heartbeat';
import { verifyCronRequest } from '@/lib/auth/cron-guard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/verify-submissions
 * 
 * Secure endpoint to dispatch the social metric scraper and view auditor.
 * Dispatches to the Python scraping engine via GitHub Actions (or fallback).
 */
export async function GET(request: Request) {
  try {
    const authResult = verifyCronRequest(request);
    if (!authResult.authorized) {
      return authResult.response!;
    }

    const result = await triggerScraperRun();

    // Ping Better Stack Heartbeat on successful scraper dispatch
    await sendHeartbeat(process.env.BETTERSTACK_HEARTBEAT_VERIFY_SUBMISSIONS);

    return NextResponse.json({
      success: true,
      message: 'Scraper audit run dispatched successfully.',
      result,
    });
  } catch (err: any) {
    console.error('[verify-submissions cron] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
