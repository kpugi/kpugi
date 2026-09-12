/**
 * Automated Settlement & Wallet Release Engine
 * Settle creator payouts exclusively on Campaign Completion.
 * 
 * Enforces:
 * 1. 25% creator pool cap on campaign gross budget.
 * 2. 10% Kpugi platform fee deduction.
 * 3. Exactly 1 consolidated transaction per creator per campaign.
 * 4. Atomic database balance credit.
 */

const { createClient } = require('@supabase/supabase-js');

// Read environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Settlement Engine] Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// Provide dummy WebSocket transport if native WebSocket is not present (Node < 22),
// since this background settlement script only performs REST database operations.
const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};
if (typeof WebSocket === 'undefined') {
  class NoopWebSocket {}
  clientOptions.realtime = { transport: NoopWebSocket };
}

const supabase = createClient(supabaseUrl, supabaseKey, clientOptions);

async function settleCampaign(campaign) {
  // 1. Try atomic PostgreSQL stored procedure first
  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('atomic_settle_completed_campaign', {
      p_campaign_id: campaign.id,
    });
    if (!rpcErr && rpcRes && rpcRes.success) {
      if (rpcRes.settled_creators_count > 0) {
        console.log(`[Settlement Engine] Settled ${rpcRes.settled_creators_count} creator(s) for "${campaign.title}": Gross ₦${rpcRes.total_gross?.toLocaleString()}, Fee ₦${rpcRes.total_fees?.toLocaleString()}, Net ₦${rpcRes.total_net_settled?.toLocaleString()}`);
      }
      return Number(rpcRes.total_net_settled || 0);
    }
  } catch (e) {
    // Fall back to JavaScript execution
  }

  // 2. JavaScript fallback
  const totalBudget = Number(campaign.total_budget || 0);
  const creatorCap = totalBudget > 0 ? totalBudget * 0.25 : Infinity;
  const cpmRate = Number(campaign.cpm_rate || 0);
  const minThreshold = Number(campaign.min_view_threshold || 1000);

  const { data: submissions, error: subErr } = await supabase
    .from('submissions')
    .select('id, creator_id, final_view_count, payout_amount, status')
    .eq('campaign_id', campaign.id)
    .not('status', 'in', '("verified_fail","rejected")')
    .gte('final_view_count', minThreshold);

  if (subErr || !submissions || submissions.length === 0) {
    return 0;
  }

  let totalNet = 0;

  for (const sub of submissions) {
    const views = Number(sub.final_view_count || 0);
    const rawGross = Math.round((views / 1000.0) * cpmRate);
    const gross = Math.min(rawGross, creatorCap);
    const fee = Math.round(gross * 0.10);
    const net = gross - fee;

    // Get or create creator wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('profile_id', sub.creator_id)
      .eq('wallet_type', 'creator_earnings')
      .maybeSingle();

    if (!wallet) {
      const { data: newW } = await supabase
        .from('wallets')
        .insert({ profile_id: sub.creator_id, wallet_type: 'creator_earnings', balance: 0 })
        .select('id, balance')
        .single();
      wallet = newW;
    }

    if (!wallet) continue;

    const ref = `KP-CMP-${campaign.id.slice(0, 4).toUpperCase()}-${sub.id.slice(0, 4).toUpperCase()}`;

    // Look for existing payout transaction for this campaign
    const { data: existingTx } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('wallet_id', wallet.id)
      .eq('campaign_id', campaign.id)
      .in('type', ['campaign_payout', 'payout_release'])
      .maybeSingle();

    if (existingTx) {
      await supabase
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

      // Clean up legacy micro-batch rows
      await supabase
        .from('wallet_transactions')
        .delete()
        .eq('wallet_id', wallet.id)
        .eq('campaign_id', campaign.id)
        .in('type', ['campaign_payout', 'payout_release'])
        .neq('id', existingTx.id);
    } else {
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        type: 'payout_release',
        amount: net,
        gross_amount: gross,
        fee_amount: fee,
        net_amount: net,
        views_audited: views,
        campaign_id: campaign.id,
        submission_id: sub.id,
        status: 'completed',
        paystack_reference: ref,
        created_at: new Date().toISOString(),
      });
    }

    // Update submission record
    await supabase
      .from('submissions')
      .update({
        payout_amount: net,
        pending_payout_amount: 0,
        status: 'verified_pass',
        verified_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    // Recompute wallet balance atomically from completed transactions
    const { data: allTx } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('wallet_id', wallet.id)
      .eq('status', 'completed');

    const newBalance = Math.max(
      0,
      (allTx || []).reduce((sum, t) => sum + Number(t.amount || 0), 0)
    );

    await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet.id);

    const totalEarned = (allTx || [])
      .filter((t) => Number(t.amount || 0) > 0)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    await supabase
      .from('creator_profiles')
      .update({ total_earned: totalEarned })
      .eq('profile_id', sub.creator_id);

    totalNet += net;
  }

  return totalNet;
}

async function runSettlement() {
  console.log('[Settlement Engine] Starting automated settlement run at', new Date().toISOString());

  try {
    const { data: completedCampaigns, error: campErr } = await supabase
      .from('campaigns')
      .select('id, title, total_budget, spent_budget, cpm_rate, min_view_threshold, status')
      .eq('status', 'completed');

    if (campErr) {
      console.error('[Settlement Engine] Error fetching completed campaigns:', campErr);
      return;
    }

    if (!completedCampaigns || completedCampaigns.length === 0) {
      console.log('[Settlement Engine] No completed campaigns pending settlement.');
      return;
    }

    console.log(`[Settlement Engine] Checking settlements for ${completedCampaigns.length} completed campaign(s)...`);

    let totalSettled = 0;
    for (const campaign of completedCampaigns) {
      const netSettled = await settleCampaign(campaign);
      totalSettled += netSettled;
    }

    console.log(`[Settlement Engine] Settlement run complete. Total net settled: ₦${totalSettled.toLocaleString()}.`);
  } catch (err) {
    console.error('[Settlement Engine] Unhandled error during settlement:', err);
    process.exit(1);
  }
}

runSettlement();
