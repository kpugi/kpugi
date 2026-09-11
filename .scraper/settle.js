/**
 * Automated Settlement & Wallet Release Engine
 * Called by GitHub Actions hourly cron or on-demand to:
 * 1. Package pending post accruals into 24-hour verification escrow batches.
 * 2. Release matured escrow batches into available wallet balances.
 */

const { createClient } = require('@supabase/supabase-js');

// Read environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Settlement Engine] Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSettlement() {
  console.log('[Settlement Engine] Starting automated settlement run at', new Date().toISOString());

  try {
    // 1. Find all submissions with pending accruals (pending_payout_amount > 0)
    const { data: unbatchedSubs, error: subsErr } = await supabase
      .from('submissions')
      .select('id, campaign_id, creator_id, final_view_count, last_paid_view_count, pending_payout_amount, payout_amount, submitted_at, verified_at, campaigns!inner(title, spent_budget, total_budget, advertiser_id, status)')
      .gt('pending_payout_amount', 0);

    if (subsErr) {
      console.error('[Settlement Engine] Error fetching pending submissions:', subsErr);
    } else if (!unbatchedSubs || unbatchedSubs.length === 0) {
      console.log('[Settlement Engine] No unbatched pending accruals found.');
    } else {
      console.log(`[Settlement Engine] Found ${unbatchedSubs.length} submission(s) with pending accruals.`);

      const now = new Date();
      let batchesCreated = 0;
      let totalSettled = 0;

      // Group submissions by (creator_id, campaign_id)
      const grouped = {};
      for (const sub of unbatchedSubs) {
        const key = `${sub.creator_id}_${sub.campaign_id}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(sub);
      }

      for (const key of Object.keys(grouped)) {
        const subs = grouped[key];
        const firstSub = subs[0];
        const creatorId = firstSub.creator_id;
        const campaignId = firstSub.campaign_id;

        const totalBatchAmount = subs.reduce((sum, s) => sum + Number(s.pending_payout_amount || 0), 0);
        if (totalBatchAmount <= 0) continue;

        // Ensure creator wallet exists
        let { data: wallet } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('profile_id', creatorId)
          .eq('wallet_type', 'creator_earnings')
          .maybeSingle();

        if (!wallet) {
          const { data: newW } = await supabase
            .from('wallets')
            .insert({
              profile_id: creatorId,
              wallet_type: 'creator_earnings',
              balance: 0,
            })
            .select('id, balance')
            .single();
          wallet = newW;
        }

        if (!wallet) continue;

        // Calculate clears_at: 24h from submission/verification
        const oldestPostTime = subs.reduce((oldest, s) => {
          const t = new Date(s.submitted_at || s.verified_at || now).getTime();
          return isNaN(t) ? oldest : Math.min(oldest, t);
        }, now.getTime());

        const targetClearTime = oldestPostTime + 24 * 60 * 60 * 1000;
        const batchClearsAt = targetClearTime <= now.getTime()
          ? new Date(now.getTime() - 1000).toISOString()
          : new Date(targetClearTime).toISOString();

        const ref = `KP-EOD-${Date.now().toString(36).toUpperCase()}-${campaignId.slice(0, 4).toUpperCase()}`;

        // Insert batch transaction
        const { error: txErr } = await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            type: 'payout_release',
            amount: totalBatchAmount,
            campaign_id: campaignId,
            submission_id: firstSub.id,
            status: 'clearing',
            clears_at: batchClearsAt,
            paystack_reference: ref,
          });

        if (txErr) {
          console.error('[Settlement Engine] Error inserting batch tx:', txErr);
          continue;
        }

        // Update each submission and record immutable audit records
        for (const sub of subs) {
          const viewsScraped = Number(sub.final_view_count || 0);
          const lastPaidViews = Number(sub.last_paid_view_count || 0);
          const viewsDelta = Math.max(0, viewsScraped - lastPaidViews);
          const payoutForSub = Number(sub.pending_payout_amount || 0);

          await supabase.from('submission_audits').insert({
            submission_id: sub.id,
            campaign_id: campaignId,
            creator_id: creatorId,
            views_scraped: viewsScraped,
            views_delta: viewsDelta,
            payout_amount: payoutForSub,
            status: 'auto_approved',
            settled_at: now.toISOString(),
          });

          await supabase
            .from('submissions')
            .update({
              last_paid_view_count: viewsScraped,
              payout_amount: Number(sub.payout_amount || 0) + payoutForSub,
              pending_payout_amount: 0,
              auto_approve_at: null,
            })
            .eq('id', sub.id);
        }

        batchesCreated++;
        totalSettled += totalBatchAmount;
      }

      console.log(`[Settlement Engine] Successfully created ${batchesCreated} batch(es) totaling ₦${totalSettled.toLocaleString()}.`);
    }

    // 2. Release matured 24-hour batches into Available Wallet Balance
    const nowIso = new Date().toISOString();
    const { data: maturedBatches, error: matErr } = await supabase
      .from('wallet_transactions')
      .select('id, wallet_id, amount, campaign_id, submission_id, clears_at, wallets:wallet_id(id, profile_id, balance)')
      .eq('status', 'clearing')
      .lte('clears_at', nowIso);

    if (matErr) {
      console.error('[Settlement Engine] Error fetching matured batches:', matErr);
    } else if (!maturedBatches || maturedBatches.length === 0) {
      console.log('[Settlement Engine] No matured batches ready for release.');
    } else {
      console.log(`[Settlement Engine] Found ${maturedBatches.length} matured batch(es) to release.`);
      let releasedCount = 0;
      let totalReleased = 0;

      for (const batch of maturedBatches) {
        const amount = Number(batch.amount || 0);
        const wallet = batch.wallets;
        if (!wallet || amount <= 0) continue;

        // Mark as completed
        await supabase
          .from('wallet_transactions')
          .update({ status: 'completed' })
          .eq('id', batch.id);

        // Fetch fresh balance
        const { data: freshWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('id', wallet.id)
          .single();

        const currentBalance = Number(freshWallet?.balance || 0);
        await supabase
          .from('wallets')
          .update({ balance: currentBalance + amount })
          .eq('id', wallet.id);

        // Increment creator total_earned
        const { data: creatorProfile } = await supabase
          .from('creator_profiles')
          .select('profile_id, total_earned')
          .eq('profile_id', wallet.profile_id)
          .maybeSingle();

        if (creatorProfile) {
          await supabase
            .from('creator_profiles')
            .update({ total_earned: Number(creatorProfile.total_earned || 0) + amount })
            .eq('profile_id', wallet.profile_id);
        }

        // Mark submission audits approved
        if (batch.submission_id) {
          await supabase
            .from('submission_audits')
            .update({ status: 'approved' })
            .eq('submission_id', batch.submission_id)
            .eq('status', 'auto_approved');
        }

        releasedCount++;
        totalReleased += amount;
      }

      console.log(`[Settlement Engine] Successfully released ${releasedCount} batch(es) totaling ₦${totalReleased.toLocaleString()} to Available Balance.`);
    }

    console.log('[Settlement Engine] Run finished successfully.');
  } catch (err) {
    console.error('[Settlement Engine] Unhandled error during settlement:', err);
    process.exit(1);
  }
}

runSettlement();
