import { createAdminClient } from '@/lib/supabase/server';
import { getCreatorLevel } from '@/lib/utils/levels';

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
  totalVerifiedViews: number;
  submissions: CreatorSubmission[];
  featuredSubmission?: CreatorSubmission;
  recommendedCampaigns: any[];
  recentSettlements: any[];
  recentNotifications: {
    id: string;
    knock_workflow_key: string;
    channel: string;
    payload: Record<string, unknown> | null;
    sent_at: string;
  }[];
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export async function getCreatorDashboardData(profileId: string): Promise<CreatorDashboardData> {
  const supabase = createAdminClient();

  // Fetch creator profile for total_earned & kyc_status
  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('id, total_earned, kyc_status')
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`)
    .maybeSingle();

  const creatorProfileId = creatorProfile?.id;
  const creatorIds = [profileId, creatorProfileId].filter(Boolean) as string[];
  const creatorOrFilter = creatorIds.map((id) => `creator_id.eq.${id}`).join(',');

  // Fetch wallet balance, submissions, notifications, and audits concurrently
  const [walletRes, rawSubmissionsRes, notificationsRes, auditsRes] = await Promise.all([
    supabase
      .from('wallets')
      .select('balance')
      .eq('profile_id', profileId)
      .eq('wallet_type', 'creator_earnings')
      .maybeSingle(),
    supabase
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
          updated_at,
          cover_image_url,
          advertiser:advertiser_profiles (
            company_name,
            profile:profiles (
              avatar_url
            )
          )
        )
      `)
      .or(creatorOrFilter)
      .order('submitted_at', { ascending: false })
      .limit(20),
    supabase
      .from('notifications')
      .select('id, knock_workflow_key, channel, payload, sent_at')
      .eq('profile_id', profileId)
      .order('sent_at', { ascending: false })
      .limit(10),
    supabase
      .from('submission_audits')
      .select(`
        id,
        submission_id,
        campaign_id,
        views_scraped,
        views_delta,
        payout_amount,
        status,
        settled_at,
        created_at,
        campaign:campaigns (
          id,
          title,
          cpm_rate
        )
      `)
      .or(creatorOrFilter)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const rawSubmissions = rawSubmissionsRes.data || [];
  const notifications = notificationsRes.data || [];
  const rawAudits = auditsRes.data || [];

  const subs: CreatorSubmission[] = rawSubmissions.map((sub: any) => {
    const campaignObj = Array.isArray(sub.campaign) ? sub.campaign[0] : sub.campaign;
    const adv = campaignObj?.advertiser as any;
    const campaignImg = campaignObj?.cover_image_url || adv?.profile?.avatar_url || null;

    return {
      id: sub.id,
      post_url: sub.post_url,
      status: sub.status,
      submitted_at: sub.submitted_at,
      reserved_amount: sub.reserved_amount,
      final_view_count: sub.final_view_count,
      verified_at: sub.verified_at,
      payout_amount: sub.payout_amount,
      campaign: {
        ...campaignObj,
        company_name: adv?.company_name || 'Brand Partner',
        company_logo: campaignImg,
      },
    };
  });

  const activeSubmissions = subs.filter(
    (s) => s.status === 'pending' || s.status === 'under_review' || s.status === 'approved' || s.status === 'reserved' || s.status === 'joined'
  ).length;

  const pendingAudits = subs.filter((s) => s.status === 'under_review' || s.status === 'pending').length;
  const completedCampaigns = subs.filter((s) => s.status === 'paid' || s.status === 'completed' || s.status === 'verified_pass').length;
  const totalVerifiedViews = subs.reduce((sum, s) => sum + (s.final_view_count || 0), 0);
  const featured = subs.find((s) => s.status === 'under_review' || s.status === 'pending' || s.status === 'reserved' || s.status === 'joined') || subs[0];

  const joinedCampaignIds = subs.map((s) => s.campaign?.id).filter(Boolean);
  const { data: rawRecs } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      status,
      channels,
      ad_format,
      cpm_rate,
      total_budget,
      min_view_threshold,
      created_at,
      cover_image_url,
      advertiser:advertiser_profiles (
        company_name,
        profile:profiles (
          avatar_url
        )
      )
    `)
    .in('status', ['active', 'live'])
    .order('cpm_rate', { ascending: false })
    .limit(6);

  const recommendedCampaigns = (rawRecs || [])
    .filter((c: any) => !joinedCampaignIds.includes(c.id))
    .slice(0, 3)
    .map((c: any) => {
      const adv = Array.isArray(c.advertiser) ? c.advertiser[0] : c.advertiser;
      return {
        ...c,
        company_name: adv?.company_name || 'Brand Partner',
        company_logo: c.cover_image_url || adv?.profile?.avatar_url || null,
      };
    });

  const recentSettlements = rawAudits.map((a: any) => {
    const camp = Array.isArray(a.campaign) ? a.campaign[0] : a.campaign;
    return {
      id: a.id,
      campaignTitle: camp?.title || 'Brand Campaign',
      payoutAmount: Number(a.payout_amount || 0),
      viewsDelta: Number(a.views_delta || a.views_scraped || 0),
      status: a.status,
      settledAt: a.settled_at || a.created_at,
    };
  });

  return {
    totalEarned: Number(creatorProfile?.total_earned || 0),
    walletBalance: Number(walletRes.data?.balance || 0),
    activeSubmissions,
    pendingAudits,
    completedCampaigns,
    totalVerifiedViews,
    submissions: subs,
    featuredSubmission: featured,
    recommendedCampaigns,
    recentSettlements,
    recentNotifications: notifications,
    kycStatus: (creatorProfile?.kyc_status as any) || 'unverified',
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
  escrowLocked?: number;
  activeCampaigns: number;
  totalViewsDelivered?: number;
  pendingSubmissions: number;
  activeCreatorsCount?: number;
  recentActivity?: any[];
  campaigns: AdvertiserCampaign[];
  recentNotifications: {
    id: string;
    knock_workflow_key: string;
    channel: string;
    payload: Record<string, unknown> | null;
    sent_at: string;
  }[];
  advertiserAvatarUrl: string | null;
  companyName?: string;
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
  const { data: rawCampaigns } = await supabase
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
      requirements,
      deleted,
      submissions:submissions(id)
    `)
    .eq('advertiser_id', profileId)
    .eq('deleted', false)
    .order('created_at', { ascending: false })
    .limit(20);

  const campaigns = (rawCampaigns || []).filter((c: any) => !c.deleted && !c.requirements?.is_deleted);

  // Fetch pending submission count across all campaigns
  const campaignIds = campaigns.map((c) => c.id);
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
    cover_image_url?: string | null;
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
    avg_watch_time_seconds?: number;
    target_engagement_rate?: number;
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
    submitted_at?: string | null;
    auto_approve_at?: string | null;
    pending_payout_amount?: number | null;
    social_account_platform?: string | null;
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
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
    creator_handle: string;
    creator_avatar_url: string | null;
    creator_total_earned?: number;
    creator_level?: {
      level: number;
      title: string;
      icon: string;
      badgeBg: string;
      badgeText: string;
      badgeBorder: string;
      badgeLabel: string;
    };
    social_account_platform?: string | null;
  }[];
  audits?: {
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
}

export async function getCampaignDetailsForCreator(
  campaignId: string,
  creatorProfileId?: string | null
): Promise<CampaignDetailsForCreator> {
  const supabase = createAdminClient();

  // 1. Fetch Campaign with Advertiser profile joined (by UUID or campaign_code)
  let { data: campaign } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      campaign_code,
      description,
      cover_image_url,
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
        cover_image_url,
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

  // 2. Fetch associated creatives
  const { data: creatives } = await supabase
    .from('campaign_creatives')
    .select('id, file_url, copy_text, caption_suggestion')
    .eq('campaign_id', realCampaignId);

  // 3. Fetch current creator's submission for this campaign (if logged in)
  const { data: submission } = creatorProfileId
    ? await supabase
        .from('submissions')
        .select(`
          id,
          social_account_id,
          post_url,
          screenshot_url,
          status,
          reserved_amount,
          final_view_count,
          verified_at,
          paid_at,
          payout_amount,
          auto_approve_at,
          pending_payout_amount,
          last_paid_view_count,
          last_scraped_at,
          social_accounts:social_accounts!left (
            platform,
            handle
          )
        `)
        .eq('campaign_id', realCampaignId)
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

  // 5. Fetch all submissions & joined slots for this campaign
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
      likes_count,
      comments_count,
      shares_count,
      watch_time_seconds,
      social_accounts:social_accounts!left(platform),
      creator:creator_profiles!left(
        display_name,
        total_earned,
        profile:profiles!left(
          full_name,
          avatar_url
        )
      )
    `)
    .eq('campaign_id', realCampaignId);

  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;

  const mappedAllSubs = (allSubs || []).map((sub: any) => {
    const creatorHandle = sub.creator?.display_name || sub.creator?.profile?.full_name || 'Anonymous Creator';
    const creatorAvatar = sub.creator?.profile?.avatar_url || null;
    const views = Number(sub.final_view_count || 0);
    const totalEarned = Number(sub.creator?.total_earned || 0);
    const lvl = getCreatorLevel(totalEarned);

    totalViews += views;
    totalLikes += Number(sub.likes_count || 0);
    totalComments += Number(sub.comments_count || 0);
    totalShares += Number(sub.shares_count || 0);

    return {
      id: sub.id,
      status: sub.status,
      post_url: sub.post_url,
      screenshot_url: sub.screenshot_url,
      reserved_amount: Number(sub.reserved_amount),
      payout_amount: sub.payout_amount ? Number(sub.payout_amount) : null,
      final_view_count: sub.final_view_count ? Number(sub.final_view_count) : null,
      likes_count: Number(sub.likes_count || 0),
      comments_count: Number(sub.comments_count || 0),
      shares_count: Number(sub.shares_count || 0),
      creator_handle: creatorHandle.startsWith('@') ? creatorHandle : `@${creatorHandle}`,
      creator_avatar_url: creatorAvatar,
      creator_total_earned: totalEarned,
      creator_level: {
        level: lvl.currentLevelNumber,
        title: lvl.levelInfo.title,
        icon: lvl.levelInfo.icon,
        badgeBg: lvl.levelInfo.badgeBg,
        badgeText: lvl.levelInfo.badgeText,
        badgeBorder: lvl.levelInfo.badgeBorder,
        badgeLabel: lvl.badgeLabel,
      },
      social_account_platform: sub.social_accounts?.platform || null,
    };
  });

  const computedEngagementRate = totalViews > 0
    ? Number((((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1))
    : 0;

  const watchTimeSubs = (allSubs || []).filter((s: any) => Number(s.watch_time_seconds || 0) > 0);
  const fallbackWatchTime = totalViews > 0
    ? Number((12.5 + Math.min(16.5, (computedEngagementRate * 0.95))).toFixed(1))
    : 0;
  const computedAvgWatchTime = watchTimeSubs.length > 0
    ? Number((watchTimeSubs.reduce((sum: number, s: any) => sum + Number(s.watch_time_seconds), 0) / watchTimeSubs.length).toFixed(1))
    : fallbackWatchTime;

  // 6. Fetch Settled Audits for this Campaign
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

  // Build real-time audit ledger for the Live Audit Log
  const mappedAudits: Array<{
    id: string;
    submission_id: string;
    creator_handle: string;
    creator_avatar_url: string | null;
    views_scraped: number;
    views_delta: number;
    payout_amount: number;
    status: string;
    settled_at: string;
    failure_reason: string | null;
  }> = [];

  const settledAuditList = rawAudits || [];

  if (submission?.id) {
    const { data: verChecks } = await supabase
      .from('verification_checks')
      .select('id, submission_id, checked_at, post_reachable, view_count, notes')
      .eq('submission_id', submission.id)
      .order('checked_at', { ascending: true }); // chronological order

    if (verChecks && verChecks.length > 0) {
      let prevViews = 0;
      const cpm = Number(campaign?.cpm_rate || 0);
      const minThresh = Number(campaign?.min_view_threshold || 1000);

      verChecks.forEach((vc: any) => {
        const vcKey = `vc-${vc.id}`;
        const currentViews = vc.view_count !== null && vc.view_count !== undefined ? Number(vc.view_count) : 0;
        const deltaViews = Math.max(0, currentViews - prevViews);
        prevViews = Math.max(prevViews, currentViews);

        // Check if there is a matching settled audit record in submission_audits
        const matchingSettledAudit = settledAuditList.find(
          (sa: any) =>
            sa.submission_id === submission.id &&
            (sa.views_scraped === currentViews || Math.abs(new Date(sa.settled_at).getTime() - new Date(vc.checked_at).getTime()) < 300000)
        );

        let status = 'pending';
        let payoutForCycle = 0;

        if (!vc.post_reachable) {
          status = 'failed';
        } else if (matchingSettledAudit) {
          status = matchingSettledAudit.status === 'auto_approved' ? 'auto_approved' : 'approved';
          payoutForCycle = Number(matchingSettledAudit.payout_amount || 0);
        } else if (currentViews >= minThresh && deltaViews > 0) {
          payoutForCycle = Math.floor((deltaViews / 1000) * cpm);
          if (submission.status === 'paid' && currentViews <= Number(submission.last_paid_view_count || 0)) {
            status = 'approved';
          } else {
            status = 'pending';
          }
        } else {
          status = 'pending';
          payoutForCycle = 0;
        }

        mappedAudits.push({
          id: vcKey,
          submission_id: vc.submission_id,
          creator_handle: 'You',
          creator_avatar_url: null,
          views_scraped: currentViews,
          views_delta: deltaViews,
          payout_amount: payoutForCycle,
          status,
          settled_at: vc.checked_at,
          failure_reason: vc.post_reachable ? null : 'Post unreachable or deleted',
        });
      });
    }
  }

  // Include any other settled audits from other creators or not matching verification_checks
  const recordedVcSubIds = new Set(mappedAudits.map((a) => a.submission_id));
  settledAuditList.forEach((audit: any) => {
    if (!recordedVcSubIds.has(audit.submission_id)) {
      const handle = audit.creator?.display_name || audit.creator?.profile?.full_name || 'Creator';
      mappedAudits.push({
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
      });
    }
  });

  // Fallback audit row if submission is verified / paid but not recorded in submission_audits table
  if (
    submission &&
    (submission.status === 'verified_pass' || submission.status === 'paid' || Number(submission.final_view_count || 0) > 0) &&
    mappedAudits.length === 0
  ) {
    const v = Number(submission.final_view_count || 0);
    const p = Number(submission.payout_amount || submission.pending_payout_amount || 0);
    mappedAudits.push({
      id: `audit-fallback-${submission.id}`,
      submission_id: submission.id,
      creator_handle: 'You',
      creator_avatar_url: null,
      views_scraped: v,
      views_delta: v,
      payout_amount: p,
      status: submission.status === 'paid' || submission.status === 'verified_pass' ? 'approved' : 'pending',
      settled_at: submission.verified_at || submission.paid_at || new Date().toISOString(),
      failure_reason: null,
    });
  }

  mappedAudits.sort((a, b) => new Date(b.settled_at).getTime() - new Date(a.settled_at).getTime());

  const subPlatform =
    (submission as any)?.social_accounts?.platform ||
    (submission?.post_url?.includes('x.com') || submission?.post_url?.includes('twitter.com') ? 'x' : null) ||
    (submission?.post_url?.includes('tiktok.com') ? 'tiktok' : null) ||
    (submission?.post_url?.includes('youtube.com') || submission?.post_url?.includes('youtu.be') ? 'youtube' : null) ||
    (submission?.post_url?.includes('facebook.com') ? 'facebook' : null) ||
    (submission?.post_url?.includes('instagram.com') ? 'instagram' : null);

  return {
    campaign: campaign
      ? {
          id: campaign.id,
          title: campaign.title,
          campaign_code: campaign.campaign_code || null,
          description: campaign.description,
          cover_image_url: campaign.cover_image_url || null,
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
          avg_watch_time_seconds: computedAvgWatchTime,
          target_engagement_rate: computedEngagementRate,
        }
      : null,
    creatives: creatives || [],
    submission: submission
      ? {
          id: submission.id,
          social_account_id: submission.social_account_id,
          social_account_platform: subPlatform,
          post_url: submission.post_url,
          screenshot_url: submission.screenshot_url,
          status: submission.status,
          reserved_amount: Number(submission.reserved_amount),
          final_view_count: submission.final_view_count,
          verified_at: submission.verified_at,
          paid_at: submission.paid_at,
          payout_amount: submission.payout_amount ? Number(submission.payout_amount) : null,
          auto_approve_at: (submission as any).auto_approve_at || null,
          pending_payout_amount: (submission as any).pending_payout_amount ? Number((submission as any).pending_payout_amount) : 0,
        }
      : null,
    socialAccounts: socialAccounts || [],
    allSubmissions: mappedAllSubs,
    audits: mappedAudits,
  };
}

