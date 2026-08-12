'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';

// ─── 1. Create Campaign Server Action ─────────────────────────────────────────

export async function createCampaignAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: "Hol' up ✋... You gotta sign in first to get access!" };
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
    return { success: false, error: "Don't leave us hanging! 👀 Title and description need some love." };
  }

  if (totalBudget < 10000) {
    return { success: false, error: "Let's make it count 🚀... Minimum campaign budget is ₦10,000!" };
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
      error: `Bag ain't deep enough yet 💼... You got ₦${currentBalance.toLocaleString()} available but this campaign requires ₦${totalBudget.toLocaleString()}. Top up real quick!`,
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

// ─── 4. Paystack Brand Wallet Deposit Actions ─────────────────────────────────────────

/**
 * 1. Initialize Paystack Deposit Checkout
 */
export async function initializePaystackDepositAction(amount: number) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: "Hol' up ✋... You gotta sign in first to get access!" };
  }

  if (amount < 5000) {
    return { success: false, error: "Hold on now 🛑... Minimum top-up is ₦5,000! Let's get them numbers up." };
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return { success: false, error: 'Paystack Secret Key is missing in environment variables.' };
  }

  const reference = `KPG-PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${baseUrl}/b/wallet`;

  try {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userProfile.profile.email || 'brand@kpugi.com',
        amount: Math.round(amount * 100), // convert NGN to kobo
        reference: reference,
        callback_url: callbackUrl,
        metadata: {
          profile_id: userProfile.profile.id,
          wallet_type: 'advertiser_funding',
          deposit_amount: amount,
        },
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.status) {
      console.error('[Paystack Initialize] Error:', json);
      return { success: false, error: json.message || 'Paystack initialization failed.' };
    }

    return {
      success: true,
      authorization_url: json.data.authorization_url,
      access_code: json.data.access_code,
      reference: json.data.reference,
    };
  } catch (err: any) {
    console.error('[Paystack Initialize] Exception:', err);
    return { success: false, error: err?.message || 'Network error connecting to Paystack.' };
  }
}

/**
 * 2. Verify Paystack Deposit Reference & Credit Wallet (Idempotent)
 */
export async function verifyPaystackDepositAction(reference: string, shouldRevalidate: boolean = true) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return { success: false, error: 'Paystack Secret Key missing.' };
  }

  const profileId = userProfile.profile.id;
  const supabase = createAdminClient();

  // 1. Database-Level Idempotency Check: Prevent Double Crediting
  const { data: existingTx } = await supabase
    .from('wallet_transactions')
    .select('id, amount, status')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (existingTx) {
    return {
      success: existingTx.status === 'completed',
      alreadyProcessed: true,
      amount: Number(existingTx.amount),
      status: existingTx.status || 'completed',
    };
  }

  try {
    // 2. Verify with Paystack API
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const json = await res.json();
    const paystackData = json.data;
    const amountNGN = paystackData?.amount ? Number(paystackData.amount) / 100 : 0;

    // 3. Get or create advertiser funding wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('profile_id', profileId)
      .eq('wallet_type', 'advertiser_funding')
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet, error: walletCreateErr } = await supabase
        .from('wallets')
        .insert({
          profile_id: profileId,
          wallet_type: 'advertiser_funding',
          balance: 0,
        })
        .select('id, balance')
        .single();

      if (walletCreateErr || !newWallet) {
        return { success: false, error: 'Failed to create brand wallet.' };
      }
      wallet = newWallet;
    }

    // 4. If Paystack verification fails or payment was cancelled/abandoned
    if (!res.ok || !json.status || paystackData?.status !== 'success') {
      const failedStatus = paystackData?.status === 'abandoned' ? 'cancelled' : 'failed';

      // Log cancelled/failed transaction attempt in DB
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        type: 'deposit',
        amount: amountNGN || 0,
        paystack_reference: reference,
        status: failedStatus,
        created_at: new Date().toISOString(),
      });

      if (shouldRevalidate) {
        revalidatePath('/b/wallet');
      }

      return {
        success: false,
        status: failedStatus,
        error: `Payment ${failedStatus}. No funds were deducted.`,
      };
    }

    // 5. Success Path: Update wallet balance atomically
    const newBalance = Number(wallet.balance) + amountNGN;
    await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet.id);

    // 6. Record verified transaction as 'completed'
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      type: 'deposit',
      amount: amountNGN,
      paystack_reference: reference,
      status: 'completed',
      created_at: new Date().toISOString(),
    });

    // 7. Trigger Notifications (Knock In-App + Resend Email)
    const recipientEmail = userProfile.profile.email || paystackData?.customer?.email;
    if (recipientEmail) {
      const { notifyAdvertiserWalletFunded } = await import('@/lib/notifications/advertiser');
      notifyAdvertiserWalletFunded({
        clerkId: userProfile.profile.clerk_id,
        email: recipientEmail,
        amount: amountNGN,
        newBalance,
        reference,
        profileId,
      }).catch((err) => console.error('[Paystack Deposit Notification Error]:', err));
    }

    if (shouldRevalidate) {
      revalidatePath('/b/wallet');
      revalidatePath('/b/dashboard');
    }

    return { success: true, amount: amountNGN, reference, status: 'completed' };
  } catch (err: any) {
    console.error('[verifyPaystackDepositAction] Error:', err);
    return { success: false, error: err?.message || 'Error verifying Paystack transaction' };
  }
}

/**
 * 3. Log Cancelled Paystack Deposit Attempt in History
 */
export async function logCancelledPaystackDepositAction(reference: string, amount: number) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) return { success: false };

  const supabase = createAdminClient();

  // Check if reference already logged
  const { data: existing } = await supabase
    .from('wallet_transactions')
    .select('id')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (existing) return { success: true };

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'advertiser_funding')
    .maybeSingle();

  if (!wallet) return { success: false };

  await supabase.from('wallet_transactions').insert({
    wallet_id: wallet.id,
    type: 'deposit',
    amount: amount,
    paystack_reference: reference,
    status: 'cancelled',
    created_at: new Date().toISOString(),
  });

  revalidatePath('/b/wallet');
  return { success: true };
}

/**
 * 3. Legacy Direct Deposit Action (Deprecated - uses verifyPaystackDepositAction)
 */
export async function depositBrandFundsAction(formData: FormData) {
  const reference = (formData.get('reference') as string || '').trim();
  if (reference) {
    return await verifyPaystackDepositAction(reference);
  }
  return { success: false, error: "No shortcuts here! 🙅‍♂️ All deposits gotta go through Paystack popup." };
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
