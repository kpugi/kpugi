import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { processDailyBatchSettlement, autoReleaseMaturedBatches } from '@/lib/supabase/settlement';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const { searchParams } = new URL(request.url);
      const key = searchParams.get('key');
      if (key !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = createAdminClient();

    // 1. Collate unbatched today's accruals into 24-hour pending escrow batches
    const batchResult = await processDailyBatchSettlement(supabase);

    // 2. Release matured 24-hour batches into Available Wallet Balance
    const releaseResult = await autoReleaseMaturedBatches(supabase);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      eod_batches_created: batchResult.batchesCreated,
      total_accrual_settled: batchResult.totalAccrualSettled,
      matured_batches_released: releaseResult.batchesMatured,
      total_amount_matured: releaseResult.totalAmountMatured,
    });
  } catch (error: any) {
    console.error('[Daily Settlement Cron Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
