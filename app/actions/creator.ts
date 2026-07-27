'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';

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
  if (!amount || amount < 1000) {
    return { success: false, error: 'Minimum withdrawal amount is ₦1,000' };
  }

  const supabase = createAdminClient();
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, wallet_balance, total_earned')
    .eq('id', userProfile.creatorProfile.id)
    .single();

  if (!creator || creator.wallet_balance < amount) {
    return { success: false, error: 'Insufficient wallet balance' };
  }

  const newBalance = creator.wallet_balance - amount;

  const { error: updateError } = await supabase
    .from('creator_profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', creator.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await supabase.from('wallet_transactions').insert({
    creator_id: creator.id,
    transaction_type: 'withdrawal',
    amount: amount,
    status: 'processing',
    created_at: new Date().toISOString(),
  });

  revalidatePath('/earnings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function saveBankAccountAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized' };
  }

  const bankCode = formData.get('bankCode') as string;
  const bankName = formData.get('bankName') as string;
  const accountNumber = formData.get('accountNumber') as string;
  const accountName = formData.get('accountName') as string;

  if (!bankCode || !accountNumber || !accountName) {
    return { success: false, error: 'Bank details are incomplete' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('creator_profiles')
    .update({
      bank_code: bankCode,
      bank_name: bankName || 'Bank',
      account_number: accountNumber,
      account_name: accountName,
    })
    .eq('id', userProfile.creatorProfile.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/earnings');
  return { success: true };
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
