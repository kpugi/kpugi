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
      views_count,
      final_view_count,
      campaign:campaigns (
        id,
        advertiser_id,
        cpm_rate,
        spent_budget,
        total_budget
      )
    `)
    .eq('id', submissionId)
    .single();

  if (!sub || (sub.campaign as any)?.advertiser_id !== userProfile.profile.id) {
    return { success: false, error: 'Submission not found or access denied.' };
  }

  const campaign = sub.campaign as any;
  const views = Number(sub.final_view_count || sub.views_count || 1000);

  if (decision === 'approve') {
    const payout = Math.round((views / 1000) * Number(campaign.cpm_rate));

    // Update submission
    await supabase
      .from('submissions')
      .update({
        status: 'verified_pass',
        payout_amount: payout,
        verified_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    // Update campaign spent_budget
    await supabase
      .from('campaigns')
      .update({
        spent_budget: Number(campaign.spent_budget || 0) + payout,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaign.id);

    // Update creator wallet & total_earned
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
        created_at: new Date().toISOString(),
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
  } else {
    // Reject submission
    await supabase
      .from('submissions')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason || 'Content did not meet brand requirements.',
        verified_at: new Date().toISOString(),
      })
      .eq('id', submissionId);
  }

  revalidatePath(`/b/campaigns/${campaign.id}`);
  revalidatePath('/b/dashboard');
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
