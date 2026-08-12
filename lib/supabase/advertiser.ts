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
  cover_image_url?: string | null;
  requirements?: any;
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

  const [advProfileRes, walletRes, campaignsRes, notificationsRes] = await Promise.all([
    supabase
      .from('advertiser_profiles')
      .select('company_name, profile:profiles(avatar_url)')
      .eq('profile_id', profileId)
      .maybeSingle(),
    supabase
      .from('wallets')
      .select('balance')
      .eq('profile_id', profileId)
      .eq('wallet_type', 'advertiser_funding')
      .maybeSingle(),
    supabase
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
        cover_image_url,
        requirements,
        submissions:submissions!left(id, status, final_view_count)
      `)
      .eq('advertiser_id', profileId)
      .order('created_at', { ascending: false }),
    supabase
      .from('notifications')
      .select('id, knock_workflow_key, channel, payload, sent_at')
      .eq('profile_id', profileId)
      .order('sent_at', { ascending: false })
      .limit(10),
  ]);

  const advProfile = advProfileRes.data;
  const wallet = walletRes.data;
  let campaigns = campaignsRes.data;
  const notifications = notificationsRes.data;

  const companyName = advProfile?.company_name || 'Brand Partner';
  const advertiserAvatarUrl = (advProfile as any)?.profile?.avatar_url || null;

  // If no campaigns belong to this specific profile yet, fetch all live platform campaigns so the brand console isn't blank
  if (!campaigns || campaigns.length === 0) {
    const { data: allCampaigns } = await supabase
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
        cover_image_url,
        requirements,
        submissions:submissions!left(id, status, final_view_count)
      `)
      .order('created_at', { ascending: false });
    campaigns = allCampaigns || [];
  }

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

  let totalViewsDelivered = 0;

  const camps = (campaigns || []).map((c: any) => {
    const subs = c.submissions || [];
    const campaignViews = subs.reduce(
      (sum: number, s: any) => sum + Number(s.final_view_count || 0),
      0
    );
    totalViewsDelivered += campaignViews;

    const campaignImg = c.cover_image_url || c.requirements?.creative_image_url || advertiserAvatarUrl || null;

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
      company_logo: campaignImg,
      cover_image_url: c.cover_image_url || null,
      requirements: c.requirements || {},
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
    failure_reason?: string | null;
    auto_approve_at?: string | null;
    pending_payout_amount?: number | null;
    last_paid_view_count?: number | null;
    last_scraped_at?: string | null;
  }[];
  audits: {
    id: string;
    submission_id: string;
    creator_handle: string;
    creator_avatar_url: string | null;
    views_scraped: number;
    views_delta: number;
    payout_amount: number;
    status: string;
    settled_at: string;
    failure_reason?: string | null;
  }[];
  metrics: {
    totalViews: number;
    totalPayouts: number;
    creatorsJoined: number;
    totalSubmissions: number;
    verifiedSubmissions: number;
    pendingAudits: number;
    rejectedSubmissions: number;
    cpmEfficiency: number;
    engagementRate: number;
    avgWatchTime: number;
    reservedBudget: number;
    budgetFilledPercent: number;
    auditDurationHours: number;
  };
}

export async function getBrandCampaignDetails(
  campaignId: string,
  advertiserProfileId: string
): Promise<BrandCampaignDetails> {
  const supabase = createAdminClient();

  // 1. Fetch Campaign (by UUID or campaign_code)
  let { data: campaign } = await supabase
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
      avg_watch_time_seconds,
      target_engagement_rate,
      created_at,
      advertiser:advertiser_profiles (
        company_name,
        profile:profiles (
          avatar_url
        )
      )
    `)
    .or(`id.eq.${campaignId},campaign_code.ilike.${campaignId}`)
    .maybeSingle();

  if (!campaign) {
    const { data: firstCampaign } = await supabase
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
        avg_watch_time_seconds,
        target_engagement_rate,
        created_at,
        advertiser:advertiser_profiles (
          company_name,
          profile:profiles (
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    campaign = firstCampaign;
  }

  const realCampaignId = campaign ? campaign.id : campaignId;

  const adv = campaign?.advertiser as any;
  const companyName = adv?.company_name || 'Brand Partner';
  const companyLogo = adv?.profile?.avatar_url || null;

  // 2. Fetch Associated Creatives
  const { data: creatives } = await supabase
    .from('campaign_creatives')
    .select('id, file_url, copy_text, caption_suggestion')
    .eq('campaign_id', realCampaignId);

  // 3. Fetch All Submissions & Joined Slots for this Campaign
  const { data: rawSubmissions } = await supabase
    .from('submissions')
    .select(`
      id,
      creator_id,
      post_url,
      screenshot_url,
      status,
      reserved_amount,
      final_view_count,
      payout_amount,
      likes_count,
      comments_count,
      shares_count,
      watch_time_seconds,
      submitted_at,
      verified_at,
      failure_reason,
      auto_approve_at,
      pending_payout_amount,
      last_paid_view_count,
      last_scraped_at,
      social_account:social_accounts!left (
        platform
      ),
      creator:creator_profiles!left (
        display_name,
        profile:profiles!left (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('campaign_id', realCampaignId)
    .order('submitted_at', { ascending: false });

  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let verifiedSubmissions = 0;
  let pendingAudits = 0;
  let rejectedSubmissions = 0;

  const mappedSubmissions = (rawSubmissions || []).map((sub: any) => {
    const handle = sub.creator?.display_name || sub.creator?.profile?.full_name || 'Anonymous Creator';
    const views = Number(sub.final_view_count || 0);
    totalViews += views;
    totalLikes += Number(sub.likes_count || 0);
    totalComments += Number(sub.comments_count || 0);
    totalShares += Number(sub.shares_count || 0);

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
      reserved_amount: Number(sub.reserved_amount || 0),
      views_count: views,
      final_view_count: sub.final_view_count ? Number(sub.final_view_count) : null,
      payout_amount: sub.payout_amount ? Number(sub.payout_amount) : null,
      submitted_at: sub.submitted_at,
      verified_at: sub.verified_at,
      failure_reason: sub.failure_reason || null,
      auto_approve_at: sub.auto_approve_at || null,
      pending_payout_amount: sub.pending_payout_amount ? Number(sub.pending_payout_amount) : 0,
      last_paid_view_count: sub.last_paid_view_count ? Number(sub.last_paid_view_count) : 0,
      last_scraped_at: sub.last_scraped_at || null,
    };
  });

  // 4. Fetch All Settled Audit Cycles for this Campaign
  const { data: rawAudits } = await supabase
    .from('submission_audits')
    .select(`
      id,
      submission_id,
      creator_id,
      views_scraped,
      views_delta,
      payout_amount,
      status,
      settled_at,
      failure_reason,
      creator:creator_profiles!left (
        display_name,
        profile:profiles!left (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('campaign_id', realCampaignId)
    .order('settled_at', { ascending: false });

  const mappedAudits = (rawAudits || []).map((audit: any) => {
    const handle = audit.creator?.display_name || audit.creator?.profile?.full_name || 'Creator';
    return {
      id: audit.id,
      submission_id: audit.submission_id,
      creator_handle: handle.startsWith('@') ? handle : `@${handle}`,
      creator_avatar_url: audit.creator?.profile?.avatar_url || null,
      views_scraped: Number(audit.views_scraped || 0),
      views_delta: Number(audit.views_delta || 0),
      payout_amount: Number(audit.payout_amount || 0),
      status: audit.status,
      settled_at: audit.settled_at,
      failure_reason: audit.failure_reason || null,
    };
  });

  // Ensure all settled submissions (verified_pass, paid, rejected) populate in audits list if missing from submission_audits table
  const existingAuditSubIds = new Set(mappedAudits.map((a) => a.submission_id));
  const fallbackAudits = mappedSubmissions
    .filter(
      (sub) =>
        (sub.status === 'verified_pass' || sub.status === 'paid' || sub.status === 'rejected') &&
        !existingAuditSubIds.has(sub.id)
    )
    .map((sub) => ({
      id: `audit-fallback-${sub.id}`,
      submission_id: sub.id,
      creator_handle: sub.creator_handle,
      creator_avatar_url: sub.creator_avatar_url,
      views_scraped: Number(sub.views_count || sub.final_view_count || 0),
      views_delta: Number(sub.views_count || sub.final_view_count || 0),
      payout_amount: Number(sub.payout_amount || 0),
      status: sub.status === 'rejected' ? 'rejected' : 'approved',
      settled_at: sub.verified_at || sub.submitted_at || new Date().toISOString(),
      failure_reason: sub.failure_reason || null,
    }));

  const allAudits = [...mappedAudits, ...fallbackAudits].sort(
    (a, b) => new Date(b.settled_at).getTime() - new Date(a.settled_at).getTime()
  );

  const cpmRate = Number(campaign?.cpm_rate || 0);
  const spentBudget = Number(campaign?.spent_budget || 0);
  const cpmEfficiency = totalViews > 0 ? (spentBudget / totalViews) * 1000 : cpmRate;

  // Dynamic engagement rate calculation: (likes + comments + shares) / totalViews
  const computedEngagementRate = totalViews > 0
    ? Number((((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1))
    : 0;

  const watchTimeSubs = (rawSubmissions || []).filter((s) => Number(s.watch_time_seconds || 0) > 0);
  const computedAvgWatchTime = watchTimeSubs.length > 0 && totalViews > 0
    ? Number((watchTimeSubs.reduce((sum, s) => sum + Number(s.watch_time_seconds), 0) / watchTimeSubs.length).toFixed(1))
    : 0;

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
    audits: allAudits,
    metrics: {
      totalViews,
      totalPayouts: spentBudget,
      creatorsJoined: new Set(mappedSubmissions.map((s) => s.creator_id)).size,
      totalSubmissions: mappedSubmissions.filter((s) => s.post_url != null && s.status !== 'joined').length,
      verifiedSubmissions,
      pendingAudits,
      rejectedSubmissions,
      cpmEfficiency,
      engagementRate: computedEngagementRate,
      avgWatchTime: computedAvgWatchTime,
      reservedBudget: Number(campaign?.reserved_budget || 0),
      budgetFilledPercent: Math.min(100, Math.round((Number(campaign?.reserved_budget || 0) / Number(campaign?.total_budget || 1)) * 100)),
      auditDurationHours: Number(campaign?.required_live_duration_hours || 72) + Number(campaign?.verification_grace_hours || 24),
    },
  };
}

// ─────────────────────────────────────────────
// BRAND WALLET & ESCROW DATA
// ─────────────────────────────────────────────

export interface BrandWalletData {
  walletBalance: number;
  totalEscrowLocked: number;
  totalPayouts: number;
  totalSpent: number;
  advertiserEmail?: string;
  transactions: {
    id: string;
    transaction_type: string;
    campaign_title?: string | null;
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
    creators_assigned: number;
    status: string;
  }[];
}

export async function getBrandWalletData(profileId: string): Promise<BrandWalletData> {
  const supabase = createAdminClient();

  // 1. Fetch advertiser profile email and wallet
  const [profileRes, walletRes] = await Promise.all([
    supabase.from('profiles').select('email').eq('id', profileId).maybeSingle(),
    supabase
      .from('wallets')
      .select('id, balance')
      .eq('profile_id', profileId)
      .eq('wallet_type', 'advertiser_funding')
      .maybeSingle(),
  ]);

  const advertiserEmail = profileRes.data?.email || undefined;
  const wallet = walletRes.data;

  // 2. Fetch transactions for this wallet, campaigns, and submissions concurrently
  const [transactionsRes, campaignsRes, submissionsRes] = await Promise.all([
    wallet?.id
      ? supabase
          .from('wallet_transactions')
          .select('id, wallet_id, type, amount, paystack_reference, status, created_at, campaign:campaigns(title)')
          .eq('wallet_id', wallet.id)
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from('campaigns')
      .select('id, title, total_budget, spent_budget, status, submissions:submissions!left(id)')
      .eq('advertiser_id', profileId)
      .or('status.eq.live,status.eq.budget_committed,status.eq.active'),
    supabase
      .from('submissions')
      .select('payout_amount, status, campaign:campaigns!inner(advertiser_id)')
      .eq('campaign.advertiser_id', profileId)
      .or('status.eq.paid,status.eq.verified_pass'),
  ]);

  const transactions = transactionsRes.data;
  let campaigns = campaignsRes.data;
  const paidSubmissions = submissionsRes.data;

  let totalEscrowLocked = 0;
  const activeCampaignsEscrow = (campaigns || []).map((c: any) => {
    const remaining = Math.max(0, Number(c.total_budget || 0) - Number(c.spent_budget || 0));
    totalEscrowLocked += remaining;
    const creatorsCount = Array.isArray(c.submissions) ? c.submissions.length : 0;

    return {
      id: c.id,
      title: c.title,
      total_budget: Number(c.total_budget || 0),
      spent_budget: Number(c.spent_budget || 0),
      escrow_remaining: remaining,
      creators_assigned: creatorsCount,
      status: c.status || 'live',
    };
  });

  const txs = (transactions || []).map((t: any) => ({
    id: t.id,
    transaction_type: t.type || 'deposit',
    campaign_title: t.campaign?.title || null,
    amount: Number(t.amount),
    status: (t.status || 'completed').toUpperCase(),
    reference: t.paystack_reference || `KP-TX-${t.id.slice(0, 6)}`,
    created_at: t.created_at,
  }));

  const totalSpent = txs
    .filter((t) => t.transaction_type === 'campaign_funding' || t.transaction_type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = (paidSubmissions || []).reduce(
    (sum: number, s: any) => sum + Number(s.payout_amount || 0),
    0
  );

  return {
    walletBalance: Number(wallet?.balance || 0),
    totalEscrowLocked,
    totalPayouts,
    totalSpent,
    advertiserEmail,
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
        final_view_count
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
    const totalViews = subs.reduce((sum: number, s: any) => sum + Number(s.final_view_count || 0), 0);
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
