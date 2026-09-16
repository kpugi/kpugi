import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyCreatorVerificationPassed } from '@/lib/notifications/creator';
import { notifyAdvertiserSubmissionVerified } from '@/lib/notifications/advertiser';
import { sendHeartbeat } from '@/lib/monitoring/heartbeat';
import { verifyCronRequest } from '@/lib/auth/cron-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authResult = verifyCronRequest(request);
    if (!authResult.authorized) {
      return authResult.response!;
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Fetch all submissions with pending payout amounts ready for automated settlement
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
        auto_approve_at,
        campaign:campaigns (
          id,
          title,
          total_budget,
          advertiser_id,
          cpm_rate,
          spent_budget,
          reserved_budget
        )
      `)
      .gt('pending_payout_amount', 0)
      .lte('auto_approve_at', now);

    if (fetchErr) {
      console.error('[release-payouts cron] Error fetching expired submissions:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    let releasedCount = 0;
    let totalAmountReleased = 0;

    for (const sub of expiredSubs || []) {
      const campaign = (sub as any).campaign;
      const rawPendingPayout = Number(sub.pending_payout_amount || 0);
      if (rawPendingPayout <= 0) continue;

      const totalBudget = Number(campaign?.total_budget || 0);
      const maxCreatorCap = totalBudget > 0 ? totalBudget * 0.25 : Infinity;
      const currentPaid = Number(sub.payout_amount || 0);
      const maxAllowable = Math.max(0, maxCreatorCap - currentPaid);
      const pendingPayout = Math.min(rawPendingPayout, maxAllowable);

      if (pendingPayout <= 0) {
        // Creator reached max pool cap, transition status to completed
        await supabase
          .from('submissions')
          .update({
            pending_payout_amount: 0,
            auto_approve_at: null,
            status: 'completed',
          })
          .eq('id', sub.id);
        continue;
      }

      const newTotalPayout = currentPaid + pendingPayout;
      const viewCount = Number(sub.final_view_count || 0);
      const reservedAmt = Number(sub.reserved_amount || 0);
      const newReservedBudget = Math.max(0, Number(campaign?.reserved_budget || 0) - reservedAmt);

      // 1. Atomically release submission payout and credit creator wallet
      const payoutRef = `KP-AUTO-${Date.now().toString().slice(-6)}`;
      const { data: payoutResult, error: payoutErr } = await supabase.rpc(
        'atomic_release_submission_payout',
        {
          p_submission_id: sub.id,
          p_reference: payoutRef,
        }
      );

      if (payoutErr || !payoutResult?.success) {
        console.error('[release-payouts cron] Atomic payout error for sub:', sub.id, payoutErr || payoutResult?.error);
        continue;
      }

      // 2. Atomically update campaign spent and reserved budget
      if (campaign) {
        await supabase.rpc('atomic_update_campaign_budget', {
          p_campaign_id: campaign.id,
          p_spent_increment: pendingPayout,
          p_reserved_decrement: reservedAmt,
        });
      }

      // 3. Update remaining submission metadata
      await supabase
        .from('submissions')
        .update({
          status: newTotalPayout >= maxCreatorCap ? 'completed' : 'verified_pass',
          last_paid_view_count: viewCount,
          max_verified_views: Math.max(viewCount, Number(sub.max_verified_views || 0)),
          auto_approve_at: null,
          paid_at: now,
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
        status: 'system_verified',
        settled_at: now,
      });

      // 5. Fire notification to creator
      const { data: profile } = await supabase
        .from('profiles')
        .select('clerk_id, email, full_name')
        .eq('id', sub.creator_id)
        .maybeSingle();

      const { data: creatorProfRec } = await supabase
        .from('creator_profiles')
        .select('display_name')
        .eq('profile_id', sub.creator_id)
        .maybeSingle();

      const creatorHandle = creatorProfRec?.display_name || profile?.full_name || 'Creator';

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

      // 6. Fire notification to advertiser
      if (campaign?.advertiser_id) {
        const { data: advProfile } = await supabase
          .from('profiles')
          .select('clerk_id, email')
          .eq('id', campaign.advertiser_id)
          .maybeSingle();

        if (advProfile) {
          notifyAdvertiserSubmissionVerified({
            clerkId: advProfile.clerk_id,
            creatorHandle,
            campaignTitle: campaign?.title || 'Campaign',
            payoutAmount: pendingPayout,
            trackedViews: viewCount,
            campaignId: sub.campaign_id,
            profileId: campaign.advertiser_id,
          }).catch((err) => console.error('[release-payouts cron] Advertiser notify error:', err));
        }
      }

      releasedCount++;
      totalAmountReleased += pendingPayout;
    }

    // Ping Better Stack Heartbeat on successful payout releases
    await sendHeartbeat(process.env.BETTERSTACK_HEARTBEAT_RELEASE_PAYOUTS);

    return NextResponse.json({ success: true, releasedCount, totalAmountReleased });
  } catch (err: any) {
    console.error('[release-payouts cron] Execution error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
