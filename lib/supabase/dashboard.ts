import { createAdminClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────
// CREATOR DASHBOARD DATA
// ─────────────────────────────────────────────

export interface CreatorSubmission {
  id: string;
  post_url: string;
  status: string;
  submitted_at: string;
  reserved_amount: number;
  final_view_count: number | null;
  verified_at: string | null;
  payout_amount: number | null;
  campaign: {
    id: string;
    title: string;
    status: string;
    channels: string[];
    ad_format: string;
    cpm_rate: number;
    total_budget: number;
    min_view_threshold: number;
    created_at: string;
    updated_at: string;
    company_name?: string;
    company_logo?: string | null;
  };
}

export interface CreatorDashboardData {
  totalEarned: number;
  walletBalance: number;
  activeSubmissions: number;
  pendingAudits: number;
  completedCampaigns: number;
  submissions: CreatorSubmission[];
  recentNotifications: {
    id: string;
    knock_workflow_key: string;
    channel: string;
    payload: Record<string, unknown> | null;
    sent_at: string;
  }[];
}

export async function getCreatorDashboardData(profileId: string): Promise<CreatorDashboardData> {
  const supabase = createAdminClient();

  // Fetch creator profile for total_earned
  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('total_earned')
    .eq('profile_id', profileId)
    .single();

  // Fetch wallet balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'creator_earnings')
    .single();

  // Fetch submissions with joined campaign data
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id,
      post_url,
      status,
      submitted_at,
      reserved_amount,
      final_view_count,
      verified_at,
      payout_amount,
      campaign:campaigns (
        id,
        title,
        status,
        channels,
        ad_format,
        cpm_rate,
        total_budget,
        min_view_threshold,
        created_at,
        updated_at
      )
    `)
    .eq('creator_id', profileId)
    .order('submitted_at', { ascending: false })
    .limit(20);

  // Fetch recent notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, knock_workflow_key, channel, payload, sent_at')
    .eq('profile_id', profileId)
    .order('sent_at', { ascending: false })
    .limit(10);

  const subs = (submissions || []) as unknown as CreatorSubmission[];

  return {
    totalEarned: Number(creatorProfile?.total_earned || 0),
    walletBalance: Number(wallet?.balance || 0),
    activeSubmissions: subs.filter((s) => s.status === 'pending').length,
    pendingAudits: subs.filter((s) => s.status === 'pending').length,
    completedCampaigns: subs.filter((s) => s.status === 'paid' || s.status === 'verified_pass').length,
    submissions: subs,
    recentNotifications: notifications || [],
  };
}

// ─────────────────────────────────────────────
// ADVERTISER DASHBOARD DATA
// ─────────────────────────────────────────────

export interface AdvertiserCampaign {
  id: string;
  title: string;
  campaign_code: string | null;
  description: string;
  ad_format: string;
  cpm_rate: number;
  total_budget: number;
  reserved_budget: number;
  spent_budget: number;
  status: string;
  channels: string[];
  created_at: string;
  updated_at: string;
  creators_count: number;
  company_logo: string | null;
}

export interface AdvertiserDashboardData {
  totalSpent: number;
  walletBalance: number;
  activeCampaigns: number;
  pendingSubmissions: number;
  campaigns: AdvertiserCampaign[];
  recentNotifications: {
    id: string;
    knock_workflow_key: string;
    channel: string;
    payload: Record<string, unknown> | null;
    sent_at: string;
  }[];
  advertiserAvatarUrl: string | null;
}

export async function getAdvertiserDashboardData(profileId: string): Promise<AdvertiserDashboardData> {
  const supabase = createAdminClient();

  // Fetch advertiser profile avatar
  const { data: advProfile } = await supabase
    .from('advertiser_profiles')
    .select('profile:profiles(avatar_url)')
    .eq('profile_id', profileId)
    .maybeSingle();

  const advertiserAvatarUrl = (advProfile as any)?.profile?.avatar_url || null;

  // Fetch wallet balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'advertiser_funding')
    .single();

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      id, 
      title, 
      campaign_code,
      description, 
      ad_format, 
      cpm_rate, 
      total_budget, 
      reserved_budget, 
      spent_budget, 
      status, 
      channels,
      created_at, 
      updated_at,
      submissions:submissions(id)
    `)
    .eq('advertiser_id', profileId)
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch pending submission count across all campaigns
  const campaignIds = (campaigns || []).map((c) => c.id);
  let pendingSubmissions = 0;
  if (campaignIds.length > 0) {
    const { count } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .in('campaign_id', campaignIds)
      .eq('status', 'pending');
    pendingSubmissions = count || 0;
  }

  // Fetch recent notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, knock_workflow_key, channel, payload, sent_at')
    .eq('profile_id', profileId)
    .order('sent_at', { ascending: false })
    .limit(10);

  const camps = (campaigns || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    campaign_code: c.campaign_code || null,
    description: c.description,
    ad_format: c.ad_format,
    cpm_rate: Number(c.cpm_rate),
    total_budget: Number(c.total_budget),
    reserved_budget: Number(c.reserved_budget),
    spent_budget: Number(c.spent_budget),
    status: c.status,
    channels: c.channels || [],
    created_at: c.created_at,
    updated_at: c.updated_at,
    creators_count: c.submissions ? c.submissions.length : 0,
    company_logo: advertiserAvatarUrl,
  })) as AdvertiserCampaign[];

  const totalSpent = camps.reduce((sum, c) => sum + Number(c.spent_budget || 0), 0);

  return {
    totalSpent,
    walletBalance: Number(wallet?.balance || 0),
    activeCampaigns: camps.filter((c) => c.status === 'live' || c.status === 'budget_committed').length,
    pendingSubmissions,
    campaigns: camps,
    recentNotifications: notifications || [],
    advertiserAvatarUrl,
  };
}

// ─────────────────────────────────────────────
// CAMPAIGN DETAILS FOR CREATORS
// ─────────────────────────────────────────────

export interface CampaignDetailsForCreator {
  campaign: {
    id: string;
    title: string;
    campaign_code: string | null;
    description: string;
    ad_format: string;
    requirements: Record<string, any>;
    cpm_rate: number;
    total_budget: number;
    reserved_budget: number;
    spent_budget: number;
    min_view_threshold: number;
    required_live_duration_hours: number;
    verification_grace_hours: number;
    status: string;
    channels: string[];
    created_at: string;
    company_name: string;
    company_logo: string | null;
  } | null;
  creatives: {
    id: string;
    file_url: string | null;
    copy_text: string | null;
    caption_suggestion: string | null;
  }[];
  submission: {
    id: string;
    social_account_id: string;
    post_url: string | null;
    screenshot_url: string | null;
    status: string;
    reserved_amount: number;
    final_view_count: number | null;
    verified_at: string | null;
    paid_at: string | null;
    payout_amount: number | null;
  } | null;
  socialAccounts: {
    id: string;
    platform: string;
    handle: string;
  }[];
  allSubmissions: {
    id: string;
    status: string;
    post_url: string | null;
    screenshot_url: string | null;
    reserved_amount: number;
    payout_amount: number | null;
    final_view_count: number | null;
    creator_handle: string;
    creator_avatar_url: string | null;
  }[];
}

export async function getCampaignDetailsForCreator(
  campaignId: string,
  creatorProfileId?: string | null
): Promise<CampaignDetailsForCreator> {
  const supabase = createAdminClient();

  // 1. Fetch Campaign with Advertiser profile joined
  const { data: campaign } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      campaign_code,
      description,
      ad_format,
      requirements,
      cpm_rate,
      total_budget,
      reserved_budget,
      spent_budget,
      min_view_threshold,
      required_live_duration_hours,
      verification_grace_hours,
      status,
      channels,
      created_at,
      advertiser:advertiser_profiles (
        company_name,
        profile:profiles (
          avatar_url
        )
      )
    `)
    .eq('id', campaignId)
    .single();

  const adv = campaign?.advertiser as any;
  const companyName = adv?.company_name || 'Brand Partner';
  const companyLogo = adv?.profile?.avatar_url || null;

  // 2. Fetch associated creatives
  const { data: creatives } = await supabase
    .from('campaign_creatives')
    .select('id, file_url, copy_text, caption_suggestion')
    .eq('campaign_id', campaignId);

  // 3. Fetch current creator's submission for this campaign (if logged in)
  const { data: submission } = creatorProfileId
    ? await supabase
        .from('submissions')
        .select('id, social_account_id, post_url, screenshot_url, status, reserved_amount, final_view_count, verified_at, paid_at, payout_amount')
        .eq('campaign_id', campaignId)
        .eq('creator_id', creatorProfileId)
        .maybeSingle()
    : { data: null };

  // 4. Fetch creator's social accounts (if logged in)
  const { data: socialAccounts } = creatorProfileId
    ? await supabase
        .from('social_accounts')
        .select('id, platform, handle')
        .eq('creator_id', creatorProfileId)
    : { data: [] };

  // 5. Fetch all submissions for this campaign (for leaderboard & aggregates)
  const { data: allSubs } = await supabase
    .from('submissions')
    .select(`
      id,
      status,
      post_url,
      screenshot_url,
      reserved_amount,
      payout_amount,
      final_view_count,
      creator:creator_profiles(
        display_name,
        profile:profiles(
          full_name,
          avatar_url
        )
      )
    `)
    .eq('campaign_id', campaignId);

  const mappedAllSubs = (allSubs || []).map((sub: any) => {
    const creatorHandle = sub.creator?.display_name || sub.creator?.profile?.full_name || 'Anonymous Creator';
    const creatorAvatar = sub.creator?.profile?.avatar_url || null;

    return {
      id: sub.id,
      status: sub.status,
      post_url: sub.post_url,
      screenshot_url: sub.screenshot_url,
      reserved_amount: Number(sub.reserved_amount),
      payout_amount: sub.payout_amount ? Number(sub.payout_amount) : null,
      final_view_count: sub.final_view_count ? Number(sub.final_view_count) : null,
      creator_handle: creatorHandle.startsWith('@') ? creatorHandle : `@${creatorHandle}`,
      creator_avatar_url: creatorAvatar,
    };
  });

  return {
    campaign: campaign
      ? {
          id: campaign.id,
          title: campaign.title,
          campaign_code: campaign.campaign_code || null,
          description: campaign.description,
          ad_format: campaign.ad_format,
          requirements: campaign.requirements as Record<string, any>,
          cpm_rate: Number(campaign.cpm_rate),
          total_budget: Number(campaign.total_budget),
          reserved_budget: Number(campaign.reserved_budget),
          spent_budget: Number(campaign.spent_budget),
          min_view_threshold: campaign.min_view_threshold,
          required_live_duration_hours: campaign.required_live_duration_hours,
          verification_grace_hours: campaign.verification_grace_hours,
          status: campaign.status,
          channels: campaign.channels || [],
          created_at: campaign.created_at,
          company_name: companyName,
          company_logo: companyLogo,
        }
      : null,
    creatives: creatives || [],
    submission: submission
      ? {
          id: submission.id,
          social_account_id: submission.social_account_id,
          post_url: submission.post_url,
          screenshot_url: submission.screenshot_url,
          status: submission.status,
          reserved_amount: Number(submission.reserved_amount),
          final_view_count: submission.final_view_count,
          verified_at: submission.verified_at,
          paid_at: submission.paid_at,
          payout_amount: submission.payout_amount ? Number(submission.payout_amount) : null,
        }
      : null,
    socialAccounts: socialAccounts || [],
    allSubmissions: mappedAllSubs,
  };
}

