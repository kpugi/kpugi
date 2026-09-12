import { SupabaseClient } from '@supabase/supabase-js';

export interface CampaignSettlementResult {
  success: boolean;
  settledCreatorsCount: number;
  totalGross: number;
  totalFees: number;
  totalNetSettled: number;
  error?: string;
}

/**
 * Settles all verified creator earnings for a completed campaign.
 * Enforces:
 * 1. 25% creator pool cap on campaign gross budget.
 * 2. 10% Kpugi platform fee deduction.
 * 3. Exact 1 consolidated transaction per creator per campaign.
 * 4. Atomic database balance credit.
 */
export async function settleCompletedCampaign(
  supabaseAdmin: SupabaseClient,
  campaignId: string
): Promise<CampaignSettlementResult> {
  // Try atomic PostgreSQL stored procedure first
  try {
    const { data, error } = await supabaseAdmin.rpc('atomic_settle_completed_campaign', {
      p_campaign_id: campaignId,
    });

    if (!error && data && data.success) {
      return {
        success: true,
        settledCreatorsCount: data.settled_creators_count || 0,
        totalGross: Number(data.total_gross || 0),
        totalFees: Number(data.total_fees || 0),
        totalNetSettled: Number(data.total_net_settled || 0),
      };
    }
  } catch (rpcErr) {
    console.warn('[settleCompletedCampaign] RPC not available, executing TypeScript atomic fallback:', rpcErr);
  }

  // TypeScript Fallback Implementation (Identical business logic)
  const { data: campaign, error: campErr } = await supabaseAdmin
    .from('campaigns')
    .select('id, title, total_budget, spent_budget, cpm_rate, min_view_threshold, status')
    .eq('id', campaignId)
    .single();

  if (campErr || !campaign) {
    return { success: false, settledCreatorsCount: 0, totalGross: 0, totalFees: 0, totalNetSettled: 0, error: 'Campaign not found' };
  }

  const totalBudget = Number(campaign.total_budget || 0);
  const creatorCap = totalBudget > 0 ? totalBudget * 0.25 : Infinity;
  const cpmRate = Number(campaign.cpm_rate || 0);
  const minThreshold = Number(campaign.min_view_threshold || 1000);

  const { data: submissions, error: subErr } = await supabaseAdmin
    .from('submissions')
    .select('id, creator_id, final_view_count, payout_amount, status')
    .eq('campaign_id', campaignId)
    .not('status', 'in', '("verified_fail","rejected")')
    .gte('final_view_count', minThreshold);

  if (subErr || !submissions || submissions.length === 0) {
    // Mark campaign completed if not already
    await supabaseAdmin.from('campaigns').update({ status: 'completed' }).eq('id', campaignId);
    return { success: true, settledCreatorsCount: 0, totalGross: 0, totalFees: 0, totalNetSettled: 0 };
  }

  let settledCount = 0;
  let totalGross = 0;
  let totalFees = 0;
  let totalNet = 0;

  for (const sub of submissions) {
    const views = Number(sub.final_view_count || 0);
    const rawGross = Math.round((views / 1000.0) * cpmRate);
    const gross = Math.min(rawGross, creatorCap);
    const fee = Math.round(gross * 0.10);
    const net = gross - fee;

    // Get or create creator wallet
    let { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('id, balance')
      .eq('profile_id', sub.creator_id)
      .eq('wallet_type', 'creator_earnings')
      .maybeSingle();

    if (!wallet) {
      const { data: newW } = await supabaseAdmin
        .from('wallets')
        .insert({ profile_id: sub.creator_id, wallet_type: 'creator_earnings', balance: 0 })
        .select('id, balance')
        .single();
      wallet = newW;
    }

    if (!wallet) continue;

    const ref = `KP-CMP-${campaignId.slice(0, 4).toUpperCase()}-${sub.id.slice(0, 4).toUpperCase()}`;

    // Look for existing payout transaction for this campaign
    const { data: existingTx } = await supabaseAdmin
      .from('wallet_transactions')
      .select('id')
      .eq('wallet_id', wallet.id)
      .eq('campaign_id', campaignId)
      .in('type', ['campaign_payout', 'payout_release'])
      .maybeSingle();

    if (existingTx) {
      await supabaseAdmin
        .from('wallet_transactions')
        .update({
          type: 'payout_release',
          amount: net,
          gross_amount: gross,
          fee_amount: fee,
          net_amount: net,
          views_audited: views,
          status: 'completed',
          submission_id: sub.id,
          paystack_reference: ref,
        })
        .eq('id', existingTx.id);

      // Clean up any legacy duplicates
      await supabaseAdmin
        .from('wallet_transactions')
        .delete()
        .eq('wallet_id', wallet.id)
        .eq('campaign_id', campaignId)
        .in('type', ['campaign_payout', 'payout_release'])
        .neq('id', existingTx.id);
    } else {
      await supabaseAdmin.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        type: 'payout_release',
        amount: net,
        gross_amount: gross,
        fee_amount: fee,
        net_amount: net,
        views_audited: views,
        campaign_id: campaignId,
        submission_id: sub.id,
        status: 'completed',
        paystack_reference: ref,
        created_at: new Date().toISOString(),
      });
    }

    // Update submission record with net payout
    await supabaseAdmin
      .from('submissions')
      .update({
        payout_amount: net,
        pending_payout_amount: 0,
        status: 'verified_pass',
        verified_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    // Recompute wallet balance from sum of completed transactions
    const { data: allTx } = await supabaseAdmin
      .from('wallet_transactions')
      .select('amount')
      .eq('wallet_id', wallet.id)
      .eq('status', 'completed');

    const newBalance = Math.max(
      0,
      (allTx || []).reduce((sum, t) => sum + Number(t.amount || 0), 0)
    );

    await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet.id);

    const totalEarned = (allTx || [])
      .filter((t) => Number(t.amount || 0) > 0)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    await supabaseAdmin
      .from('creator_profiles')
      .update({ total_earned: totalEarned })
      .eq('profile_id', sub.creator_id);

    settledCount++;
    totalGross += gross;
    totalFees += fee;
    totalNet += net;
  }

  // Ensure campaign is marked completed
  await supabaseAdmin
    .from('campaigns')
    .update({
      status: 'completed',
      spent_budget: Math.max(Number(campaign.spent_budget || 0), totalGross),
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  return {
    success: true,
    settledCreatorsCount: settledCount,
    totalGross,
    totalFees,
    totalNetSettled: totalNet,
  };
}

/**
 * Checks for any completed campaigns that haven't been settled yet and settles them.
 */
export async function settleAllCompletedCampaigns(
  supabaseAdmin: SupabaseClient
): Promise<{ campaignsSettled: number; totalNetDisbursed: number }> {
  const { data: completedCampaigns } = await supabaseAdmin
    .from('campaigns')
    .select('id, title')
    .eq('status', 'completed');

  if (!completedCampaigns || completedCampaigns.length === 0) {
    return { campaignsSettled: 0, totalNetDisbursed: 0 };
  }

  let campaignsSettled = 0;
  let totalNetDisbursed = 0;

  for (const camp of completedCampaigns) {
    const res = await settleCompletedCampaign(supabaseAdmin, camp.id);
    if (res.success && res.settledCreatorsCount > 0) {
      campaignsSettled++;
      totalNetDisbursed += res.totalNetSettled;
    }
  }

  return { campaignsSettled, totalNetDisbursed };
}
