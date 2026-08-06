import { createAdminClient } from '@/lib/supabase/server';

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
  views_delivered: number;
  company_logo: string | null;
}

export interface AdvertiserDashboardData {
  totalSpent: number;
  walletBalance: number;
  escrowLocked: number;
  activeCampaigns: number;
  totalViewsDelivered: number;
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
  companyName: string;
}

export async function getAdvertiserDashboardData(profileId: string): Promise<AdvertiserDashboardData> {
  const supabase = createAdminClient();

  // Fetch advertiser profile
  const { data: advProfile } = await supabase
    .from('advertiser_profiles')
    .select('company_name, profile:profiles(avatar_url)')
    .eq('profile_id', profileId)
    .maybeSingle();

  const companyName = advProfile?.company_name || 'Brand Partner';
  const advertiserAvatarUrl = (advProfile as any)?.profile?.avatar_url || null;

  // Fetch wallet balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'advertiser_funding')
    .maybeSingle();

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
      submissions:submissions(id, status, views_count, final_view_count)
    `)
    .eq('advertiser_id', profileId)
    .order('created_at', { ascending: false });

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

  let totalViewsDelivered = 0;

  const camps = (campaigns || []).map((c: any) => {
    const subs = c.submissions || [];
    const campaignViews = subs.reduce(
      (sum: number, s: any) => sum + Number(s.final_view_count || s.views_count || 0),
      0
    );
    totalViewsDelivered += campaignViews;

    return {
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
      creators_count: subs.length,
      views_delivered: campaignViews,
      company_logo: advertiserAvatarUrl,
    };
  }) as AdvertiserCampaign[];

  const totalSpent = camps.reduce((sum, c) => sum + Number(c.spent_budget || 0), 0);
  const escrowLocked = camps
    .filter((c) => c.status === 'live' || c.status === 'budget_committed')
    .reduce((sum, c) => sum + Math.max(0, c.total_budget - c.spent_budget), 0);

  return {
    totalSpent,
    walletBalance: Number(wallet?.balance || 0),
    escrowLocked,
    activeCampaigns: camps.filter((c) => c.status === 'live' || c.status === 'budget_committed').length,
    totalViewsDelivered,
    pendingSubmissions,
    campaigns: camps,
    recentNotifications: notifications || [],
    advertiserAvatarUrl,
    companyName,
  };
}

// ─────────────────────────────────────────────
// BRAND CAMPAIGN DETAILS COMMAND CENTER DATA
// ─────────────────────────────────────────────

export interface BrandCampaignDetails {
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
  submissions: {
    id: string;
    creator_id: string;
    creator_handle: string;
    creator_avatar_url: string | null;
    social_account_platform: string;
    post_url: string | null;
    screenshot_url: string | null;
    status: string;
    reserved_amount: number;
    views_count: number;
    final_view_count: number | null;
    payout_amount: number | null;
    submitted_at: string;
    verified_at: string | null;
    rejection_reason?: string | null;
  }[];
  metrics: {
    totalViews: number;
    verifiedSubmissions: number;
    pendingAudits: number;
    rejectedSubmissions: number;
    cpmEfficiency: number;
  };
}

export async function getBrandCampaignDetails(
  campaignId: string,
  advertiserProfileId: string
): Promise<BrandCampaignDetails> {
  const supabase = createAdminClient();

  // 1. Fetch Campaign
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
    .eq('advertiser_id', advertiserProfileId)
    .maybeSingle();

  const adv = campaign?.advertiser as any;
  const companyName = adv?.company_name || 'Brand Partner';
  const companyLogo = adv?.profile?.avatar_url || null;

  // 2. Fetch Associated Creatives
  const { data: creatives } = await supabase
    .from('campaign_creatives')
    .select('id, file_url, copy_text, caption_suggestion')
    .eq('campaign_id', campaignId);

  // 3. Fetch All Submissions for this Campaign
  const { data: rawSubmissions } = await supabase
    .from('submissions')
    .select(`
      id,
      creator_id,
      post_url,
      screenshot_url,
      status,
      reserved_amount,
      views_count,
      final_view_count,
      payout_amount,
      submitted_at,
      verified_at,
      rejection_reason,
      social_account:social_accounts (
        platform
      ),
      creator:creator_profiles (
        display_name,
        profile:profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('campaign_id', campaignId)
    .order('submitted_at', { ascending: false });

  let totalViews = 0;
  let verifiedSubmissions = 0;
  let pendingAudits = 0;
  let rejectedSubmissions = 0;

  const mappedSubmissions = (rawSubmissions || []).map((sub: any) => {
    const handle = sub.creator?.display_name || sub.creator?.profile?.full_name || 'Anonymous Creator';
    const views = Number(sub.final_view_count || sub.views_count || 0);
    totalViews += views;

    if (sub.status === 'verified_pass' || sub.status === 'paid') verifiedSubmissions++;
    else if (sub.status === 'pending' || sub.status === 'auditing') pendingAudits++;
    else if (sub.status === 'rejected' || sub.status === 'verified_fail') rejectedSubmissions++;

    return {
      id: sub.id,
      creator_id: sub.creator_id,
      creator_handle: handle.startsWith('@') ? handle : `@${handle}`,
      creator_avatar_url: sub.creator?.profile?.avatar_url || null,
      social_account_platform: sub.social_account?.platform || 'tiktok',
      post_url: sub.post_url,
      screenshot_url: sub.screenshot_url,
      status: sub.status,
      reserved_amount: Number(sub.reserved_amount),
      views_count: views,
      final_view_count: sub.final_view_count ? Number(sub.final_view_count) : null,
      payout_amount: sub.payout_amount ? Number(sub.payout_amount) : null,
      submitted_at: sub.submitted_at,
      verified_at: sub.verified_at,
      rejection_reason: sub.rejection_reason || null,
    };
  });

  const cpmRate = Number(campaign?.cpm_rate || 0);
  const spentBudget = Number(campaign?.spent_budget || 0);
  const cpmEfficiency = totalViews > 0 ? (spentBudget / totalViews) * 1000 : cpmRate;

  return {
    campaign: campaign
      ? {
          id: campaign.id,
          title: campaign.title,
          campaign_code: campaign.campaign_code || null,
          description: campaign.description,
          ad_format: campaign.ad_format,
          requirements: campaign.requirements as Record<string, any>,
          cpm_rate: cpmRate,
          total_budget: Number(campaign.total_budget),
          reserved_budget: Number(campaign.reserved_budget),
          spent_budget: spentBudget,
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
    submissions: mappedSubmissions,
    metrics: {
      totalViews,
      verifiedSubmissions,
      pendingAudits,
      rejectedSubmissions,
      cpmEfficiency,
    },
  };
}

// ─────────────────────────────────────────────
// BRAND WALLET & ESCROW DATA
// ─────────────────────────────────────────────

export interface BrandWalletData {
  walletBalance: number;
  totalEscrowLocked: number;
  totalSpent: number;
  transactions: {
    id: string;
    transaction_type: string;
    amount: number;
    status: string;
    reference: string;
    created_at: string;
  }[];
  activeCampaignsEscrow: {
    id: string;
    title: string;
    total_budget: number;
    spent_budget: number;
    escrow_remaining: number;
  }[];
}

export async function getBrandWalletData(profileId: string): Promise<BrandWalletData> {
  const supabase = createAdminClient();

  // Fetch wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'advertiser_funding')
    .maybeSingle();

  // Fetch transactions
  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('id, transaction_type, amount, status, reference, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(30);

  // Fetch active campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, title, total_budget, spent_budget, status')
    .eq('advertiser_id', profileId)
    .or('status.eq.live,status.eq.budget_committed');

  let totalEscrowLocked = 0;
  const activeCampaignsEscrow = (campaigns || []).map((c) => {
    const remaining = Math.max(0, Number(c.total_budget) - Number(c.spent_budget));
    totalEscrowLocked += remaining;
    return {
      id: c.id,
      title: c.title,
      total_budget: Number(c.total_budget),
      spent_budget: Number(c.spent_budget),
      escrow_remaining: remaining,
    };
  });

  const txs = (transactions || []).map((t) => ({
    id: t.id,
    transaction_type: t.transaction_type,
    amount: Number(t.amount),
    status: t.status,
    reference: t.reference,
    created_at: t.created_at,
  }));

  const totalSpent = txs
    .filter((t) => t.transaction_type === 'campaign_allocation' || t.transaction_type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    walletBalance: Number(wallet?.balance || 0),
    totalEscrowLocked,
    totalSpent,
    transactions: txs,
    activeCampaignsEscrow,
  };
}

// ─────────────────────────────────────────────
// CREATOR DISCOVERY DIRECTORY DATA FOR BRANDS
// ─────────────────────────────────────────────

export interface DirectoryCreator {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  category: string;
  bio: string | null;
  kycStatus: string;
  totalEarned: number;
  verifiedAccounts: {
    platform: string;
    handle: string;
    followerCount: number;
  }[];
  totalViewsGenerated: number;
  campaignsCompleted: number;
}

export async function getBrandCreatorsDirectory(): Promise<DirectoryCreator[]> {
  const supabase = createAdminClient();

  const { data: creators } = await supabase
    .from('creator_profiles')
    .select(`
      profile_id,
      display_name,
      category,
      bio,
      kyc_status,
      total_earned,
      profile:profiles (
        avatar_url,
        full_name
      ),
      social_accounts:social_accounts (
        platform,
        handle,
        follower_count,
        verification_status
      ),
      submissions:submissions (
        id,
        status,
        final_view_count,
        views_count
      )
    `)
    .limit(40);

  return (creators || []).map((c: any) => {
    const name = c.display_name || c.profile?.full_name || 'Verified Creator';
    const accounts = (c.social_accounts || [])
      .filter((sa: any) => sa.verification_status === 'verified')
      .map((sa: any) => ({
        platform: sa.platform,
        handle: sa.handle.startsWith('@') ? sa.handle : `@${sa.handle}`,
        followerCount: Number(sa.follower_count || 0),
      }));

    const subs = c.submissions || [];
    const totalViews = subs.reduce((sum: number, s: any) => sum + Number(s.final_view_count || s.views_count || 0), 0);
    const completed = subs.filter((s: any) => s.status === 'verified_pass' || s.status === 'paid').length;

    return {
      profileId: c.profile_id,
      displayName: name.startsWith('@') ? name : `@${name}`,
      avatarUrl: c.profile?.avatar_url || null,
      category: c.category || 'General Creator',
      bio: c.bio || null,
      kycStatus: c.kyc_status || 'unverified',
      totalEarned: Number(c.total_earned || 0),
      verifiedAccounts: accounts,
      totalViewsGenerated: totalViews,
      campaignsCompleted: completed,
    };
  });
}
