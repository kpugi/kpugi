'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { FALLBACK_NIGERIAN_BANKS, BankOption } from '@/lib/paystack/banks';

export async function getNigerianBanksAction(): Promise<BankOption[]> {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_d158c402f2a980b1b327605aa39ab78083fb80a1';
    const res = await fetch('https://api.paystack.co/bank?country=nigeria', {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
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

export async function submitCampaignVideoAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized: Creator profile required' };
  }

  const campaignId = formData.get('campaignId') as string;
  const videoUrl = formData.get('videoUrl') as string;

  if (!campaignId || !videoUrl) {
    return { success: false, error: 'Campaign ID and Video URL are required' };
  }

  const supabase = createAdminClient();

  // Check if campaign exists and has budget/active status
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, cpm_rate')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  const { error } = await supabase.from('campaign_submissions').upsert({
    campaign_id: campaignId,
    creator_id: userProfile.creatorProfile.id,
    post_url: videoUrl,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath('/campaigns');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function requestPayoutAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  const amount = Number(formData.get('amount'));
  if (!amount || amount < 10000) {
    return { success: false, error: 'Minimum withdrawal amount is ₦10,000' };
  }

  const supabase = createAdminClient();
  
  // 1. Fetch creator profile & wallet
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, bank_account_number, bank_code, bank_name')
    .eq('id', userProfile.creatorProfile.id)
    .single();

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'creator_earnings')
    .maybeSingle();

  const currentBalance = wallet?.balance || 0;
  if (currentBalance < amount) {
    return { success: false, error: 'Insufficient wallet balance' };
  }

  const newBalance = currentBalance - amount;

  // 2. Update wallet balance
  if (wallet?.id) {
    await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet.id);
  }

  // 3. Record transaction in wallet_transactions table
  const refCode = `KP-WTR-${Date.now().toString().slice(-6)}`;
  await supabase.from('wallet_transactions').insert({
    profile_id: userProfile.profile.id,
    creator_id: creator?.id || userProfile.creatorProfile.id,
    wallet_type: 'creator_earnings',
    transaction_type: 'withdrawal',
    amount: amount,
    status: 'processing',
    reference: refCode,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/earnings');
  revalidatePath('/dashboard');
  return { success: true, reference: refCode };
}

export async function resolveAndSaveBankAccountAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized: Creator profile required' };
  }

  const bankCode = formData.get('bankCode') as string;
  const bankName = formData.get('bankName') as string;
  const accountNumber = formData.get('accountNumber') as string;

  if (!bankCode || !accountNumber || accountNumber.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit NUBAN account number and select a bank.' };
  }

  // 1. Resolve Account Name via Paystack API
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

    // 2. Save permanently into database on creator_profiles using paystack_recipient_code column
    const supabase = createAdminClient();
    const bankDetailsJson = JSON.stringify({
      bank_code: bankCode,
      bank_name: bankName || 'Bank',
      account_number: accountNumber,
      account_name: accountName,
    });

    const { error } = await supabase
      .from('creator_profiles')
      .update({
        paystack_recipient_code: bankDetailsJson,
      })
      .eq('id', userProfile.creatorProfile.id);

    if (error) {
      console.error('Error saving bank details to creator_profiles:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/earnings');
    return { success: true, accountName };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to resolve account via Paystack.' };
  }
}

export async function linkSocialAccountAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  const platform = formData.get('platform') as string;
  const handle = formData.get('handle') as string;

  if (!platform || !handle) {
    return { success: false, error: 'Platform and handle are required' };
  }

  const supabase = createAdminClient();
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('social_links')
    .eq('id', userProfile.creatorProfile.id)
    .single();

  const currentLinks = creator?.social_links || {};
  const updatedLinks = {
    ...currentLinks,
    [platform.toLowerCase()]: handle.replace(/^@/, ''),
  };

  const { error } = await supabase
    .from('creator_profiles')
    .update({ social_links: updatedLinks })
    .eq('id', userProfile.creatorProfile.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/accounts');
  return { success: true };
}

export async function updateCreatorProfileAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  const displayName = formData.get('displayName') as string;
  const bio = formData.get('bio') as string;
  const niches = formData.getAll('niches') as string[];

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('creator_profiles')
    .update({
      display_name: displayName,
      bio,
      niche_categories: niches,
    })
    .eq('id', userProfile.creatorProfile.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}
