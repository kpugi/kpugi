import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyCreatorVerificationPassed } from '@/lib/notifications/creator';
import { notifyAdvertiserSubmissionVerified } from '@/lib/notifications/advertiser';

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
          advertiser_id,
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
      const rawPendingPayout = Number(sub.pending_payout_amount || 0);
      if (rawPendingPayout <= 0) continue;

      const totalBudget = Number(campaign?.total_budget || 0);
      const maxCreatorCap = totalBudget > 0 ? totalBudget * 0.25 : Infinity;
      const currentPaid = Number(sub.payout_amount || 0);
      const maxAllowable = Math.max(0, maxCreatorCap - currentPaid);
      const pendingPayout = Math.min(rawPendingPayout, maxAllowable);

      if (pendingPayout <= 0) {
        // Creator reached max pool cap, clear pending amount
        await supabase
          .from('submissions')
          .update({
            pending_payout_amount: 0,
            auto_approve_at: null,
          })
          .eq('id', sub.id);
        continue;
      }

      const newTotalPayout = currentPaid + pendingPayout;
      const viewCount = Number(sub.final_view_count || 0);
      const reservedAmt = Number(sub.reserved_amount || 0);
      const newReservedBudget = Math.max(0, Number(campaign?.reserved_budget || 0) - reservedAmt);

      // 1. Credit or initialize creator wallet balance
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
          wallet_id: creatorWallet.id,
          type: 'payout',
          amount: pendingPayout,
          campaign_id: sub.campaign_id,
          submission_id: sub.id,
          paystack_reference: `KP-AUTO-${Date.now().toString().slice(-6)}`,
          status: 'completed',
          created_at: now,
        });
      } else {
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert({
            profile_id: sub.creator_id,
            wallet_type: 'creator_earnings',
            balance: pendingPayout,
          })
          .select('id')
          .single();

        if (newWallet) {
          await supabase.from('wallet_transactions').insert({
            wallet_id: newWallet.id,
            type: 'payout',
            amount: pendingPayout,
            campaign_id: sub.campaign_id,
            submission_id: sub.id,
            paystack_reference: `KP-AUTO-${Date.now().toString().slice(-6)}`,
            status: 'completed',
            created_at: now,
          });
        }
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

    return NextResponse.json({ success: true, releasedCount, totalAmountReleased });
  } catch (err: any) {
    console.error('[release-payouts cron] Execution error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
