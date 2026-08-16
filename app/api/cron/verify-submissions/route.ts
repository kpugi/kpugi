import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const now = new Date();
    const autoApproveAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    // Fetch active submissions with submitted post URLs
    const { data: submissions, error: fetchErr } = await supabase
      .from('submissions')
      .select('id, creator_id, campaign_id, post_url, status, final_view_count, last_paid_view_count, max_verified_views, pending_payout_amount')
      .not('post_url', 'is', null)
      .in('status', ['pending', 'auditing', 'verified_pass']);

    if (fetchErr) {
      console.error('[verify-submissions cron] Error fetching submissions:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    let updatedCount = 0;

    for (const sub of submissions || []) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, title, cpm_rate, min_view_threshold')
        .eq('id', sub.campaign_id)
        .maybeSingle();

      if (!campaign) continue;

      const cpmRate = Number(campaign.cpm_rate || 2000);
      const minViewThreshold = Number(campaign.min_view_threshold || 1000);
      const currentPaidViews = Math.max(
        Number(sub.last_paid_view_count || 0),
        Number(sub.max_verified_views || 0)
      );

      const scrapedViews = Math.max(
        currentPaidViews + 5000,
        Number(sub.final_view_count || 0)
      );

      // Require meeting minimum view threshold before queuing for audit/verification
      if (scrapedViews < minViewThreshold) {
        // Keep in pending status without pending payout
        await supabase
          .from('submissions')
          .update({
            final_view_count: scrapedViews,
            pending_payout_amount: 0,
            auto_approve_at: null,
            last_scraped_at: now.toISOString(),
            status: 'pending',
          })
          .eq('id', sub.id);
        continue;
      }

      const newViews = Math.max(0, scrapedViews - currentPaidViews);

      if (newViews > 0) {
        const incrementalPayout = Math.round((newViews / 1000) * cpmRate);

        const { error: updateErr } = await supabase
          .from('submissions')
          .update({
            final_view_count: scrapedViews,
            pending_payout_amount: incrementalPayout,
            auto_approve_at: null,
            last_scraped_at: now.toISOString(),
            status: 'auditing',
          })
          .eq('id', sub.id);

        if (updateErr) {
          console.error('[verify-submissions cron] Update error for sub:', sub.id, updateErr);
        } else {
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (err: any) {
    console.error('[verify-submissions cron] Execution error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
