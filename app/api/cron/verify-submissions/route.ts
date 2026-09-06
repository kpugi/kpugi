import { NextResponse } from 'next/server';
import { triggerScraperRun } from '@/lib/scraper/trigger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/verify-submissions
 * 
 * Secure endpoint to dispatch the social metric scraper and view auditor.
 * Dispatches to the Python scraping engine via GitHub Actions (or fallback).
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(request.url);
      const queryKey = url.searchParams.get('key');
      if (queryKey !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await triggerScraperRun();
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
