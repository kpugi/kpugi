'use server';

import { revalidatePath } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { saveSocialAccount } from '@/lib/supabase/creator';
import { FALLBACK_NIGERIAN_BANKS, BankOption } from '@/lib/paystack/banks';
import { notifyCreatorWithdrawalCompleted, notifyCreatorJoinedCampaign } from '@/lib/notifications/creator';

export async function getNigerianBanksAction(): Promise<BankOption[]> {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_d158c402f2a980b1b327605aa39ab78083fb80a1';
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

  // Find creator's connected social account
  const { data: socialAcc } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('creator_id', userProfile.profile.id)
    .eq('platform', platform)
    .maybeSingle();

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
      screenshot_url: 'https://via.placeholder.com/150',
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
    campaignTitle: campaign.title || 'Campaign',
    reservedAmount: campaign.cpm_rate || 0,
    campaignId: campaignId,
    profileId: userProfile.profile.id,
  }).catch((err) => console.error('[notifyCreatorJoinedCampaign] Error:', err));

  // Trigger scraper audit
  import('@/lib/scraper/trigger')
    .then(({ triggerScraperRun }) => triggerScraperRun())
    .catch((err) => console.warn('[triggerScraperRun] Warning:', err));

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
    .select('profile_id, bank_account_number, bank_code, bank_name, kyc_status')
    .eq('profile_id', userProfile.profile.id)
    .maybeSingle();

  if (creator?.kyc_status !== 'verified') {
    return {
      success: false,
      error:
        'Identity Verification Required: You must verify your government ID (NIN, Voter Card, or Passport) on the Settings page before initiating earnings withdrawals.',
    };
  }

  // Resolve specific destination account if requested
  let targetBankName = creator?.bank_name || 'Bank';
  let targetAccountNumber = creator?.bank_account_number || '';

  if (requestedBankAccountId) {
    const { data: specificBank } = await supabase
      .from('bank_accounts')
      .select('bank_name, account_number, bank_code')
      .eq('id', requestedBankAccountId)
      .eq('profile_id', userProfile.profile.id)
      .maybeSingle();

    if (specificBank) {
      targetBankName = specificBank.bank_name;
      targetAccountNumber = specificBank.account_number;
    }
  }

  // 2. Fetch creator wallet balance
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

  const newBalance = currentBalance - amount;

  // 3. Atomic Wallet Update: ensure balance >= amount in DB to prevent double-spend race conditions
  const { error: walletError } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', wallet!.id)
    .gte('balance', amount);

  if (walletError) {
    return { success: false, error: 'Failed to update wallet balance. Please try again.' };
  }

  // 4. Record transaction in wallet_transactions table
  const refCode = `KP-WTR-${Date.now().toString().slice(-6)}`;
  await supabase.from('wallet_transactions').insert({
    profile_id: userProfile.profile.id,
    creator_id: creator?.profile_id || userProfile.profile.id,
    wallet_type: 'creator_earnings',
    transaction_type: 'withdrawal',
    amount: amount,
    status: 'processing',
    reference: refCode,
    created_at: new Date().toISOString(),
  });

  // 5. Fire Withdrawal Notification (Knock feed + Resend email)
  const maskedAcc = targetAccountNumber
    ? `****${targetAccountNumber.slice(-4)}`
    : '****Bank';

  notifyCreatorWithdrawalCompleted({
    clerkId: userProfile.profile.clerk_id,
    email: userProfile.profile.email,
    amount,
    bankName: targetBankName,
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

  // 1. Find the submission in 'joined' status
  const { data: submission, error: findErr } = await supabase
    .from('submissions')
    .select('id, status, reserved_amount, campaign_id')
    .eq('campaign_id', campaignId)
    .eq('creator_id', profileId)
    .maybeSingle();

  if (findErr || !submission) {
    return { success: false, error: 'You have not joined this campaign.' };
  }

  if (submission.status !== 'joined') {
    return { success: false, error: 'Cannot unjoin after a post link has already been submitted.' };
  }

  // 2. Release reserved budget on campaign
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, reserved_budget')
    .eq('id', campaignId)
    .maybeSingle();

  if (campaign) {
    const currentReserved = Number(campaign.reserved_budget || 0);
    const subReserved = Number(submission.reserved_amount || 0);
    const newReserved = Math.max(0, currentReserved - subReserved);

    await supabase
      .from('campaigns')
      .update({ reserved_budget: newReserved })
      .eq('id', campaignId);
  }

  // 3. Delete the submission record
  const { error: delErr } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submission.id);

  if (delErr) {
    return { success: false, error: delErr.message || 'Failed to unjoin campaign.' };
  }

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath('/c/campaigns');
  revalidatePath('/campaigns');
  revalidatePath('/dashboard');
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
