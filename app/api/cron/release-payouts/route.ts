import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyCreatorVerificationPassed } from '@/lib/notifications/creator';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Fetch all submissions with an expired 60-minute review timer
    const { data: expiredSubs, error: fetchErr } = await supabase
      .from('submissions')
      .select(`
        id,
        creator_id,
        campaign_id,
        pending_payout_amount,
        payout_amount,
        final_view_count,
        reserved_amount,
        max_verified_views,
        last_paid_view_count,
        campaign:campaigns (
          id,
          title,
          cpm_rate,
          spent_budget,
          reserved_budget
        )
      `)
      .not('auto_approve_at', 'is', null)
      .lte('auto_approve_at', now)
      .gt('pending_payout_amount', 0);

    if (fetchErr) {
      console.error('[release-payouts cron] Error fetching expired submissions:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    let releasedCount = 0;
    let totalAmountReleased = 0;

    for (const sub of expiredSubs || []) {
      const campaign = (sub as any).campaign;
      const pendingPayout = Number(sub.pending_payout_amount || 0);
      if (pendingPayout <= 0) continue;

      const newTotalPayout = Number(sub.payout_amount || 0) + pendingPayout;
      const viewCount = Number(sub.final_view_count || 0);
      const reservedAmt = Number(sub.reserved_amount || 0);
      const newReservedBudget = Math.max(0, Number(campaign?.reserved_budget || 0) - reservedAmt);

      // 1. Credit creator wallet balance
      const { data: creatorWallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('profile_id', sub.creator_id)
        .eq('wallet_type', 'creator_earnings')
        .maybeSingle();

      if (creatorWallet) {
        await supabase
          .from('wallets')
          .update({ balance: Number(creatorWallet.balance || 0) + pendingPayout })
          .eq('id', creatorWallet.id);

        await supabase.from('wallet_transactions').insert({
          profile_id: sub.creator_id,
          creator_id: sub.creator_id,
          wallet_type: 'creator_earnings',
          transaction_type: 'payout',
          amount: pendingPayout,
          status: 'completed',
          reference: `KP-AUTOPAY-${Date.now().toString().slice(-6)}`,
          created_at: now,
        });
      }

      // 2. Update creator total_earned
      const { data: creatorProf } = await supabase
        .from('creator_profiles')
        .select('total_earned')
        .eq('profile_id', sub.creator_id)
        .maybeSingle();

      if (creatorProf) {
        await supabase
          .from('creator_profiles')
          .update({ total_earned: Number(creatorProf.total_earned || 0) + pendingPayout })
          .eq('profile_id', sub.creator_id);
      }

      // 3. Update campaign spent_budget and reserved_budget
      if (campaign) {
        await supabase
          .from('campaigns')
          .update({
            spent_budget: Number(campaign.spent_budget || 0) + pendingPayout,
            reserved_budget: newReservedBudget,
            updated_at: now,
          })
          .eq('id', campaign.id);
      }

      // 4. Update submission record state to settled
      await supabase
        .from('submissions')
        .update({
          status: 'verified_pass',
          payout_amount: newTotalPayout,
          last_paid_view_count: viewCount,
          max_verified_views: Math.max(viewCount, Number(sub.max_verified_views || 0)),
          pending_payout_amount: 0,
          auto_approve_at: null,
          paid_at: now,
          verified_at: now,
        })
        .eq('id', sub.id);

      // 5. Log immutable Audit History Record
      await supabase.from('submission_audits').insert({
        submission_id: sub.id,
        campaign_id: sub.campaign_id,
        creator_id: sub.creator_id,
        views_scraped: viewCount,
        views_delta: Math.max(0, viewCount - Number(sub.last_paid_view_count || 0)),
        payout_amount: pendingPayout,
        status: 'auto_approved',
        settled_at: now,
      });

      // 5. Fire notification to creator
      const { data: profile } = await supabase
        .from('profiles')
        .select('clerk_id, email')
        .eq('id', sub.creator_id)
        .maybeSingle();

      if (profile) {
        notifyCreatorVerificationPassed({
          clerkId: profile.clerk_id,
          email: profile.email,
          campaignTitle: campaign?.title || 'Campaign',
          payoutAmount: pendingPayout,
          trackedViews: viewCount,
          campaignId: sub.campaign_id,
          profileId: sub.creator_id,
        }).catch((err) => console.error('[release-payouts cron] Notification error:', err));
      }

      releasedCount++;
      totalAmountReleased += pendingPayout;
    }

    return NextResponse.json({ success: true, releasedCount, totalAmountReleased });
  } catch (err: any) {
    console.error('[release-payouts cron] Execution error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
