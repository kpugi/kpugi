'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/server';

export interface ConnectedSocialAccountItem {
  id: string;
  creator_id: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'x' | 'facebook';
  handle: string;
  display_name: string | null;
  bio: string | null;
  platform_user_id: string;
  follower_count: number | null;
  following_count: number | null;
  likes_count: number | null;
  video_count: number | null;
  verification_status: 'verified' | 'pending' | 'unverified' | 'failed';
  verification_method: string | null;
  verification_code: string | null;
  connected_at: string;
  verified_at: string | null;
  last_synced_at: string | null;
  creator: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    creator_handle: string | null;
  };
  submissions_count?: number;
}

export interface SocialAccountsOverview {
  accounts: ConnectedSocialAccountItem[];
  metrics: {
    totalAccounts: number;
    verifiedAccounts: number;
    unverifiedAccounts: number;
    totalAudienceReach: number;
    platformBreakdown: {
      tiktok: number;
      instagram: number;
      youtube: number;
      x: number;
      facebook: number;
    };
  };
}

export interface AccountSubmissionItem {
  id: string;
  campaign_id: string;
  status: string;
  final_view_count: number;
  payout_amount: number;
  post_url: string;
  submitted_at: string;
  paid_at: string | null;
  campaign?: {
    title: string;
    status: string;
    ad_format: string;
  } | null;
}

export interface SocialAccountDetailResponse {
  account: ConnectedSocialAccountItem;
  submissions: AccountSubmissionItem[];
  metrics: {
    totalSubmissions: number;
    approvedSubmissions: number;
    totalViewsGenerated: number;
    totalPayoutEarned: number;
  };
}

/**
 * Fetch all connected social media accounts with joined creator profile details
 */
export async function fetchConnectedSocialAccountsAction(): Promise<SocialAccountsOverview> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('social_accounts')
    .select(`
      id,
      creator_id,
      platform,
      handle,
      display_name,
      bio,
      platform_user_id,
      follower_count,
      following_count,
      likes_count,
      video_count,
      verification_status,
      verification_method,
      verification_code,
      connected_at,
      verified_at,
      last_synced_at,
      creator_profiles:creator_profiles!social_accounts_creator_id_fkey(
        display_name,
        creator_handle,
        profile:profiles!creator_profiles_profile_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .order('connected_at', { ascending: false });

  if (error) {
    console.error('[fetchConnectedSocialAccountsAction] Query error:', error);
    throw new Error(`Failed to load social accounts: ${error.message}`);
  }

  const rawList = data || [];
  let totalAudienceReach = 0;
  let verifiedAccounts = 0;
  let unverifiedAccounts = 0;
  const platformBreakdown = {
    tiktok: 0,
    instagram: 0,
    youtube: 0,
    x: 0,
    facebook: 0,
  };

  const formattedAccounts: ConnectedSocialAccountItem[] = rawList.map((row: any) => {
    const followers = Number(row.follower_count) || 0;
    totalAudienceReach += followers;

    const isVerified = row.verification_status === 'verified';
    if (isVerified) verifiedAccounts++;
    else unverifiedAccounts++;

    const plat = (row.platform || '').toLowerCase() as keyof typeof platformBreakdown;
    if (plat in platformBreakdown) {
      platformBreakdown[plat]++;
    }

    const creatorProfile = row.creator_profiles;
    const userProfile = creatorProfile?.profile;

    return {
      id: row.id,
      creator_id: row.creator_id,
      platform: row.platform,
      handle: row.handle,
      display_name: row.display_name || creatorProfile?.display_name || null,
      bio: row.bio || null,
      platform_user_id: row.platform_user_id,
      follower_count: row.follower_count,
      following_count: row.following_count,
      likes_count: row.likes_count,
      video_count: row.video_count,
      verification_status: row.verification_status || 'unverified',
      verification_method: row.verification_method || null,
      verification_code: row.verification_code || null,
      connected_at: row.connected_at,
      verified_at: row.verified_at || null,
      last_synced_at: row.last_synced_at || null,
      creator: {
        id: userProfile?.id || row.creator_id,
        full_name: userProfile?.full_name || 'Creator User',
        email: userProfile?.email || null,
        avatar_url: userProfile?.avatar_url || null,
        creator_handle: creatorProfile?.creator_handle || null,
      },
    };
  });

  return {
    accounts: formattedAccounts,
    metrics: {
      totalAccounts: formattedAccounts.length,
      verifiedAccounts,
      unverifiedAccounts,
      totalAudienceReach,
      platformBreakdown,
    },
  };
}

/**
 * Fetch detailed metrics and campaign submissions for a specific connected account
 */
export async function fetchSocialAccountDetailAction(
  accountId: string
): Promise<SocialAccountDetailResponse> {
  await requireAdminSession();
  const supabase = createAdminClient();

  // 1. Fetch account info
  const { data: accountRow, error: accountError } = await supabase
    .from('social_accounts')
    .select(`
      id,
      creator_id,
      platform,
      handle,
      display_name,
      bio,
      platform_user_id,
      follower_count,
      following_count,
      likes_count,
      video_count,
      verification_status,
      verification_method,
      verification_code,
      connected_at,
      verified_at,
      last_synced_at,
      creator_profiles:creator_profiles!social_accounts_creator_id_fkey(
        display_name,
        creator_handle,
        profile:profiles!creator_profiles_profile_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq('id', accountId)
    .single();

  if (accountError || !accountRow) {
    throw new Error(`Social account not found: ${accountError?.message || 'ID does not exist'}`);
  }

  // 2. Fetch associated campaign submissions
  const { data: submissionsRows, error: subError } = await supabase
    .from('submissions')
    .select(`
      id,
      campaign_id,
      status,
      final_view_count,
      payout_amount,
      post_url,
      submitted_at,
      paid_at,
      campaign:campaigns(
        title,
        status,
        ad_format
      )
    `)
    .or(`social_account_id.eq.${accountId},creator_id.eq.${accountRow.creator_id}`)
    .order('submitted_at', { ascending: false });

  if (subError) {
    console.warn('[fetchSocialAccountDetailAction] Submissions warning:', subError);
  }

  const submissions: AccountSubmissionItem[] = (submissionsRows || []).map((sub: any) => ({
    id: sub.id,
    campaign_id: sub.campaign_id,
    status: sub.status,
    final_view_count: Number(sub.final_view_count) || 0,
    payout_amount: Number(sub.payout_amount) || 0,
    post_url: sub.post_url || '',
    submitted_at: sub.submitted_at,
    paid_at: sub.paid_at || null,
    campaign: Array.isArray(sub.campaign) ? sub.campaign[0] : sub.campaign,
  }));

  let totalViewsGenerated = 0;
  let totalPayoutEarned = 0;
  let approvedSubmissions = 0;

  for (const s of submissions) {
    totalViewsGenerated += s.final_view_count;
    totalPayoutEarned += s.payout_amount;
    if (s.status === 'approved' || s.status === 'paid') {
      approvedSubmissions++;
    }
  }

  const creatorProfile = (accountRow as any).creator_profiles;
  const userProfile = creatorProfile?.profile;

  const account: ConnectedSocialAccountItem = {
    id: accountRow.id,
    creator_id: accountRow.creator_id,
    platform: accountRow.platform as any,
    handle: accountRow.handle,
    display_name: accountRow.display_name || creatorProfile?.display_name || null,
    bio: accountRow.bio || null,
    platform_user_id: accountRow.platform_user_id,
    follower_count: accountRow.follower_count,
    following_count: accountRow.following_count,
    likes_count: accountRow.likes_count,
    video_count: accountRow.video_count,
    verification_status: accountRow.verification_status as any,
    verification_method: accountRow.verification_method,
    verification_code: accountRow.verification_code,
    connected_at: accountRow.connected_at,
    verified_at: accountRow.verified_at,
    last_synced_at: accountRow.last_synced_at,
    creator: {
      id: userProfile?.id || accountRow.creator_id,
      full_name: userProfile?.full_name || 'Creator User',
      email: userProfile?.email || null,
      avatar_url: userProfile?.avatar_url || null,
      creator_handle: creatorProfile?.creator_handle || null,
    },
    submissions_count: submissions.length,
  };

  return {
    account,
    submissions,
    metrics: {
      totalSubmissions: submissions.length,
      approvedSubmissions,
      totalViewsGenerated,
      totalPayoutEarned,
    },
  };
}

/**
 * Update verification status of a social account manually
 */
export async function updateSocialAccountVerificationAction(
  accountId: string,
  newStatus: 'verified' | 'unverified' | 'pending' | 'failed',
  note?: string
) {
  const { profile } = await requireAdminSession();
  const supabase = createAdminClient();

  const updatePayload: Record<string, any> = {
    verification_status: newStatus,
  };

  if (newStatus === 'verified') {
    updatePayload.verified_at = new Date().toISOString();
    updatePayload.verification_method = 'manual';
  } else {
    updatePayload.verified_at = null;
  }

  const { error } = await supabase
    .from('social_accounts')
    .update(updatePayload)
    .eq('id', accountId);

  if (error) {
    throw new Error(`Failed to update verification status: ${error.message}`);
  }

  await logAuditEvent({
    profileId: profile.id,
    actorRole: 'admin',
    action: 'social_account.verification.update',
    targetTable: 'social_accounts',
    targetId: accountId,
    details: note || `Updated social account verification status to ${newStatus}`,
    payload: { accountId, newStatus },
  });

  revalidatePath('/admin/accounts');
  revalidatePath(`/admin/accounts/${accountId}`);

  return { success: true, newStatus };
}

/**
 * Disconnect or revoke a social media account connection
 */
export async function disconnectSocialAccountAction(
  accountId: string,
  reason?: string
) {
  const { profile } = await requireAdminSession();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('social_accounts')
    .update({
      revoked_at: new Date().toISOString(),
      verification_status: 'unverified',
    })
    .eq('id', accountId);

  if (error) {
    throw new Error(`Failed to disconnect account: ${error.message}`);
  }

  await logAuditEvent({
    profileId: profile.id,
    actorRole: 'admin',
    action: 'social_account.disconnect',
    targetTable: 'social_accounts',
    targetId: accountId,
    details: reason || 'Admin disconnected connected social account',
    payload: { accountId, reason },
  });

  revalidatePath('/admin/accounts');
  revalidatePath(`/admin/accounts/${accountId}`);

  return { success: true };
}
