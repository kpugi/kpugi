import { SupabaseClient } from '@supabase/supabase-js';

export interface BatchSettlementResult {
  batchesCreated: number;
  totalAccrualSettled: number;
  batchesMatured: number;
  totalAmountMatured: number;
}

/**
 * Collates today's in-cycle accrued earnings into a daily 24-hour pending escrow batch.
 * Runs at the End-of-Day (00:00 midnight cutoff) or when triggered.
 */
export async function processDailyBatchSettlement(
  supabaseAdmin: SupabaseClient,
  creatorProfileId?: string
): Promise<{ batchesCreated: number; totalAccrualSettled: number }> {
  let query = supabaseAdmin
    .from('submissions')
    .select('id, campaign_id, creator_id, final_view_count, last_paid_view_count, pending_payout_amount, payout_amount, campaigns!inner(title, spent_budget)')
    .gt('pending_payout_amount', 0);

  if (creatorProfileId) {
    query = query.eq('creator_id', creatorProfileId);
  }

  const { data: unbatchedSubs, error } = await query;
  if (error || !unbatchedSubs || unbatchedSubs.length === 0) {
    return { batchesCreated: 0, totalAccrualSettled: 0 };
  }

  const now = new Date();
  const clearsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  let batchesCreated = 0;
  let totalAccrualSettled = 0;

  // Group by (creator_id, campaign_id)
  const grouped: Record<string, typeof unbatchedSubs> = {};
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

    // 1. Get or create creator wallet
    let { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('id, balance')
      .eq('profile_id', creatorId)
      .eq('wallet_type', 'creator_earnings')
      .maybeSingle();

    if (!wallet) {
      const { data: newW } = await supabaseAdmin
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

    const ref = `KP-EOD-${Date.now().toString(36).toUpperCase()}-${campaignId.slice(0, 4).toUpperCase()}`;

    // 2. Insert single Daily Batch transaction in 24h Escrow (status: 'clearing')
    const { error: txErr } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'payout_release',
        amount: totalBatchAmount,
        campaign_id: campaignId,
        submission_id: firstSub.id,
        status: 'clearing',
        clears_at: clearsAt,
        paystack_reference: ref,
      });

    if (txErr) {
      console.error('[Settlement Engine] Error inserting batch tx:', txErr);
      continue;
    }

    // 3. Insert immutable submission audit records for each submission in the batch
    for (const sub of subs) {
      const viewsScraped = Number(sub.final_view_count || 0);
      const lastPaidViews = Number(sub.last_paid_view_count || 0);
      const viewsDelta = Math.max(0, viewsScraped - lastPaidViews);
      const payoutForSub = Number(sub.pending_payout_amount || 0);

      await supabaseAdmin.from('submission_audits').insert({
        submission_id: sub.id,
        campaign_id: campaignId,
        creator_id: creatorId,
        views_scraped: viewsScraped,
        views_delta: viewsDelta,
        payout_amount: payoutForSub,
        status: 'auto_approved',
        settled_at: now.toISOString(),
      });

      // 4. Update submission record (reset pending accrual, increment payout_amount)
      await supabaseAdmin
        .from('submissions')
        .update({
          last_paid_view_count: viewsScraped,
          payout_amount: Number(sub.payout_amount || 0) + payoutForSub,
          pending_payout_amount: 0,
          auto_approve_at: null,
        })
        .eq('id', sub.id);
    }

    // 5. Update campaign spent budget
    const currentSpent = Number((firstSub.campaigns as any)?.spent_budget || 0);
    await supabaseAdmin
      .from('campaigns')
      .update({
        spent_budget: currentSpent + totalBatchAmount,
      })
      .eq('id', campaignId);

    batchesCreated++;
    totalAccrualSettled += totalBatchAmount;
  }

  return { batchesCreated, totalAccrualSettled };
}

/**
 * Releases matured 24-hour escrow batches into the creator's Available Wallet Balance.
 * Runs continuously on-demand or via cron.
 */
export async function autoReleaseMaturedBatches(
  supabaseAdmin: SupabaseClient,
  creatorProfileId?: string
): Promise<{ batchesMatured: number; totalAmountMatured: number }> {
  const nowIso = new Date().toISOString();

  let query = supabaseAdmin
    .from('wallet_transactions')
    .select('id, wallet_id, amount, campaign_id, submission_id, clears_at, wallets:wallet_id(id, profile_id, balance)')
    .eq('status', 'clearing')
    .lte('clears_at', nowIso);

  if (creatorProfileId) {
    const { data: cw } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('profile_id', creatorProfileId)
      .eq('wallet_type', 'creator_earnings')
      .maybeSingle();

    if (cw) {
      query = query.eq('wallet_id', cw.id);
    }
  }

  const { data: maturedBatches, error } = await query;
  if (error || !maturedBatches || maturedBatches.length === 0) {
    return { batchesMatured: 0, totalAmountMatured: 0 };
  }

  let batchesMatured = 0;
  let totalAmountMatured = 0;

  for (const batch of maturedBatches) {
    const amount = Number(batch.amount || 0);
    const wallet = batch.wallets as any;
    if (!wallet || amount <= 0) continue;

    // 1. Mark batch transaction as completed
    await supabaseAdmin
      .from('wallet_transactions')
      .update({ status: 'completed' })
      .eq('id', batch.id);

    // 2. Credit creator wallet balance
    const currentBalance = Number(wallet.balance || 0);
    await supabaseAdmin
      .from('wallets')
      .update({ balance: currentBalance + amount })
      .eq('id', wallet.id);

    // 3. Increment creator total_earned
    const { data: creatorProfile } = await supabaseAdmin
      .from('creator_profiles')
      .select('profile_id, total_earned')
      .eq('profile_id', wallet.profile_id)
      .maybeSingle();

    if (creatorProfile) {
      await supabaseAdmin
        .from('creator_profiles')
        .update({ total_earned: Number(creatorProfile.total_earned || 0) + amount })
        .eq('profile_id', wallet.profile_id);
    }

    // 4. Update corresponding submission_audits to 'approved'
    if (batch.submission_id) {
      await supabaseAdmin
        .from('submission_audits')
        .update({ status: 'approved' })
        .eq('submission_id', batch.submission_id)
        .eq('status', 'auto_approved');
    }

    batchesMatured++;
    totalAmountMatured += amount;
  }

  return { batchesMatured, totalAmountMatured };
}
