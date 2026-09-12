import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { settleAllCompletedCampaigns } from '@/lib/supabase/settlement';
import { sendHeartbeat } from '@/lib/monitoring/heartbeat';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      const { searchParams } = new URL(request.url);
      const key = searchParams.get('key');
      if (!cronSecret || key !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = createAdminClient();

    // Settle all completed campaigns that have pending creator earnings
    const settlementResult = await settleAllCompletedCampaigns(supabase);

    // Ping Better Stack Heartbeat on successful completion
    await sendHeartbeat(process.env.BETTERSTACK_HEARTBEAT_DAILY_SETTLEMENT);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      campaigns_settled: settlementResult.campaignsSettled,
      total_net_disbursed: settlementResult.totalNetDisbursed,
    });
  } catch (error: any) {
    console.error('[Daily Settlement Cron Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
