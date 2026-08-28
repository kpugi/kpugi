'use server';

import { revalidatePath } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { uploadCampaignImageToStorage } from '@/lib/supabase/storage';
import {
  notifyCreatorVerificationPassed,
  notifyCreatorVerificationFailed,
  notifyJoinedCreatorsCampaignCompleted,
} from '@/lib/notifications/creator';
import { notifyAdvertiserCampaignCompleted } from '@/lib/notifications/advertiser';
import { triggerNotification } from '@/lib/knock/notify';

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
  const escrowRef = `KPG-PAY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const { error: txError } = await supabase.from('wallet_transactions').insert({
    wallet_id: wallet!.id,
    type: 'campaign_funding',
    amount: totalBudget,
    campaign_id: campaign.id,
    status: 'completed',
    paystack_reference: escrowRef,
    created_at: new Date().toISOString(),
  });

  if (txError) {
    console.error('[createCampaignAction] wallet_transactions insert failed:', txError);
  }

  // 6. Write payment_receipts row for full lookup
  await supabase.from('payment_receipts').insert({
    receipt_number: escrowRef,
    advertiser_id: userProfile.profile.id,
    campaign_id: campaign.id,
    campaign_title: title,
    total_amount: totalBudget,
    escrow_budget: totalBudget,
    featured_fee: 0,
    is_featured: false,
    payment_method: 'wallet',
    paystack_reference: escrowRef,
    transaction_type: 'campaign_funding',
    status: 'paid',
  }).then(({ error: rErr }) => {
    if (rErr) console.error('[createCampaignAction] payment_receipts insert failed:', rErr);
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
    .select('id, title, advertiser_id, total_budget, spent_budget, status')
    .eq('id', campaignId)
    .eq('advertiser_id', userProfile.profile.id)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found or access denied.' };
  }

  if (campaign.status === 'archived') {
    return { success: false, error: 'Archived campaigns cannot be modified.' };
  }

  if (campaign.status === 'completed') {
    return { success: false, error: 'Completed campaigns cannot be resumed or modified.' };
  }

  // Fetch all submissions to calculate actual live accrued spent budget
  const { data: campaignSubmissions } = await supabase
    .from('submissions')
    .select('payout_amount, pending_payout_amount, final_view_count')
    .eq('campaign_id', campaign.id);

  const totalAccruedSpent = campaignSubmissions?.reduce(
    (sum, s) => sum + Number(s.payout_amount || 0) + Number(s.pending_payout_amount || 0),
    0
  ) || 0;

  const liveSpentBudget = Math.max(Number(campaign.spent_budget || 0), totalAccruedSpent);

  // If concluding/completing campaign, refund remaining unspent budget to brand wallet
  if (newStatus === 'completed' && campaign.status !== 'completed') {
    const unspentBudget = Math.max(0, Number(campaign.total_budget) - liveSpentBudget);

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

        const refundRef = `KPG-PAY-RFD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await supabase.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'budget_release_refund',
          amount: unspentBudget,
          campaign_id: campaign.id,
          status: 'completed',
          paystack_reference: refundRef,
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

  // Trigger completion notifications
  if (newStatus === 'completed' && campaign.status !== 'completed') {
    try {
      const totalViews = campaignSubmissions?.reduce((sum, s) => sum + Number(s.final_view_count || 0), 0) || 0;

      // 1. Notify advertiser (brand)
      await notifyAdvertiserCampaignCompleted({
        clerkId: userProfile.profile.clerk_id,
        email: userProfile.profile.email || '',
        campaignTitle: campaign.title || 'Campaign',
        totalViews,
        totalSpent: liveSpentBudget,
        campaignId: campaign.id,
        profileId: userProfile.profile.id,
      });

      // 2. Notify all joined creators
      await notifyJoinedCreatorsCampaignCompleted({
        campaignTitle: campaign.title || 'Campaign',
        campaignId: campaign.id,
        supabaseClient: supabase,
      });
    } catch (e) {
      console.error('[updateCampaignStatusAction] Error sending completion notifications:', e);
    }
  }

  revalidatePath(`/b/campaigns/${campaignId}`);
  revalidatePath('/b/campaigns');
  revalidatePath('/b/dashboard');
  revalidatePath('/b/wallet');
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

  const reference = `KPG-PAY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
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

    // 6b. Write payment_receipts row so deposit can be looked up by KPG-PAY-* ID
    const depositReceiptNum = reference.startsWith('KPG-PAY-')
      ? reference
      : `KPG-PAY-${reference.slice(-5).toUpperCase()}`;
    await supabase.from('payment_receipts').insert({
      receipt_number: depositReceiptNum,
      advertiser_id: profileId,
      total_amount: amountNGN,
      escrow_budget: amountNGN,
      featured_fee: 0,
      is_featured: false,
      payment_method: 'paystack',
      paystack_reference: reference,
      transaction_type: 'wallet_deposit',
      advertiser_email: userProfile.profile.email || paystackData?.customer?.email || null,
      notes: `Paystack wallet top-up verified at ${new Date().toISOString()}`,
      status: 'paid',
    }).then(({ error: rErr }) => {
      // Silently skip duplicate (deposit already recorded on retry)
      if (rErr && !rErr.message.includes('duplicate')) {
        console.error('[verifyPaystackDepositAction] payment_receipts insert failed:', rErr);
      }
    });

    // 7. Trigger Notifications (Knock In-App + Resend Email)
    const recipientEmail = userProfile.profile.email || paystackData?.customer?.email;
    if (recipientEmail) {
      const { notifyAdvertiserWalletFunded } = await import('@/lib/notifications/advertiser');
      await notifyAdvertiserWalletFunded({
        clerkId: userProfile.profile.clerk_id || profileId,
        email: recipientEmail,
        amount: amountNGN,
        newBalance,
        reference,
        profileId,
      });
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
      company_website: websiteUrl,
    })
    .eq('profile_id', userProfile.profile.id);

  if (error) {
    return { success: false, error: 'Failed to update brand profile.' };
  }

  revalidatePath('/b/settings');
  revalidatePath('/b/dashboard');
  return { success: true };
}

// ─── 6. Save Advertiser Wallet Alert Settings Action ───────────────────────

export async function saveAdvertiserAlertSettingsAction(enabled: boolean, threshold: number) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('advertiser_profiles')
    .update({
      low_balance_alert_enabled: enabled,
      low_balance_alert_threshold: threshold,
    })
    .eq('profile_id', userProfile.profile.id);

  if (error) {
    console.error('[saveAdvertiserAlertSettingsAction] Error:', error);
    return { success: false, error: 'Failed to save alert preferences in the database.' };
  }

  revalidatePath('/b/wallet');
  return { success: true };
}

// ─── 7. Get Filtered Transactions Action ─────────────────────────────────────

export async function getFilteredTransactionsAction(
  walletId: string,
  type: string | null,
  startDate: string | null,
  endDate: string | null
) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const supabase = createAdminClient();

  let query = supabase
    .from('wallet_transactions')
    .select('id, wallet_id, type, amount, paystack_reference, status, created_at, campaign_id, campaign:campaigns(id, title, campaign_code)')
    .eq('wallet_id', walletId);

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  if (startDate) {
    const startIso = new Date(startDate);
    startIso.setHours(0, 0, 0, 0);
    query = query.gte('created_at', startIso.toISOString());
  }

  if (endDate) {
    const endIso = new Date(endDate);
    endIso.setHours(23, 59, 59, 999);
    query = query.lte('created_at', endIso.toISOString());
  }

  const { data: transactions, error } = await query
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[getFilteredTransactionsAction] DB error:', error);
    return { success: false, error: 'Failed to fetch filtered transactions.' };
  }

  // Map to matching raw layout structure
  const mapped = (transactions || []).map((t: any) => ({
    id: t.id,
    transaction_type: t.type || 'deposit',
    campaign_id: t.campaign_id || t.campaign?.id || null,
    campaign_title: t.campaign?.title || null,
    campaign_code: t.campaign?.campaign_code || null,
    amount: Number(t.amount),
    status: (t.status || 'completed').toUpperCase(),
    reference: t.paystack_reference || `KPG-PAY-${t.id.slice(0, 5).toUpperCase()}`,
    created_at: t.created_at,
  }));

  return { success: true, transactions: mapped };
}

// ─── 8. Get Receipt / Invoice by Reference ID ─────────────────────────────────

export async function getReceiptByIdAction(ref: string) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const supabase = createAdminClient();
  const profileId = userProfile.profile.id;

  // Look up by receipt_number OR paystack_reference, restricted to this advertiser
  const { data, error } = await supabase
    .from('payment_receipts')
    .select(`
      id,
      receipt_number,
      advertiser_id,
      campaign_id,
      campaign_title,
      total_amount,
      escrow_budget,
      featured_fee,
      is_featured,
      payment_method,
      paystack_reference,
      transaction_type,
      advertiser_email,
      notes,
      status,
      issued_at,
      created_at,
      campaign:campaigns(id, title, campaign_code)
    `)
    .eq('advertiser_id', profileId)
    .or(`receipt_number.eq.${ref},paystack_reference.eq.${ref}`)
    .maybeSingle();

  if (error) {
    console.error('[getReceiptByIdAction] DB error:', error);
    return { success: false, error: 'Failed to look up receipt. Please try again.' };
  }

  if (!data) {
    return { success: false, error: `No receipt found for reference "${ref}". Make sure the ID is correct.` };
  }

  return {
    success: true,
    receipt: {
      id: data.id,
      receipt_number: data.receipt_number,
      campaign_id: data.campaign_id,
      campaign_title: data.campaign_title || (data.campaign as any)?.title || null,
      campaign_code: (data.campaign as any)?.campaign_code || null,
      total_amount: Number(data.total_amount),
      escrow_budget: Number(data.escrow_budget),
      featured_fee: Number(data.featured_fee),
      is_featured: data.is_featured,
      payment_method: data.payment_method,
      paystack_reference: data.paystack_reference,
      transaction_type: data.transaction_type,
      advertiser_email: data.advertiser_email,
      notes: data.notes,
      status: data.status,
      issued_at: data.issued_at,
      created_at: data.created_at,
    },
  };
}

// ─── 14. Brand Settings & Clerk Synchronization Actions ─────────────────────

export async function updateBrandIdentityAction(payload: {
  companyName: string;
  companyWebsite?: string;
  industry?: string;
  tagline?: string;
  location?: string;
  logoUrl?: string;
  logoBase64?: string;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.profile) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const supabase = createAdminClient();
  const profileId = userProfile.profile.id;

  let finalLogoUrl = payload.logoUrl || null;

  // If a base64 image was uploaded, store it in Supabase storage
  if (payload.logoBase64 && payload.logoBase64.startsWith('data:')) {
    const uploadedUrl = await uploadCampaignImageToStorage(payload.logoBase64, 'brand-logos');
    if (uploadedUrl) {
      finalLogoUrl = uploadedUrl;
    }
  }

  // 1. Update advertiser_profiles
  const { error: advError } = await supabase
    .from('advertiser_profiles')
    .update({
      company_name: payload.companyName.trim(),
      company_website: payload.companyWebsite?.trim() || null,
      industry: payload.industry?.trim() || 'E-commerce',
      tagline: payload.tagline?.trim() || null,
      location: payload.location?.trim() || 'Nigeria',
      ...(finalLogoUrl ? { company_logo_url: finalLogoUrl } : {}),
      social_links: payload.socialLinks || {},
    })
    .eq('profile_id', profileId);

  if (advError) {
    console.error('[updateBrandIdentityAction] adv error:', advError);
    return { success: false, error: 'Failed to update brand profile details.' };
  }

  // 2. Update profiles table
  const { error: profError } = await supabase
    .from('profiles')
    .update({
      ...(finalLogoUrl ? { avatar_url: finalLogoUrl } : {}),
    })
    .eq('id', profileId);

  if (profError) {
    console.error('[updateBrandIdentityAction] profile error:', profError);
  }

  // 3. Two-Way Sync with Clerk Authentication
  if (userProfile.profile.clerk_id) {
    try {
      const client = await clerkClient();
      const compName = payload.companyName.trim();
      const nameParts = compName.split(' ');
      const firstName = nameParts[0] || compName;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      await client.users.updateUser(userProfile.profile.clerk_id, {
        firstName,
        ...(lastName ? { lastName } : {}),
      });
    } catch (clerkErr) {
      console.warn('[updateBrandIdentityAction] Clerk user update warning:', clerkErr);
    }
  }

  revalidatePath('/b/settings');
  revalidatePath('/b/dashboard');
  revalidatePath('/b/campaigns');
  revalidatePath('/b/wallet');
  revalidatePath('/b/analytics');
  revalidatePath('/b/creators');

  return { success: true, logoUrl: finalLogoUrl };
}

export async function updateBrandBillingContactAction(payload: {
  fullName: string;
  billingEmail: string;
  phone?: string;
  taxId?: string;
}) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.profile) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const supabase = createAdminClient();
  const profileId = userProfile.profile.id;

  // 1. Update profiles table
  const { error: profError } = await supabase
    .from('profiles')
    .update({
      full_name: payload.fullName.trim(),
      phone: payload.phone?.trim() || null,
    })
    .eq('id', profileId);

  if (profError) {
    console.error('[updateBrandBillingContactAction] profile error:', profError);
    return { success: false, error: 'Failed to update contact name.' };
  }

  // 2. Update advertiser_profiles
  const { error: advError } = await supabase
    .from('advertiser_profiles')
    .update({
      billing_email: payload.billingEmail.trim().toLowerCase(),
      tax_id: payload.taxId?.trim() || null,
    })
    .eq('profile_id', profileId);

  if (advError) {
    console.error('[updateBrandBillingContactAction] adv error:', advError);
    return { success: false, error: 'Failed to update billing details.' };
  }

  // 3. Two-Way Sync admin contact name with Clerk
  if (userProfile.profile.clerk_id) {
    try {
      const client = await clerkClient();
      const nameParts = payload.fullName.trim().split(' ');
      const firstName = nameParts[0] || payload.fullName.trim();
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      await client.users.updateUser(userProfile.profile.clerk_id, {
        firstName,
        ...(lastName ? { lastName } : {}),
      });
    } catch (clerkErr) {
      console.warn('[updateBrandBillingContactAction] Clerk name sync warning:', clerkErr);
    }
  }

  revalidatePath('/b/settings');
  return { success: true };
}

export async function updateBrandFinancialSettingsAction(payload: {
  lowBalanceAlertEnabled: boolean;
  lowBalanceAlertThreshold: number;
}) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.profile) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('advertiser_profiles')
    .update({
      low_balance_alert_enabled: payload.lowBalanceAlertEnabled,
      low_balance_alert_threshold: Math.max(0, Number(payload.lowBalanceAlertThreshold || 0)),
    })
    .eq('profile_id', userProfile.profile.id);

  if (error) {
    console.error('[updateBrandFinancialSettingsAction] error:', error);
    return { success: false, error: 'Failed to update financial alert settings.' };
  }

  revalidatePath('/b/settings');
  revalidatePath('/b/wallet');
  return { success: true };
}

export async function updateBrandCampaignDefaultsAction(payload: {
  defaultGraceHours: number;
  defaultLiveHours: number;
  preferKycCreators: boolean;
  autoPauseThresholdPct: number;
}) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.profile) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('advertiser_profiles')
    .update({
      campaign_defaults: {
        default_grace_hours: payload.defaultGraceHours,
        default_live_hours: payload.defaultLiveHours,
        prefer_kyc_creators: payload.preferKycCreators,
        auto_pause_threshold_pct: payload.autoPauseThresholdPct,
      },
    })
    .eq('profile_id', userProfile.profile.id);

  if (error) {
    console.error('[updateBrandCampaignDefaultsAction] error:', error);
    return { success: false, error: 'Failed to update campaign defaults.' };
  }

  revalidatePath('/b/settings');
  return { success: true };
}

export async function updateBrandNotificationPreferencesAction(payload: {
  emailMilestones: boolean;
  emailSubmissions: boolean;
  emailWallet: boolean;
  weeklyDigest: boolean;
}) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.profile) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('advertiser_profiles')
    .update({
      notification_preferences: {
        email_milestones: payload.emailMilestones,
        email_submissions: payload.emailSubmissions,
        email_wallet: payload.emailWallet,
        weekly_digest: payload.weeklyDigest,
      },
    })
    .eq('profile_id', userProfile.profile.id);

  if (error) {
    console.error('[updateBrandNotificationPreferencesAction] error:', error);
    return { success: false, error: 'Failed to update notification preferences.' };
  }

  revalidatePath('/b/settings');
  return { success: true };
}

export async function syncBrandClerkIdentityAction() {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.profile || !userProfile.profile.clerk_id) {
    return { success: false, error: 'No connected Clerk account found.' };
  }

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userProfile.profile.clerk_id);

    const clerkImageUrl = clerkUser.imageUrl || null;
    const clerkName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
    const primaryEmail = clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || null;

    const supabase = createAdminClient();
    const updates: Record<string, any> = {};
    if (clerkImageUrl) updates.avatar_url = clerkImageUrl;
    if (clerkName) updates.full_name = clerkName;
    if (primaryEmail) updates.email = primaryEmail;

    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('id', userProfile.profile.id);
      if (clerkImageUrl) {
        await supabase
          .from('advertiser_profiles')
          .update({ company_logo_url: clerkImageUrl })
          .eq('profile_id', userProfile.profile.id);
      }
    }

    revalidatePath('/b/settings');
    revalidatePath('/b/dashboard');
    return {
      success: true,
      data: {
        imageUrl: clerkImageUrl,
        name: clerkName,
        email: primaryEmail,
      },
    };
  } catch (err: any) {
    console.error('[syncBrandClerkIdentityAction] error:', err);
    return { success: false, error: err?.message || 'Failed to refresh account data.' };
  }
}


