'use server';

import { revalidatePath } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { saveSocialAccount } from '@/lib/supabase/creator';
import { FALLBACK_NIGERIAN_BANKS, BankOption } from '@/lib/paystack/banks';
import {
  generateKpugiPayoutReference,
  createPaystackRecipient,
  initiatePaystackTransfer,
} from '@/lib/paystack/payout';
import { notifyCreatorWithdrawalCompleted, notifyCreatorJoinedCampaign } from '@/lib/notifications/creator';
import { validatePostUrlOwnership } from '@/lib/utils/social-url';

export async function getNigerianBanksAction(): Promise<BankOption[]> {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return [];
    }
    const res = await fetch('https://api.paystack.co/bank?country=nigeria', {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });
    const json = await res.json();
    if (json.status && Array.isArray(json.data)) {
      return json.data
        .map((b: any) => ({ code: b.code, name: b.name }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
  } catch (err) {
    console.error('Failed to fetch bank list from Paystack:', err);
  }
  return FALLBACK_NIGERIAN_BANKS;
}

// ─── 1. Zero-Trust Video Submission Action ─────────────────────────────────────

const ALLOWED_PLATFORM_DOMAINS = [
  'tiktok.com',
  'instagram.com',
  'youtube.com',
  'youtu.be',
  'x.com',
  'twitter.com',
  'facebook.com',
  'linkedin.com',
];

export async function submitCampaignVideoAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized: Creator profile required' };
  }

  const campaignId = (formData.get('campaignId') as string)?.trim();
  const rawVideoUrl = (formData.get('videoUrl') as string)?.trim();

  if (!campaignId || !rawVideoUrl) {
    return { success: false, error: 'Campaign ID and Video URL are required' };
  }

  // Zero-Trust URL Validation
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawVideoUrl);
    if (parsedUrl.protocol !== 'https:') {
      return { success: false, error: 'Video URL must start with https://' };
    }
  } catch {
    return { success: false, error: 'Please enter a valid, complete video URL' };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isAllowedDomain = ALLOWED_PLATFORM_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );

  if (!isAllowedDomain) {
    return {
      success: false,
      error: `Invalid URL domain. URL must be from TikTok, Instagram, YouTube, X/Twitter, Facebook, or LinkedIn.`,
    };
  }

  const supabase = createAdminClient();

  // Verify campaign exists and is active ('live')
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, title, status, cpm_rate, channels')
    .eq('id', campaignId)
    .maybeSingle();

  if (campaignError || !campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  if (campaign.status !== 'live' && campaign.status !== 'active') {
    return { success: false, error: 'This campaign is not currently accepting submissions.' };
  }

  // Detect platform from domain
  let platform = 'x';
  if (hostname.includes('tiktok.com')) platform = 'tiktok';
  else if (hostname.includes('instagram.com')) platform = 'instagram';
  else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) platform = 'youtube';
  else if (hostname.includes('facebook.com')) platform = 'facebook';
  else if (hostname.includes('linkedin.com')) platform = 'linkedin';
  else if (hostname.includes('x.com') || hostname.includes('twitter.com')) platform = 'x';

  // Enforce campaign channel restrictions
  if (campaign.channels && campaign.channels.length > 0) {
    const normalizedAllowed = campaign.channels.map((ch: string) => {
      const c = ch.toLowerCase().trim();
      if (c.includes('twitter') || c === 'x') return 'x';
      if (c.includes('instagram') || c.includes('ig') || c.includes('insta')) return 'instagram';
      if (c.includes('tiktok')) return 'tiktok';
      if (c.includes('youtube') || c.includes('shorts') || c.includes('yt')) return 'youtube';
      if (c.includes('facebook') || c.includes('fb')) return 'facebook';
      if (c.includes('linkedin')) return 'linkedin';
      return c;
    });

    const isAllowed = normalizedAllowed.includes(platform);
    if (!isAllowed) {
      const allowedDisplay = campaign.channels.join(', ');
      const platformDisplay = platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1);
      return {
        success: false,
        error: `This campaign only accepts submissions for ${allowedDisplay}. Your link is from ${platformDisplay}. Please submit a valid post link from an allowed channel.`,
      };
    }
  }

  // Prevent duplicate post link submissions for the same campaign
  const creatorProfileId = userProfile.creatorProfile?.id;
  const creatorIds = [userProfile.profile.id, creatorProfileId].filter(Boolean) as string[];
  const creatorFilter = creatorIds.map((id) => `creator_id.eq.${id}`).join(',');

  const { data: existingSub } = await supabase
    .from('submissions')
    .select('id, post_url, status')
    .eq('campaign_id', campaignId)
    .or(creatorFilter)
    .maybeSingle();

  if (existingSub?.post_url && existingSub.status !== 'rejected') {
    return {
      success: false,
      error: 'You have already submitted a post link for this campaign. Duplicate submissions are disabled.',
    };
  }

  // Find creator's connected social account for this platform
  let { data: socialAcc } = await supabase
    .from('social_accounts')
    .select('id, platform, handle')
    .eq('creator_id', userProfile.profile.id)
    .eq('platform', platform)
    .maybeSingle();

  if (!socialAcc && (platform === 'x' || platform === 'twitter')) {
    const altPlatform = platform === 'x' ? 'twitter' : 'x';
    const { data: altAcc } = await supabase
      .from('social_accounts')
      .select('id, platform, handle')
      .eq('creator_id', userProfile.profile.id)
      .eq('platform', altPlatform)
      .maybeSingle();
    socialAcc = altAcc;
  }

  const connectedHandle = socialAcc?.handle || userProfile.creatorProfile?.display_name || userProfile.profile.full_name;
  
  // Anti-Fraud Handle Ownership Verification
  const ownershipCheck = validatePostUrlOwnership(rawVideoUrl, connectedHandle, platform);
  if (!ownershipCheck.isValid) {
    return { success: false, error: ownershipCheck.error };
  }

  let socialAccountId = socialAcc?.id;
  if (!socialAccountId) {
    const { data: anySocial } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('creator_id', userProfile.profile.id)
      .limit(1)
      .maybeSingle();
    socialAccountId = anySocial?.id;
  }

  if (!socialAccountId) {
    const handle = userProfile.creatorProfile?.display_name || userProfile.profile.full_name || 'creator';
    const cleanHandle = handle.replace(/^@/, '');
    const { data: newSocial } = await supabase
      .from('social_accounts')
      .insert({
        creator_id: userProfile.profile.id,
        platform,
        handle: cleanHandle,
        platform_user_id: cleanHandle,
        verification_status: 'unverified',
        connected_at: new Date().toISOString(),
      })
      .select('id')
      .maybeSingle();
    socialAccountId = newSocial?.id;
  }

  const { error } = await supabase.from('submissions').upsert(
    {
      campaign_id: campaignId,
      creator_id: userProfile.profile.id,
      social_account_id: socialAccountId,
      post_url: parsedUrl.toString(),
      screenshot_url: null,
      reserved_amount: Number(campaign.cpm_rate || 0),
      status: 'pending',
      submitted_at: new Date().toISOString(),
    },
    { onConflict: 'campaign_id,creator_id' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  // Fire campaign submission notification
  notifyCreatorJoinedCampaign({
    clerkId: userProfile.profile.clerk_id,
    email: userProfile.profile.email,
    campaignTitle: campaign.title || 'Campaign',
    reservedAmount: campaign.cpm_rate || 0,
    campaignId: campaignId,
    profileId: userProfile.profile.id,
  }).catch((err) => console.error('[notifyCreatorJoinedCampaign] Error:', err));

  // Note: New video submissions enter a 60-minute organic growth incubation window.
  // The automated auditing engine evaluates the post once submitted_at reaches 60 minutes.

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath('/campaigns');
  revalidatePath('/dashboard');
  revalidatePath('/c/submissions');
  revalidatePath('/submissions');
  return { success: true };
}

// ─── 2. Zero-Trust Atomic Payout Action ────────────────────────────────────────

export async function requestPayoutAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  const amount = Number(formData.get('amount'));
  if (isNaN(amount) || amount < 10000) {
    return { success: false, error: "Hold on now 🛑... Minimum withdrawal is ₦10,000!" };
  }

  const requestedBankAccountId = (formData.get('bankAccountId') as string)?.trim();
  const supabase = createAdminClient();

  // 1. Fetch creator profile & KYC status
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('profile_id, kyc_status, paystack_recipient_code')
    .eq('profile_id', userProfile.profile.id)
    .maybeSingle();

  if (creator?.kyc_status !== 'verified') {
    return {
      success: false,
      error:
        'Identity Verification Required: You must verify your government ID (NIN, Voter Card, or Passport) on the Settings page before initiating earnings withdrawals.',
    };
  }

  // 2. Resolve destination bank account
  let targetBank: {
    id?: string;
    bank_name: string;
    account_number: string;
    bank_code: string;
    account_name?: string;
    recipient_code?: string | null;
  } | null = null;

  if (requestedBankAccountId && requestedBankAccountId !== 'primary-legacy') {
    // 1. Match by bank_accounts.id
    const { data: specificBank } = await supabase
      .from('bank_accounts')
      .select('id, bank_name, account_number, bank_code, account_name, recipient_code')
      .eq('id', requestedBankAccountId)
      .eq('profile_id', userProfile.profile.id)
      .maybeSingle();

    if (specificBank) {
      targetBank = specificBank;
    } else {
      // 2. Match by account_number
      const { data: bankByNum } = await supabase
        .from('bank_accounts')
        .select('id, bank_name, account_number, bank_code, account_name, recipient_code')
        .eq('account_number', requestedBankAccountId)
        .eq('profile_id', userProfile.profile.id)
        .maybeSingle();

      if (bankByNum) {
        targetBank = bankByNum;
      }
    }
  }

  if (!targetBank) {
    const { data: primaryBank } = await supabase
      .from('bank_accounts')
      .select('id, bank_name, account_number, bank_code, account_name, recipient_code')
      .eq('profile_id', userProfile.profile.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (primaryBank) {
      targetBank = primaryBank;
    }
  }

  // Fallback if bank_accounts record missing but JSON exists in creator_profiles
  if (!targetBank && creator?.paystack_recipient_code) {
    try {
      const parsed = JSON.parse(creator.paystack_recipient_code);
      if (parsed.account_number && parsed.bank_code) {
        targetBank = {
          bank_name: parsed.bank_name || parsed.bankName || 'Bank',
          account_number: parsed.account_number || parsed.accountNumber,
          bank_code: parsed.bank_code || parsed.bankCode,
          account_name: parsed.account_name || parsed.accountName || userProfile.profile.full_name || 'Creator',
        };
      }
    } catch {}
  }

  if (!targetBank) {
    return {
      success: false,
      error: 'No payout bank account linked. Please add your Nigerian bank account in Settings before requesting withdrawal.',
    };
  }

  // 3. Fetch creator wallet balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'creator_earnings')
    .maybeSingle();

  const currentBalance = Number(wallet?.balance || 0);
  if (currentBalance < amount) {
    return { success: false, error: "Bag ain't deep enough yet 💼... Insufficient wallet balance for this withdrawal." };
  }

  // 4. Generate branded reference code (e.g. KPG-#KPUG1)
  const refCode = generateKpugiPayoutReference();

  // 5. Ensure Paystack Recipient Code
  let recipientCode = targetBank.recipient_code;
  if (!recipientCode) {
    const recipientRes = await createPaystackRecipient({
      name: targetBank.account_name || userProfile.profile.full_name || 'Creator',
      accountNumber: targetBank.account_number,
      bankCode: targetBank.bank_code,
    });

    if (!recipientRes.success || !recipientRes.recipientCode) {
      return {
        success: false,
        error: recipientRes.error || 'Failed to setup bank transfer recipient with Paystack.',
      };
    }

    recipientCode = recipientRes.recipientCode;

    // Persist recipient code on bank_accounts table if id exists
    if (targetBank.id) {
      await supabase
        .from('bank_accounts')
        .update({ recipient_code: recipientCode })
        .eq('id', targetBank.id);
    }
  }

  // 6. Atomic Wallet Update: Lock row and deduct balance via DB atomic function
  let atomicUsed = false;
  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('atomic_request_withdrawal', {
      p_profile_id: userProfile.profile.id,
      p_amount: amount,
      p_reference: refCode,
      p_bank_name: targetBank.bank_name || 'Bank',
      p_account_number: targetBank.account_number || '',
      p_account_name: targetBank.account_name || userProfile.profile.full_name || 'Creator',
    });

    if (!rpcErr && rpcRes) {
      if (!rpcRes.success) {
        return {
          success: false,
          error: rpcRes.error || "Bag ain't deep enough yet 💼... Insufficient wallet balance for this withdrawal.",
        };
      }
      atomicUsed = true;
    }
  } catch {
    atomicUsed = false;
  }

  // Fallback if atomic procedure is not installed in database yet
  if (!atomicUsed) {
    const newBalance = Math.round((currentBalance - amount) * 100) / 100;
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet!.id)
      .gte('balance', amount);

    if (walletError) {
      return { success: false, error: 'Failed to update wallet balance. Please try again.' };
    }

    // Record transaction in wallet_transactions table
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet!.id,
      type: 'withdrawal',
      amount: -amount,
      gross_amount: amount,
      fee_amount: 0,
      net_amount: -amount,
      status: 'completed',
      paystack_reference: refCode,
      created_at: new Date().toISOString(),
    });

    // Record transaction in payout_requests table
    await supabase.from('payout_requests').insert({
      profile_id: userProfile.profile.id,
      amount: amount,
      status: 'processing',
      bank_name: targetBank.bank_name,
      account_number: targetBank.account_number,
      account_name: targetBank.account_name || 'Creator',
      reference: refCode,
      created_at: new Date().toISOString(),
    });
  }

  // 7. Initiate Live Transfer via Paystack
  const transferRes = await initiatePaystackTransfer({
    recipientCode,
    amountInKobo: Math.round(amount * 100),
    reference: refCode,
    reason: `Kpugi Creator Earnings Withdrawal - ${refCode}`,
  });

  // Handle Paystack starter tier restriction or automated queueing gracefully
  const isStarterTierRestriction =
    !transferRes.success &&
    (transferRes.error?.toLowerCase().includes('starter business') ||
      transferRes.error?.toLowerCase().includes('third party payout') ||
      transferRes.error?.toLowerCase().includes('cannot initiate') ||
      transferRes.error?.toLowerCase().includes('starter'));

  if (!transferRes.success && !isStarterTierRestriction) {
    // Rollback wallet balance if transfer was rejected due to other technical errors
    let rolledBack = false;
    try {
      const { data: rbRes, error: rbErr } = await supabase.rpc('atomic_rollback_withdrawal', {
        p_reference: refCode,
      });
      if (!rbErr && rbRes?.success) {
        rolledBack = true;
      }
    } catch {
      rolledBack = false;
    }

    if (!rolledBack) {
      // Safe fallback: fetch current balance and increment by amount rather than overwriting with stale currentBalance
      const { data: latestW } = await supabase.from('wallets').select('balance').eq('id', wallet!.id).single();
      const restored = Math.round(((latestW?.balance || 0) + amount) * 100) / 100;
      await supabase.from('wallets').update({ balance: restored }).eq('id', wallet!.id);

      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('paystack_reference', refCode);

      await supabase
        .from('payout_requests')
        .update({ status: 'failed' })
        .eq('reference', refCode);
    }

    return {
      success: false,
      error: `Paystack Transfer Failed: ${transferRes.error || 'Could not process transfer.'}`,
    };
  }

  const finalStatus = transferRes.success
    ? (transferRes.status || 'success')
    : 'processing';

  // 8. Update payout_requests with transfer details if available
  await supabase
    .from('payout_requests')
    .update({
      status: finalStatus,
      paystack_transfer_code: transferRes.transferCode || null,
      updated_at: new Date().toISOString(),
    })
    .eq('reference', refCode);

  // 10. Fire Withdrawal Notification (Knock in-app feed + Resend branded email)
  const maskedAcc = targetBank.account_number
    ? `****${targetBank.account_number.slice(-4)}`
    : '****Bank';

  notifyCreatorWithdrawalCompleted({
    clerkId: userProfile.profile.clerk_id,
    email: userProfile.profile.email,
    amount,
    bankName: targetBank.bank_name,
    accountMasked: maskedAcc,
    reference: refCode,
    profileId: userProfile.profile.id,
  }).catch((err) => console.error('[notifyCreatorWithdrawalCompleted] Error:', err));

  revalidatePath('/c/wallet');
  revalidatePath('/c/dashboard');
  revalidatePath('/c/payouts');
  return { success: true, reference: refCode };
}

// ─── 3. Bank Account Resolution Action ─────────────────────────────────────────

export async function resolveAndSaveBankAccountAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized: Creator profile required' };
  }

  const bankCode = (formData.get('bankCode') as string)?.trim();
  const bankName = (formData.get('bankName') as string)?.trim();
  const accountNumber = (formData.get('accountNumber') as string)?.trim();

  if (!bankCode || !accountNumber || !/^\d{10}$/.test(accountNumber)) {
    return { success: false, error: 'Please enter a valid 10-digit NUBAN account number and select a bank.' };
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return { success: false, error: 'Paystack configuration error. Secret key missing.' };
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    const json = await res.json();
    if (!json.status || !json.data?.account_name) {
      return {
        success: false,
        error: json.message || 'Could not resolve account name for selected bank. Please check account number.',
      };
    }

    const accountName = json.data.account_name;

    const supabase = createAdminClient();
    const profileId = userProfile.profile.id;

    // Check if creator has any existing accounts to determine if this should be primary
    const { data: existingAccounts } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('profile_id', profileId);

    const isFirstAccount = !existingAccounts || existingAccounts.length === 0;

    // If it's the first account, set it as primary
    if (isFirstAccount) {
      await supabase
        .from('bank_accounts')
        .update({ is_primary: false })
        .eq('profile_id', profileId);
    }

    await supabase.from('bank_accounts').upsert(
      {
        profile_id: profileId,
        bank_name: bankName || 'Bank',
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        is_primary: isFirstAccount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,account_number,bank_code' }
    );

    if (isFirstAccount) {
      const bankDetailsJson = JSON.stringify({
        bank_code: bankCode,
        bank_name: bankName || 'Bank',
        account_number: accountNumber,
        account_name: accountName,
      });

      await supabase
        .from('creator_profiles')
        .update({
          paystack_recipient_code: bankDetailsJson,
          bank_account_number: accountNumber,
          bank_code: bankCode,
          bank_name: bankName || 'Bank',
        })
        .eq('profile_id', profileId);
    }

    revalidatePath('/c/wallet');
    revalidatePath('/c/payouts');
    revalidatePath('/settings');
    return { success: true, accountName };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to resolve account via Paystack.' };
  }
}

// ─── 3B. Delete Payout Account Action ─────────────────────────────────────────

export async function deleteBankAccountAction(accountId: string) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!accountId) {
    return { success: false, error: 'Account ID is required' };
  }

  const supabase = createAdminClient();
  const profileId = userProfile.profile.id;

  // 1. Fetch account to check if it was primary
  const { data: targetAccount } = await supabase
    .from('bank_accounts')
    .select('id, is_primary')
    .eq('id', accountId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (!targetAccount) {
    return { success: false, error: 'Account not found' };
  }

  // 2. Delete the account
  const { error: delErr } = await supabase
    .from('bank_accounts')
    .delete()
    .eq('id', accountId)
    .eq('profile_id', profileId);

  if (delErr) {
    return { success: false, error: delErr.message };
  }

  // 3. If primary account was deleted, designate next available account as primary
  if (targetAccount.is_primary) {
    const { data: remainingAccounts } = await supabase
      .from('bank_accounts')
      .select('id, bank_name, bank_code, account_number, account_name')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (remainingAccounts && remainingAccounts.length > 0) {
      const nextPrimary = remainingAccounts[0];
      await supabase
        .from('bank_accounts')
        .update({ is_primary: true })
        .eq('id', nextPrimary.id);

      const bankDetailsJson = JSON.stringify({
        bank_code: nextPrimary.bank_code,
        bank_name: nextPrimary.bank_name,
        account_number: nextPrimary.account_number,
        account_name: nextPrimary.account_name,
      });

      await supabase
        .from('creator_profiles')
        .update({
          paystack_recipient_code: bankDetailsJson,
          bank_account_number: nextPrimary.account_number,
          bank_code: nextPrimary.bank_code,
          bank_name: nextPrimary.bank_name,
        })
        .eq('profile_id', profileId);
    } else {
      // Clear creator profile bank details
      await supabase
        .from('creator_profiles')
        .update({
          paystack_recipient_code: null,
          bank_account_number: null,
          bank_code: null,
          bank_name: null,
        })
        .eq('profile_id', profileId);
    }
  }

  revalidatePath('/c/wallet');
  revalidatePath('/c/payouts');
  revalidatePath('/settings');
  return { success: true };
}

// ─── 3C. Set Default / Primary Payout Destination Action ─────────────────────

export async function setDefaultBankAccountAction(accountId: string) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!accountId) {
    return { success: false, error: 'Account ID is required' };
  }

  const supabase = createAdminClient();
  const profileId = userProfile.profile.id;

  // 1. Fetch the target account
  const { data: targetAccount } = await supabase
    .from('bank_accounts')
    .select('id, bank_name, bank_code, account_number, account_name')
    .eq('id', accountId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (!targetAccount) {
    return { success: false, error: 'Account not found' };
  }

  // 2. Unset primary from all user accounts
  await supabase
    .from('bank_accounts')
    .update({ is_primary: false })
    .eq('profile_id', profileId);

  // 3. Set primary on selected account
  await supabase
    .from('bank_accounts')
    .update({ is_primary: true })
    .eq('id', accountId);

  // 4. Sync with creator_profiles
  const bankDetailsJson = JSON.stringify({
    bank_code: targetAccount.bank_code,
    bank_name: targetAccount.bank_name,
    account_number: targetAccount.account_number,
    account_name: targetAccount.account_name,
  });

  await supabase
    .from('creator_profiles')
    .update({
      paystack_recipient_code: bankDetailsJson,
      bank_account_number: targetAccount.account_number,
      bank_code: targetAccount.bank_code,
      bank_name: targetAccount.bank_name,
    })
    .eq('profile_id', profileId);

  revalidatePath('/c/wallet');
  revalidatePath('/c/payouts');
  revalidatePath('/settings');
  return { success: true };
}

// ─── 3D. Creator Unjoin Campaign Action ─────────────────────────────────────────

export async function unjoinCampaignAction(campaignId: string) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!campaignId) {
    return { success: false, error: 'Campaign ID is required' };
  }

  const supabase = createAdminClient();
  const profileId = userProfile.profile.id;

  // 1. Find the submission (any status)
  const { data: submission, error: findErr } = await supabase
    .from('submissions')
    .select('id, status, reserved_amount, payout_amount, pending_payout_amount, campaign_id')
    .eq('campaign_id', campaignId)
    .eq('creator_id', profileId)
    .maybeSingle();

  if (findErr || !submission) {
    return { success: false, error: 'You have not joined this campaign.' };
  }

  const clearedPayout = Number(submission.payout_amount || 0);
  const pendingPayout = Number(submission.pending_payout_amount || 0);
  const totalEarnedForSub = clearedPayout + pendingPayout;
  const subReserved = Number(submission.reserved_amount || 0);

  // 2. Delete verification checks, submission audits, and previous wallet transactions for this submission
  await Promise.all([
    supabase
      .from('verification_checks')
      .delete()
      .eq('submission_id', submission.id),
    supabase
      .from('submission_audits')
      .delete()
      .eq('submission_id', submission.id),
    supabase
      .from('wallet_transactions')
      .delete()
      .eq('submission_id', submission.id),
  ]);

  // 3. Release reserved and spent budget on campaign (refund back to pool)
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, reserved_budget, spent_budget, total_budget, status')
    .eq('id', campaignId)
    .maybeSingle();

  if (campaign) {
    const currentReserved = Number(campaign.reserved_budget || 0);
    const currentSpent = Number(campaign.spent_budget || 0);
    const newReserved = Math.max(0, currentReserved - subReserved);
    const newSpent = Math.max(0, currentSpent - totalEarnedForSub);
    const totalBudget = Number(campaign.total_budget || 0);
    const shouldReopen = campaign.status === 'completed' && newSpent < totalBudget;

    await supabase
      .from('campaigns')
      .update({
        reserved_budget: newReserved,
        spent_budget: newSpent,
        ...(shouldReopen ? { status: 'live' } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);
  }

  // 4. Cleanly reconcile Creator Wallet & Total Earned from ledger
  const { data: creatorWallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'creator_earnings')
    .maybeSingle();

  if (creatorWallet) {
    const { data: txs } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('wallet_id', creatorWallet.id)
      .eq('status', 'completed');

    const trueBalance = (txs || []).reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const trueEarned = (txs || [])
      .filter((t) => Number(t.amount || 0) > 0)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    await supabase
      .from('wallets')
      .update({ balance: Math.max(0, Math.round(trueBalance * 100) / 100) })
      .eq('id', creatorWallet.id);

    await supabase
      .from('creator_profiles')
      .update({ total_earned: Math.max(0, Math.round(trueEarned * 100) / 100) })
      .eq('profile_id', profileId);
  }

  // 5. Delete the submission record
  const { error: delErr } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submission.id);

  if (delErr) {
    return { success: false, error: delErr.message || 'Failed to unjoin campaign.' };
  }

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath(`/c/campaigns/${campaignId}`);
  revalidatePath('/c/campaigns');
  revalidatePath('/campaigns');
  revalidatePath('/dashboard');
  revalidatePath('/c/dashboard');
  return { success: true };
}

// ─── 3E. Creator Delete / Reset Post Link Action ─────────────────────────────

export async function deleteSubmissionLinkAction(campaignId: string) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized: Creator profile required.' };
  }

  if (!campaignId) {
    return { success: false, error: 'Campaign ID is required.' };
  }

  const supabase = createAdminClient();
  const profileId = userProfile.profile.id;

  // 1. Find the submission for this campaign
  const { data: submission, error: findErr } = await supabase
    .from('submissions')
    .select('id, status, post_url, payout_amount, pending_payout_amount')
    .eq('campaign_id', campaignId)
    .eq('creator_id', profileId)
    .maybeSingle();

  if (findErr || !submission) {
    return { success: false, error: 'Submission not found for this campaign.' };
  }

  const clearedPayout = Number(submission.payout_amount || 0);
  const pendingPayout = Number(submission.pending_payout_amount || 0);
  const totalEarnedForSub = clearedPayout + pendingPayout;

  // 2. Delete verification checks, submission audits, and previous wallet transactions for this submission
  await Promise.all([
    supabase
      .from('verification_checks')
      .delete()
      .eq('submission_id', submission.id),
    supabase
      .from('submission_audits')
      .delete()
      .eq('submission_id', submission.id),
    supabase
      .from('wallet_transactions')
      .delete()
      .eq('submission_id', submission.id),
  ]);

  // 3. Reset submission record back to 'joined' state with 0 stats and 0 earnings
  const { error: updateErr } = await supabase
    .from('submissions')
    .update({
      post_url: null,
      screenshot_url: null,
      status: 'joined',
      final_view_count: 0,
      last_paid_view_count: 0,
      max_verified_views: 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      watch_time_seconds: 0,
      pending_payout_amount: 0,
      payout_amount: 0,
      last_scraped_at: null,
      verified_at: null,
      submitted_at: new Date().toISOString(),
      auto_approve_at: null,
      failure_reason: null,
    })
    .eq('id', submission.id);

  if (updateErr) {
    return { success: false, error: updateErr.message || 'Failed to remove post link.' };
  }

  // 4. Refund campaign spent_budget (both cleared + pending payouts)
  if (totalEarnedForSub > 0) {
    const { data: camp } = await supabase
      .from('campaigns')
      .select('id, spent_budget, total_budget, status')
      .eq('id', campaignId)
      .maybeSingle();

    if (camp) {
      const newSpent = Math.max(0, Number(camp.spent_budget || 0) - totalEarnedForSub);
      const totalBudget = Number(camp.total_budget || 0);
      const shouldReopen = camp.status === 'completed' && newSpent < totalBudget;

      await supabase
        .from('campaigns')
        .update({
          spent_budget: newSpent,
          ...(shouldReopen ? { status: 'live' } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId);
    }
  }

  // 5. Cleanly reconcile Creator Wallet & Total Earned from ledger
  const { data: creatorWallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'creator_earnings')
    .maybeSingle();

  if (creatorWallet) {
    const { data: txs } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('wallet_id', creatorWallet.id)
      .eq('status', 'completed');

    const trueBalance = (txs || []).reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const trueEarned = (txs || [])
      .filter((t) => Number(t.amount || 0) > 0)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    await supabase
      .from('wallets')
      .update({ balance: Math.max(0, Math.round(trueBalance * 100) / 100) })
      .eq('id', creatorWallet.id);

    await supabase
      .from('creator_profiles')
      .update({ total_earned: Math.max(0, Math.round(trueEarned * 100) / 100) })
      .eq('profile_id', profileId);
  }

  revalidatePath('/c/wallet');
  revalidatePath('/c/dashboard');
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath(`/c/campaigns/${campaignId}`);
  revalidatePath(`/browse/${campaignId}`);
  revalidatePath('/c/campaigns');
  revalidatePath('/c/submissions');
  revalidatePath(`/b/campaigns/${campaignId}`);
  revalidatePath('/b/dashboard');
  return { success: true };
}

// ─── 4. Zero-Trust Social Account Link Action ─────────────────────────────────

export async function linkSocialAccountAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  const platform = (formData.get('platform') as string)?.trim();
  const rawHandle = (formData.get('handle') as string)?.trim();

  if (!platform || !rawHandle) {
    return { success: false, error: 'Platform and handle are required' };
  }

  const cleanHandle = rawHandle.replace(/^@/, '').replace(/^https?:\/\/[^\/]+\//, '').toLowerCase();

  // Zero-Trust Handle Validation
  if (!/^[a-zA-Z0-9._-]{1,35}$/.test(cleanHandle)) {
    return { success: false, error: 'Handle contains invalid characters or exceeds 35 characters.' };
  }

  const platformKey = platform.toLowerCase() === 'twitter' ? 'x' : platform.toLowerCase();
  const profileId = userProfile.profile.id;

  const rawFollower = formData.get('followerCount') ? Number(formData.get('followerCount')) : null;
  const followerCount = rawFollower !== null ? Math.max(0, Math.min(100_000_000, rawFollower)) : null;

  const rawAvatarUrl = (formData.get('avatarUrl') as string)?.trim() || null;
  let avatarUrl: string | null = null;
  if (rawAvatarUrl) {
    try {
      const parsed = new URL(rawAvatarUrl);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        avatarUrl = parsed.toString();
      }
    } catch {
      avatarUrl = null;
    }
  }

  await saveSocialAccount({
    profileId,
    platform: platformKey,
    handle: cleanHandle,
    platformUserId: cleanHandle,
    followerCount,
    avatarUrl,
  });

  revalidatePath('/accounts');
  return { success: true };
}

// ─── 5. Zero-Trust Profile Update Action ──────────────────────────────────────

export async function updateCreatorProfileAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  const rawDisplayName = (formData.get('displayName') as string)?.trim() || '';
  const displayName = rawDisplayName.slice(0, 100);

  const rawHandle = (formData.get('creatorHandle') as string)?.trim() || '';
  const creatorHandle = rawHandle.replace(/^@/, '').toLowerCase().slice(0, 35);

  const rawBio = (formData.get('bio') as string)?.trim() || '';
  const bio = rawBio.slice(0, 500);

  const niches = (formData.getAll('niches') as string[]).map((n) => String(n).slice(0, 50));
  const rawAvatarUrl = (formData.get('avatarUrl') as string)?.trim() || null;

  let avatarUrl: string | null = null;
  if (rawAvatarUrl) {
    try {
      const parsed = new URL(rawAvatarUrl);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        avatarUrl = parsed.toString();
      }
    } catch {
      avatarUrl = null;
    }
  }

  const supabase = createAdminClient();

  const { data: currentCreator } = await supabase
    .from('creator_profiles')
    .select('creator_handle')
    .eq('profile_id', userProfile.profile.id)
    .maybeSingle();

  const updatePayload: any = {
    display_name: displayName,
    bio,
    niche_categories: niches,
  };

  if (!currentCreator?.creator_handle && creatorHandle && /^[a-zA-Z0-9._-]{1,35}$/.test(creatorHandle)) {
    updatePayload.creator_handle = creatorHandle;
  }
  if (avatarUrl) updatePayload.avatar_url = avatarUrl;

  const { error } = await supabase
    .from('creator_profiles')
    .update(updatePayload)
    .eq('profile_id', userProfile.profile.id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (avatarUrl || displayName) {
    await supabase
      .from('profiles')
      .update({
        ...(displayName ? { full_name: displayName } : {}),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      .eq('id', userProfile.profile.id);

    if (userProfile.profile.clerk_id) {
      try {
        const client = await clerkClient();
        const nameParts = displayName ? displayName.trim().split(' ') : [];
        const firstName = nameParts[0] || displayName || undefined;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

        await client.users.updateUser(userProfile.profile.clerk_id, {
          ...(firstName ? { firstName } : {}),
          ...(lastName !== undefined ? { lastName } : {}),
        });
      } catch (clerkErr) {
        console.warn('[Clerk User Sync Warning]:', clerkErr);
      }
    }
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function updateNotificationPreferencesAction(prefs: {
  notify_email: boolean;
  notify_payouts: boolean;
  notify_campaigns: boolean;
}) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('creator_profiles')
    .update({
      notification_preferences: prefs,
    })
    .eq('profile_id', userProfile.profile.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function resyncSubmissionScraperAction(submissionId: string) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!submissionId) {
    return { success: false, error: 'Submission ID is required' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('submissions')
    .update({
      status: 'pending',
      verified_at: new Date().toISOString(),
      last_scraped_at: null, // Clear last_scraped_at so manual resync immediately qualifies under get_due_submissions
    })
    .eq('id', submissionId)
    .or(`creator_id.eq.${userProfile.profile.id},creator_id.eq.${userProfile.creatorProfile.id}`);

  if (error) {
    return { success: false, error: error.message };
  }

  // Trigger scraper audit
  import('@/lib/scraper/trigger')
    .then(({ triggerScraperRun }) => triggerScraperRun())
    .catch((err) => console.warn('[triggerScraperRun] Warning:', err));

  revalidatePath('/submissions');
  revalidatePath('/c/submissions');
  return { success: true };
}
