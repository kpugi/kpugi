'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';

// ─── 1. Create Campaign Server Action ─────────────────────────────────────────

export async function createCampaignAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  if (userProfile.role !== 'advertiser' && !userProfile.advertiserProfile) {
    return { success: false, error: 'Only registered brand partners can launch campaigns.' };
  }

  const title = (formData.get('title') as string || '').trim().slice(0, 100);
  const description = (formData.get('description') as string || '').trim().slice(0, 2000);
  const adFormat = (formData.get('adFormat') as string || 'Video Overlay').trim();
  const cpmRate = Number(formData.get('cpmRate') || 0);
  const totalBudget = Number(formData.get('totalBudget') || 0);
  const minViewThreshold = Number(formData.get('minViewThreshold') || 1000);
  const channelsRaw = (formData.get('channels') as string || 'TikTok,Instagram,YouTube,X').split(',');

  if (!title || !description) {
    return { success: false, error: 'Campaign title and description are required.' };
  }

  if (totalBudget < 10000) {
    return { success: false, error: 'Minimum campaign budget is ₦10,000.' };
  }

  if (cpmRate < 100) {
    return { success: false, error: 'Minimum CPM rate is ₦100 per 1,000 views.' };
  }

  const supabase = createAdminClient();

  // 1. Verify Advertiser Wallet Balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'advertiser_funding')
    .maybeSingle();

  const currentBalance = Number(wallet?.balance || 0);
  if (currentBalance < totalBudget) {
    return {
      success: false,
      error: `Insufficient brand funding balance. Available: ₦${currentBalance.toLocaleString()}, Required: ₦${totalBudget.toLocaleString()}. Please deposit funds first.`,
    };
  }

  // 2. Atomic Wallet Deduction for Escrow Commitment
  const newBalance = currentBalance - totalBudget;
  const { error: walletError } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', wallet!.id)
    .gte('balance', totalBudget);

  if (walletError) {
    return { success: false, error: 'Failed to lock campaign budget from wallet balance. Please try again.' };
  }

  // 3. Generate Unique Campaign Code
  const code = `KPG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // 4. Insert Campaign Record
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      advertiser_id: userProfile.profile.id,
      title,
      campaign_code: code,
      description,
      ad_format: adFormat,
      cpm_rate: cpmRate,
      total_budget: totalBudget,
      reserved_budget: totalBudget,
      spent_budget: 0,
      min_view_threshold: minViewThreshold,
      required_live_duration_hours: 72,
      verification_grace_hours: 24,
      status: 'live',
      channels: channelsRaw.map((c) => c.trim().toLowerCase()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (campaignError || !campaign) {
    // Refund wallet if campaign creation fails
    await supabase
      .from('wallets')
      .update({ balance: currentBalance })
      .eq('id', wallet!.id);

    return { success: false, error: 'Failed to launch campaign. Budget has been restored to your wallet.' };
  }

  // 5. Record Wallet Escrow Allocation Transaction
  await supabase.from('wallet_transactions').insert({
    profile_id: userProfile.profile.id,
    wallet_type: 'advertiser_funding',
    transaction_type: 'campaign_allocation',
    amount: totalBudget,
    status: 'completed',
    reference: `KP-ESC-${Date.now().toString().slice(-6)}`,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/b/campaigns');
  revalidatePath('/b/dashboard');
  revalidatePath('/b/wallet');
  return { success: true, campaignId: campaign.id };
}

// ─── 2. Update Campaign Status Action ─────────────────────────────────────────

export async function updateCampaignStatusAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const campaignId = (formData.get('campaignId') as string || '').trim();
  const newStatus = (formData.get('status') as string || '').trim();

  if (!campaignId || !['live', 'paused', 'completed'].includes(newStatus)) {
    return { success: false, error: 'Invalid campaign status request.' };
  }

  const supabase = createAdminClient();

  // Fetch campaign
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, advertiser_id, total_budget, spent_budget, status')
    .eq('id', campaignId)
    .eq('advertiser_id', userProfile.profile.id)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found or access denied.' };
  }

  // If concluding/completing campaign, refund remaining unspent budget to brand wallet
  if (newStatus === 'completed' && campaign.status !== 'completed') {
    const unspentBudget = Math.max(0, Number(campaign.total_budget) - Number(campaign.spent_budget));

    if (unspentBudget > 0) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('profile_id', userProfile.profile.id)
        .eq('wallet_type', 'advertiser_funding')
        .single();

      if (wallet) {
        await supabase
          .from('wallets')
          .update({ balance: Number(wallet.balance) + unspentBudget })
          .eq('id', wallet.id);

        await supabase.from('wallet_transactions').insert({
          profile_id: userProfile.profile.id,
          wallet_type: 'advertiser_funding',
          transaction_type: 'unspent_refund',
          amount: unspentBudget,
          status: 'completed',
          reference: `KP-RFD-${Date.now().toString().slice(-6)}`,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  const { error } = await supabase
    .from('campaigns')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  if (error) {
    return { success: false, error: 'Failed to update campaign status.' };
  }

  revalidatePath(`/b/campaigns/${campaignId}`);
  revalidatePath('/b/campaigns');
  revalidatePath('/b/dashboard');
  revalidatePath('/b/wallet');
  return { success: true };
}

// ─── 3. Review Creator Submission Action ─────────────────────────────────────

export async function reviewCreatorSubmissionAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const submissionId = (formData.get('submissionId') as string || '').trim();
  const decision = (formData.get('decision') as string || '').trim(); // 'approve' | 'reject'
  const rejectionReason = (formData.get('rejectionReason') as string || '').trim().slice(0, 300);

  if (!submissionId || !['approve', 'reject'].includes(decision)) {
    return { success: false, error: 'Invalid submission review decision.' };
  }

  const supabase = createAdminClient();

  // Fetch submission & campaign details
  const { data: sub } = await supabase
    .from('submissions')
    .select(`
      id,
      creator_id,
      campaign_id,
      reserved_amount,
      final_view_count,
      pending_payout_amount,
      payout_amount,
      last_paid_view_count,
      max_verified_views,
      status,
      auto_approve_at,
      campaign:campaigns (
        id,
        advertiser_id,
        cpm_rate,
        spent_budget,
        total_budget,
        reserved_budget
      )
    `)
    .eq('id', submissionId)
    .single();

  if (!sub || (sub.campaign as any)?.advertiser_id !== userProfile.profile.id) {
    return { success: false, error: 'Submission not found or access denied.' };
  }

  const campaign = sub.campaign as any;
  const views = Number(sub.final_view_count || 0);
  const reservedAmount = Number(sub.reserved_amount || 0);
  const currentReservedBudget = Number(campaign.reserved_budget || 0);
  const maxVerifiedViews = Math.max(Number(sub.max_verified_views || 0), Number(sub.last_paid_view_count || 0));

  // IDEMPOTENCY GUARD: Prevent approving 0 views or 0 payout submissions
  const pendingPayout = Number(sub.pending_payout_amount || 0);
  if (decision === 'approve') {
    if (views <= 0) {
      return { success: false, error: 'Cannot approve payout for a submission with 0 views. Submission requires verified views to process payout.' };
    }
    if (pendingPayout <= 0 && views <= maxVerifiedViews && (sub.status === 'verified_pass' || sub.status === 'paid')) {
      return { success: false, error: 'This audit cycle has already been approved and settled.' };
    }
  }

  // Calculate incremental payout for this cycle based on net-new verified views
  const netNewViews = Math.max(0, views - maxVerifiedViews);
  const payout = pendingPayout > 0 ? pendingPayout : Math.round((netNewViews / 1000) * Number(campaign.cpm_rate));
  const now = new Date().toISOString();

  if (decision === 'approve') {
    if (payout <= 0) {
      return { success: false, error: 'No new payable views delivered since last settled audit run.' };
    }

    const newTotalPayout = Number(sub.payout_amount || 0) + payout;
    const newReservedBudget = Math.max(0, currentReservedBudget - payout);

    // 1. Update submission
    await supabase
      .from('submissions')
      .update({
        status: 'verified_pass',
        payout_amount: newTotalPayout,
        last_paid_view_count: views,
        max_verified_views: Math.max(views, maxVerifiedViews),
        pending_payout_amount: 0,
        auto_approve_at: null,
        paid_at: now,
        verified_at: now,
      })
      .eq('id', submissionId);

    // 2. Update campaign spent_budget and deduct from reserved_budget
    await supabase
      .from('campaigns')
      .update({
        spent_budget: Number(campaign.spent_budget || 0) + payout,
        reserved_budget: newReservedBudget,
        updated_at: now,
      })
      .eq('id', campaign.id);

    // 3. Update creator wallet & total_earned
    const { data: creatorWallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('profile_id', sub.creator_id)
      .eq('wallet_type', 'creator_earnings')
      .maybeSingle();

    if (creatorWallet) {
      await supabase
        .from('wallets')
        .update({ balance: Number(creatorWallet.balance || 0) + payout })
        .eq('id', creatorWallet.id);

      await supabase.from('wallet_transactions').insert({
        profile_id: sub.creator_id,
        creator_id: sub.creator_id,
        wallet_type: 'creator_earnings',
        transaction_type: 'payout',
        amount: payout,
        status: 'completed',
        reference: `KP-PAY-${Date.now().toString().slice(-6)}`,
        created_at: now,
      });
    }

    const { data: creatorProf } = await supabase
      .from('creator_profiles')
      .select('total_earned')
      .eq('profile_id', sub.creator_id)
      .maybeSingle();

    if (creatorProf) {
      await supabase
        .from('creator_profiles')
        .update({ total_earned: Number(creatorProf.total_earned || 0) + payout })
        .eq('profile_id', sub.creator_id);
    }

    // 4. Log immutable Audit History Record
    await supabase.from('submission_audits').insert({
      submission_id: sub.id,
      campaign_id: campaign.id,
      creator_id: sub.creator_id,
      views_scraped: views,
      views_delta: netNewViews,
      payout_amount: payout,
      status: 'approved',
      settled_at: now,
    });
  } else {
    // Reject submission & release reserved_budget
    const newReservedBudget = Math.max(0, currentReservedBudget - reservedAmount);

    await supabase
      .from('submissions')
      .update({
        status: 'rejected',
        pending_payout_amount: 0,
        auto_approve_at: null,
        failure_reason: rejectionReason || 'Content did not meet brand requirements.',
        verified_at: now,
      })
      .eq('id', submissionId);

    await supabase
      .from('campaigns')
      .update({
        reserved_budget: newReservedBudget,
        updated_at: now,
      })
      .eq('id', campaign.id);

    // Log immutable Audit History Record
    await supabase.from('submission_audits').insert({
      submission_id: sub.id,
      campaign_id: campaign.id,
      creator_id: sub.creator_id,
      views_scraped: views,
      views_delta: 0,
      payout_amount: 0,
      status: 'rejected',
      failure_reason: rejectionReason || 'Content did not meet brand requirements.',
      settled_at: now,
    });
  }

  // Revalidate advertiser and creator views so changes reflect across the platform immediately
  revalidatePath(`/b/campaigns/${campaign.id}`);
  revalidatePath('/b/campaigns');
  revalidatePath('/b/dashboard');
  revalidatePath('/b/analytics');
  revalidatePath('/b/wallet');
  revalidatePath(`/c/campaigns/${campaign.id}`);
  revalidatePath('/c/campaigns');
  revalidatePath('/c/dashboard');
  revalidatePath('/c/earnings');
  revalidatePath('/c/wallet');
  revalidatePath(`/campaigns/${campaign.id}`);
  revalidatePath('/browse');
  return { success: true };
}

// ─── 4. Deposit Brand Funds Action ─────────────────────────────────────────

export async function depositBrandFundsAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const amount = Number(formData.get('amount') || 0);
  const reference = (formData.get('reference') as string || `KP-DEP-${Date.now()}`).trim();

  if (amount < 5000) {
    return { success: false, error: 'Minimum funding deposit amount is ₦5,000.' };
  }

  const supabase = createAdminClient();

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'advertiser_funding')
    .single();

  if (!wallet) {
    return { success: false, error: 'Brand wallet not found.' };
  }

  // Credit balance
  await supabase
    .from('wallets')
    .update({ balance: Number(wallet.balance) + amount })
    .eq('id', wallet.id);

  // Record transaction
  await supabase.from('wallet_transactions').insert({
    profile_id: userProfile.profile.id,
    wallet_type: 'advertiser_funding',
    transaction_type: 'deposit',
    amount: amount,
    status: 'completed',
    reference: reference,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/b/wallet');
  revalidatePath('/b/dashboard');
  return { success: true };
}

// ─── 5. Update Brand Profile Details Action ────────────────────────────────

export async function updateBrandProfileDetailsAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const companyName = (formData.get('companyName') as string || '').trim().slice(0, 100);
  const industry = (formData.get('industry') as string || 'E-commerce').trim().slice(0, 50);
  const websiteUrl = (formData.get('websiteUrl') as string || '').trim().slice(0, 200);

  if (!companyName) {
    return { success: false, error: 'Company Name is required.' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('advertiser_profiles')
    .update({
      company_name: companyName,
      industry: industry,
      website_url: websiteUrl,
    })
    .eq('profile_id', userProfile.profile.id);

  if (error) {
    return { success: false, error: 'Failed to update brand profile.' };
  }

  revalidatePath('/b/settings');
  revalidatePath('/b/dashboard');
  return { success: true };
}
