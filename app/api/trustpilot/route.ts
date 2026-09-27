import { NextResponse } from 'next/server';
import { getLiveTrustpilotSummary } from '@/lib/trustpilot/trustpilotService';

// Automatically revalidate every 60 seconds so new approved reviews reflect instantly
export const revalidate = 60;

export async function GET() {
  try {
    const summary = await getLiveTrustpilotSummary();
    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch Trustpilot summary' },
      { status: 500 }
    );
  }
}
