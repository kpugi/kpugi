import { createAdminClient } from '@/lib/supabase/server';

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

export interface CreatorOverviewData {
  totalEarned: number;
  walletBalance: number;
  activeSubmissions: number;
  pendingAudits: number;
  completedCampaigns: number;
  submissions: CreatorSubmission[];
  featuredSubmission?: CreatorSubmission;
  recentNotifications: any[];
  recentActivity: any[];
}

export interface CreatorCampaignItem {
  id: string;
  campaignId: string;
  title: string;
  brandName?: string;
  companyLogo?: string | null;
  platform?: string;
  ratePer1k?: number;
  minThreshold?: number;
  reservedAmount?: number;
  status: string;
  postUrl?: string;
  viewsCount?: number;
  earnedAmount?: number;
  submittedAt?: string;
}

export interface BankAccountItem {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
}

export interface CreatorEarningsData {
  availableBalance: number;
  pendingEscrow: number;
  totalEarned: number;
  totalWithdrawn: number;
  lastWithdrawalDate: string | null;
  bankDetails: BankAccountItem | null;
  bankAccounts: BankAccountItem[];
  transactions: any[];
}

export async function getCreatorOverviewData(profileId: string): Promise<CreatorOverviewData> {
  const supabase = createAdminClient();

  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('id, total_earned')
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`)
    .maybeSingle();

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'creator_earnings')
    .maybeSingle();

  const creatorProfileId = creatorProfile?.id;
  const creatorFilter = creatorProfileId
    ? `creator_id.eq.${profileId},creator_id.eq.${creatorProfileId}`
    : `creator_id.eq.${profileId}`;

  const { data: rawSubmissions } = await supabase
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
        advertiser:advertiser_profiles (
          company_name,
          profile:profiles (
            avatar_url
          )
        )
      )
    `)
    .or(creatorFilter)
    .order('submitted_at', { ascending: false });

  const submissions: CreatorSubmission[] = (rawSubmissions || []).map((sub: any) => {
    const campaignObj = Array.isArray(sub.campaign) ? sub.campaign[0] : sub.campaign;
    const adv = campaignObj?.advertiser as any;
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
        company_logo: adv?.profile?.avatar_url || null,
      },
    };
  });

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, knock_workflow_key, channel, payload, sent_at')
    .eq('profile_id', profileId)
    .order('sent_at', { ascending: false })
    .limit(10);

  const activeSubmissions = submissions.filter(
    (s) => s.status === 'pending' || s.status === 'under_review' || s.status === 'approved' || s.status === 'reserved'
  ).length;

  const pendingAudits = submissions.filter((s) => s.status === 'under_review' || s.status === 'pending').length;
  const completedCampaigns = submissions.filter((s) => s.status === 'paid' || s.status === 'completed').length;
  const featured = submissions.find((s) => s.status === 'under_review' || s.status === 'pending' || s.status === 'reserved') || submissions[0];

  return {
    totalEarned: creatorProfile?.total_earned || 0,
    walletBalance: wallet?.balance || 0,
    activeSubmissions,
    pendingAudits,
    completedCampaigns,
    submissions,
    featuredSubmission: featured,
    recentNotifications: notifications || [],
    recentActivity: submissions.slice(0, 5),
  };
}

export async function getCreatorCampaigns(profileId: string, filter?: string): Promise<CreatorCampaignItem[]> {
  const supabase = createAdminClient();

  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('id')
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`)
    .maybeSingle();

  const creatorProfileId = creatorProfile?.id;
  const creatorFilter = creatorProfileId
    ? `creator_id.eq.${profileId},creator_id.eq.${creatorProfileId}`
    : `creator_id.eq.${profileId}`;

  const { data: rawData } = await supabase
    .from('submissions')
    .select(`
      id,
      post_url,
      status,
      submitted_at,
      reserved_amount,
      final_view_count,
      payout_amount,
      campaign:campaigns (
        id,
        title,
        channels,
        cpm_rate,
        min_view_threshold,
        advertiser:advertiser_profiles (
          company_name,
          profile:profiles (
            avatar_url
          )
        )
      )
    `)
    .or(creatorFilter)
    .order('submitted_at', { ascending: false });

  if (!rawData) return [];

  return rawData.map((sub: any) => {
    const campaign = Array.isArray(sub.campaign) ? sub.campaign[0] : sub.campaign;
    const adv = campaign?.advertiser as any;
    return {
      id: sub.id,
      campaignId: campaign?.id || sub.id,
      title: campaign?.title || 'Campaign',
      brandName: adv?.company_name || 'Brand Partner',
      companyLogo: adv?.profile?.avatar_url || null,
      platform: campaign?.channels?.[0] || 'tiktok',
      ratePer1k: campaign?.cpm_rate || 0,
      minThreshold: campaign?.min_view_threshold || 500,
      reservedAmount: sub.reserved_amount || sub.payout_amount || 0,
      status: sub.status,
      postUrl: sub.post_url,
      viewsCount: sub.final_view_count || 0,
      earnedAmount: sub.payout_amount || 0,
      submittedAt: sub.submitted_at,
    };
  });
}

export async function getCreatorCampaignDetails(profileId: string, submissionOrCampaignId: string) {
  const supabase = createAdminClient();

  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('id')
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`)
    .maybeSingle();

  const creatorProfileId = creatorProfile?.id;
  const creatorFilter = creatorProfileId
    ? `creator_id.eq.${profileId},creator_id.eq.${creatorProfileId}`
    : `creator_id.eq.${profileId}`;

  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      *,
      campaign:campaigns (*)
    `)
    .or(`id.eq.${submissionOrCampaignId},campaign_id.eq.${submissionOrCampaignId}`)
    .or(creatorFilter)
    .maybeSingle();

  if (submission) {
    const campaign = Array.isArray(submission.campaign) ? submission.campaign[0] : submission.campaign;
    return { campaign, submission };
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', submissionOrCampaignId)
    .maybeSingle();

  return { campaign, submission: null };
}



export async function getCreatorEarningsData(profileId: string): Promise<CreatorEarningsData> {
  const supabase = createAdminClient();

  // 1. Fetch creator profile
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, profile_id, total_earned, paystack_recipient_code')
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`)
    .maybeSingle();

  // 2. Fetch wallet balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'creator_earnings')
    .maybeSingle();

  // 3. Fetch real transactions
  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  // 4. Fetch real payout requests for totalWithdrawn & lastWithdrawalDate
  const { data: payoutRequests } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  const totalWithdrawn = (payoutRequests || [])
    .filter((p) => p.status === 'success' || p.status === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const lastWithdrawalDate = payoutRequests && payoutRequests.length > 0 ? payoutRequests[0].created_at : null;

  // 5. Calculate Pending Escrow from real active submissions
  const creatorProfileId = creator?.id;
  const creatorFilter = creatorProfileId
    ? `creator_id.eq.${profileId},creator_id.eq.${creatorProfileId}`
    : `creator_id.eq.${profileId}`;

  const { data: rawSubmissions } = await supabase
    .from('submissions')
    .select('reserved_amount, payout_amount, status')
    .or(creatorFilter);

  const pendingEscrow = (rawSubmissions || [])
    .filter((s: any) => s.status === 'reserved' || s.status === 'under_review' || s.status === 'pending' || s.status === 'auditing')
    .reduce((sum: number, s: any) => sum + (Number(s.reserved_amount || s.payout_amount) || 0), 0);

  // 6. Fetch saved bank accounts from bank_accounts table
  const { data: dbBankAccounts } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('profile_id', profileId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  const bankAccounts: BankAccountItem[] = (dbBankAccounts || []).map((b: any, idx: number) => ({
    id: b.id,
    bankName: b.bank_name,
    bankCode: b.bank_code,
    accountNumber: b.account_number,
    accountName: b.account_name,
    isPrimary: idx === 0,
  }));

  // Fallback check on creator.paystack_recipient_code if bank_accounts table is empty
  if (bankAccounts.length === 0 && creator?.paystack_recipient_code) {
    try {
      const parsed = JSON.parse(creator.paystack_recipient_code);
      if (parsed.account_number || parsed.accountNumber) {
        bankAccounts.push({
          id: 'primary-legacy',
          bankCode: parsed.bank_code || parsed.bankCode,
          bankName: parsed.bank_name || parsed.bankName,
          accountNumber: parsed.account_number || parsed.accountNumber,
          accountName: parsed.account_name || parsed.accountName,
          isPrimary: true,
        });
      }
    } catch {}
  }

  const primaryBank = bankAccounts.length > 0 ? bankAccounts[0] : null;

  return {
    availableBalance: Number(wallet?.balance || 0),
    pendingEscrow: Number(pendingEscrow || 0),
    totalEarned: Number(creator?.total_earned || 0),
    totalWithdrawn: Number(totalWithdrawn || 0),
    lastWithdrawalDate,
    bankDetails: primaryBank,
    bankAccounts,
    transactions: transactions || [],
  };
}

export interface SocialAccountDetails {
  handle: string;
  avatarUrl?: string | null;
  followerCount?: number | null;
  avgViews?: number | null;
  engagementRate?: number | null;
  platformUserId?: string | null;
  lastSyncedAt?: string | null;
}

export async function getCreatorSocialAccounts(
  profileId: string
): Promise<Record<string, SocialAccountDetails>> {
  const supabase = createAdminClient();
  
  // 1. Fetch from social_accounts table (creator_id column)
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('creator_id', profileId);

  // 2. Fetch from creator_profiles.social_links as fallback
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('social_links')
    .eq('profile_id', profileId)
    .maybeSingle();

  const result: Record<string, SocialAccountDetails> = {};

  if (creator?.social_links) {
    Object.entries(creator.social_links).forEach(([key, value]) => {
      if (typeof value === 'string' && value) {
        result[key.toLowerCase()] = { handle: value };
      } else if (typeof value === 'object' && value && (value as any).handle) {
        const valObj = value as any;
        result[key.toLowerCase()] = {
          handle: valObj.handle,
          avatarUrl: valObj.avatarUrl || valObj.avatar_url || null,
          followerCount: valObj.followerCount ?? valObj.follower_count ?? null,
          avgViews: valObj.avgViews ?? valObj.avg_views ?? null,
          engagementRate: valObj.engagementRate ?? valObj.engagement_rate ?? null,
        };
      }
    });
  }

  if (accounts) {
    accounts.forEach((acc: any) => {
      if (acc.platform && acc.handle) {
        result[acc.platform.toLowerCase()] = {
          handle: acc.handle,
          avatarUrl: acc.avatar_url || result[acc.platform.toLowerCase()]?.avatarUrl || null,
          followerCount: acc.follower_count ?? result[acc.platform.toLowerCase()]?.followerCount ?? null,
          avgViews: acc.avg_views ?? result[acc.platform.toLowerCase()]?.avgViews ?? null,
          engagementRate: acc.engagement_rate ?? result[acc.platform.toLowerCase()]?.engagementRate ?? null,
          platformUserId: acc.platform_user_id || null,
          lastSyncedAt: acc.last_synced_at || null,
        };
      }
    });
  }

  return result;
}

export async function saveSocialAccount({
  profileId,
  platform,
  handle,
  platformUserId,
  followerCount = null,
  avatarUrl = null,
  avgViews = null,
  engagementRate = null,
  accessToken = null,
  scopes = null,
}: {
  profileId: string;
  platform: string;
  handle: string;
  platformUserId?: string;
  followerCount?: number | null;
  avatarUrl?: string | null;
  avgViews?: number | null;
  engagementRate?: number | null;
  accessToken?: string | null;
  scopes?: string[] | null;
}) {
  const supabase = createAdminClient();
  const cleanHandle = handle.trim().replace(/^@/, '');
  const platformKey = platform.toLowerCase();
  const userId = platformUserId || cleanHandle;

  // 1. Check if social account record already exists for this creator & platform
  const { data: existing } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('creator_id', profileId)
    .eq('platform', platformKey)
    .maybeSingle();

  const updateData: any = {
    handle: cleanHandle,
    platform_user_id: userId,
    last_synced_at: new Date().toISOString(),
  };

  if (followerCount !== undefined && followerCount !== null) updateData.follower_count = followerCount;
  if (avatarUrl !== undefined && avatarUrl !== null) updateData.avatar_url = avatarUrl;
  if (avgViews !== undefined && avgViews !== null) updateData.avg_views = avgViews;
  if (engagementRate !== undefined && engagementRate !== null) updateData.engagement_rate = engagementRate;
  if (accessToken !== undefined && accessToken !== null) updateData.oauth_access_token = accessToken;
  if (scopes !== undefined && scopes !== null) updateData.oauth_scopes = scopes;

  if (existing) {
    await supabase
      .from('social_accounts')
      .update(updateData)
      .eq('id', existing.id);
  } else {
    await supabase.from('social_accounts').insert({
      creator_id: profileId,
      platform: platformKey,
      handle: cleanHandle,
      platform_user_id: userId,
      follower_count: followerCount ?? 0,
      avatar_url: avatarUrl,
      avg_views: avgViews,
      engagement_rate: engagementRate,
      oauth_access_token: accessToken,
      oauth_scopes: scopes,
      connected_at: new Date().toISOString(),
    });
  }

  // 2. Dual-sync to creator_profiles.social_links JSON object
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('social_links')
    .eq('profile_id', profileId)
    .maybeSingle();

  const currentLinks = creator?.social_links || {};
  await supabase
    .from('creator_profiles')
    .update({
      social_links: {
        ...currentLinks,
        [platformKey]: {
          handle: cleanHandle,
          avatar_url: avatarUrl,
          follower_count: followerCount,
          avg_views: avgViews,
          engagement_rate: engagementRate,
        },
      },
    })
    .eq('profile_id', profileId);

  return { success: true };
}

export async function getCreatorProfileSettings(profileId: string) {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select(`
      *,
      creator_profiles!creator_profiles_profile_id_fkey (*)
    `)
    .eq('id', profileId)
    .maybeSingle();

  return profile;
}

/* ─────────────────────────────────────────────────────────────
   CREATOR SUBMISSIONS & PERFORMANCE AUDITS DATA
───────────────────────────────────────────────────────────── */

export interface DetailedSubmissionItem {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignCode: string;
  platform: string;
  postUrl: string;
  viewsCount: number;
  engagementRate: number;
  cpmRate: number;
  earnedAmount: number;
  status: 'approved' | 'auditing' | 'pending' | 'rejected';
  submittedAt: string;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
}

export interface CreatorSubmissionsData {
  totalSubmitted: number;
  submittedThisWeek: number;
  approvedCount: number;
  approvedRate: number;
  auditingCount: number;
  totalVerifiedViews: number;
  submissions: DetailedSubmissionItem[];
  activeCampaigns: { id: string; title: string; campaignCode: string }[];
}

function extractPlatformFromUrl(url: string = ''): string {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('threads.net')) return 'threads';
  if (u.includes('linkedin.com')) return 'linkedin';
  return 'tiktok';
}

function normalizeSubmissionStatus(status: string = ''): 'approved' | 'auditing' | 'pending' | 'rejected' {
  const s = status.toLowerCase();
  if (s === 'approved' || s === 'cleared') return 'approved';
  if (s === 'rejected' || s === 'failed') return 'rejected';
  return 'auditing';
}

function formatCampaignCode(id: string = '', code?: string): string {
  if (code && code.trim()) return code.toUpperCase();
  if (!id) return 'KPG-LNC9X';
  const cleanId = id.replace(/-/g, '').toUpperCase();
  return `KP-CAMP-${cleanId.slice(0, 5)}`;
}

function getMockSubmissionsData(
  activeCampaigns: { id: string; title: string; campaignCode: string }[]
): CreatorSubmissionsData {
  const camps = activeCampaigns.length > 0 ? activeCampaigns : [
    { id: 'camp-lnc9x', title: 'Kpugi Official Platform Launch', campaignCode: 'KPG-LNC9X' },
    { id: 'camp-zen99', title: 'Zenith Mobile App Performance Campaign', campaignCode: 'KP-CAMP-ZEN99' },
    { id: 'camp-gtb88', title: 'GTBank Mobile Banking Growth Drive', campaignCode: 'KP-CAMP-GTB88' },
    { id: 'camp-kud77', title: 'Kuda Bank Creator Referral Campaign', campaignCode: 'KP-CAMP-KUD77' },
  ];

  const mockSubmissions: DetailedSubmissionItem[] = [
    {
      id: 'sub-101',
      campaignId: camps[0].id,
      campaignTitle: camps[0].title,
      campaignCode: camps[0].campaignCode,
      platform: 'tiktok',
      postUrl: 'https://vm.tiktok.com/ZMe991201/',
      viewsCount: 422500,
      engagementRate: 12.4,
      cpmRate: 3400,
      earnedAmount: 1436500,
      status: 'approved',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sub-102',
      campaignId: camps[1 % camps.length].id,
      campaignTitle: camps[1 % camps.length].title,
      campaignCode: camps[1 % camps.length].campaignCode,
      platform: 'instagram',
      postUrl: 'https://instagr.am/p/C9w29101/',
      viewsCount: 0,
      engagementRate: 0,
      cpmRate: 4200,
      earnedAmount: 0,
      status: 'auditing',
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sub-103',
      campaignId: camps[2 % camps.length].id,
      campaignTitle: camps[2 % camps.length].title,
      campaignCode: camps[2 % camps.length].campaignCode,
      platform: 'youtube',
      postUrl: 'https://youtu.be/shW9x0012',
      viewsCount: 1800000,
      engagementRate: 8.2,
      cpmRate: 3450,
      earnedAmount: 6210000,
      status: 'approved',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sub-104',
      campaignId: camps[3 % camps.length].id,
      campaignTitle: camps[3 % camps.length].title,
      campaignCode: camps[3 % camps.length].campaignCode,
      platform: 'tiktok',
      postUrl: 'https://vm.tiktok.com/T0x99102/',
      viewsCount: 1200,
      engagementRate: 0.1,
      cpmRate: 3000,
      earnedAmount: 0,
      status: 'rejected',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      rejectionReason: 'Video privacy settings set to Private. Please switch to Public and resubmit.',
    },
  ];

  return {
    totalSubmitted: 142,
    submittedThisWeek: 12,
    approvedCount: 128,
    approvedRate: 90.1,
    auditingCount: 14,
    totalVerifiedViews: 2400000,
    submissions: mockSubmissions,
    activeCampaigns: camps,
  };
}

export async function getCreatorSubmissionsData(
  creatorProfileId: string
): Promise<CreatorSubmissionsData> {
  const supabase = createAdminClient();

  // 1. Fetch real active campaigns directly from Supabase database
  const { data: dbCampaigns } = await supabase
    .from('campaigns')
    .select('id, title, campaign_code, channels, cpm_rate, status, created_at')
    .order('created_at', { ascending: false });

  const activeCampaigns = (dbCampaigns || []).map((c: any) => ({
    id: c.id,
    title: c.title || 'Campaign',
    campaignCode: formatCampaignCode(c.id, c.campaign_code),
  }));

  // 2. Fetch submissions from database tables where post_url is non-null
  const { data: subs1 } = await supabase
    .from('submissions')
    .select(`
      *,
      campaign:campaigns (
        id,
        title,
        campaign_code,
        channels,
        cpm_rate,
        status,
        created_at
      )
    `)
    .or(`creator_id.eq.${creatorProfileId},profile_id.eq.${creatorProfileId}`)
    .not('post_url', 'is', null)
    .order('submitted_at', { ascending: false });

  const { data: subs2 } = await supabase
    .from('campaign_submissions')
    .select(`
      *,
      campaigns (
        id,
        title,
        campaign_code,
        channels,
        cpm_rate,
        status,
        created_at
      )
    `)
    .or(`creator_id.eq.${creatorProfileId},profile_id.eq.${creatorProfileId}`)
    .not('post_url', 'is', null)
    .order('submitted_at', { ascending: false });

  const rawSubmissions = [...(subs1 || []), ...(subs2 || [])].filter(
    (sub) => sub.post_url && sub.post_url.trim().length > 0
  );

  let submissions: DetailedSubmissionItem[] = [];

  if (rawSubmissions.length > 0) {
    submissions = rawSubmissions.map((sub: any) => {
      const campaign = sub.campaign || sub.campaigns || {};
      const platform = (campaign.channels?.[0] || extractPlatformFromUrl(sub.post_url) || 'tiktok').toLowerCase();
      const views = sub.final_view_count || sub.views_count || 0;
      const cpmRate = campaign.cpm_rate || 3500;
      const earned = sub.payout_amount || (views > 0 ? (views / 1000) * cpmRate : 0);

      return {
        id: sub.id,
        campaignId: campaign.id || sub.campaign_id,
        campaignTitle: campaign.title || 'Campaign Audit',
        campaignCode: formatCampaignCode(campaign.id || sub.campaign_id, campaign.campaign_code),
        platform,
        postUrl: sub.post_url,
        viewsCount: views,
        engagementRate: sub.engagement_rate || (views > 0 ? 8.5 : 0),
        cpmRate,
        earnedAmount: earned,
        status: normalizeSubmissionStatus(sub.status),
        submittedAt: sub.submitted_at || sub.created_at || new Date().toISOString(),
        verifiedAt: sub.verified_at,
        rejectionReason: sub.rejection_reason,
      };
    });
  }

  const totalSubmitted = submissions.length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const auditingCount = submissions.filter((s) => s.status === 'auditing' || s.status === 'pending').length;
  const totalVerifiedViews = submissions.reduce((sum, s) => sum + s.viewsCount, 0);
  const approvedRate = totalSubmitted > 0 ? Math.round((approvedCount / totalSubmitted) * 1000) / 10 : 0;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const submittedThisWeek = submissions.filter((s) => new Date(s.submittedAt).getTime() >= oneWeekAgo).length;

  return {
    totalSubmitted,
    submittedThisWeek,
    approvedCount,
    approvedRate,
    auditingCount,
    totalVerifiedViews,
    submissions,
    activeCampaigns: activeCampaigns.length > 0 ? activeCampaigns : [],
  };
}
