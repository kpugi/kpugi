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

export interface CreatorEarningsData {
  availableBalance: number;
  pendingEscrow: number;
  totalEarned: number;
  bankDetails: {
    bankCode?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    isVerified?: boolean;
  } | null;
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

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, profile_id, total_earned, paystack_recipient_code')
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`)
    .maybeSingle();

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'creator_earnings')
    .maybeSingle();

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  const creatorProfileId = creator?.id;
  const creatorFilter = creatorProfileId
    ? `creator_id.eq.${profileId},creator_id.eq.${creatorProfileId}`
    : `creator_id.eq.${profileId}`;

  const { data: rawSubmissions } = await supabase
    .from('submissions')
    .select('reserved_amount, status')
    .or(creatorFilter);

  const pendingEscrow = (rawSubmissions || [])
    .filter((s: any) => s.status === 'reserved' || s.status === 'under_review' || s.status === 'pending')
    .reduce((sum: number, s: any) => sum + (Number(s.reserved_amount) || 0), 0);

  let bankDetails: any = null;
  if (creator?.paystack_recipient_code) {
    try {
      const parsed = JSON.parse(creator.paystack_recipient_code);
      if (parsed.account_number || parsed.accountNumber) {
        bankDetails = {
          bankCode: parsed.bank_code || parsed.bankCode,
          bankName: parsed.bank_name || parsed.bankName,
          accountNumber: parsed.account_number || parsed.accountNumber,
          accountName: parsed.account_name || parsed.accountName,
          isVerified: true,
        };
      }
    } catch {
      // not JSON string
    }
  }

  return {
    availableBalance: wallet?.balance || 0,
    pendingEscrow: pendingEscrow > 0 ? pendingEscrow : 184300, // Default demo value if 0
    totalEarned: creator?.total_earned || 4200150,
    bankDetails: bankDetails || {
      bankCode: '058',
      bankName: 'Zenith Bank PLC',
      accountNumber: '4492',
      accountName: 'TUNDE KELANI',
      isVerified: true,
    },
    transactions: transactions || [],
  };
}

export async function getCreatorSocialAccounts(profileId: string) {
  const supabase = createAdminClient();
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('profile_id', profileId);

  const socialLinks: Record<string, string> = {};
  if (accounts) {
    accounts.forEach((acc: any) => {
      if (acc.platform) {
        socialLinks[acc.platform.toLowerCase()] = acc.handle;
      }
    });
  }

  return socialLinks;
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

function getMockSubmissionsData(
  activeCampaigns: { id: string; title: string; campaignCode: string }[]
): CreatorSubmissionsData {
  const mockSubmissions: DetailedSubmissionItem[] = [
    {
      id: 'sub-101',
      campaignId: 'camp-88293',
      campaignTitle: 'Nike Air Max Launch',
      campaignCode: 'KP-CAMP-88293',
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
      campaignId: 'camp-12241',
      campaignTitle: 'Apple Watch Ultra S2',
      campaignCode: 'KP-CAMP-12241',
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
      campaignId: 'camp-44521',
      campaignTitle: 'Red Bull Cliff Dive',
      campaignCode: 'KP-CAMP-44521',
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
      campaignId: 'camp-99102',
      campaignTitle: 'Gamer Fuel Hydration',
      campaignCode: 'KP-CAMP-99102',
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
    activeCampaigns: activeCampaigns.length > 0 ? activeCampaigns : [
      { id: 'camp-88293', title: 'Nike Air Max Launch', campaignCode: 'KP-CAMP-88293' },
      { id: 'camp-12241', title: 'Apple Watch Ultra S2', campaignCode: 'KP-CAMP-12241' },
      { id: 'camp-44521', title: 'Red Bull Cliff Dive', campaignCode: 'KP-CAMP-44521' },
    ],
  };
}

export async function getCreatorSubmissionsData(
  creatorProfileId: string
): Promise<CreatorSubmissionsData> {
  const supabase = createAdminClient();

  const { data: activeApplications } = await supabase
    .from('campaign_applications')
    .select(`
      campaign_id,
      campaigns (
        id,
        title
      )
    `)
    .eq('creator_id', creatorProfileId);

  const activeCampaigns = (activeApplications || [])
    .map((app: any) => ({
      id: app.campaigns?.id || app.campaign_id,
      title: app.campaigns?.title || 'Active Campaign',
      campaignCode: `KP-CAMP-${(app.campaigns?.id || app.campaign_id).slice(-5).toUpperCase()}`,
    }))
    .filter(Boolean);

  const { data: dbSubmissions } = await supabase
    .from('campaign_submissions')
    .select(`
      *,
      campaigns (
        id,
        title,
        channels,
        cpm_rate,
        status,
        created_at
      )
    `)
    .eq('creator_id', creatorProfileId)
    .order('submitted_at', { ascending: false });

  if (!dbSubmissions || dbSubmissions.length === 0) {
    return getMockSubmissionsData(activeCampaigns);
  }

  const submissions: DetailedSubmissionItem[] = dbSubmissions.map((sub: any) => {
    const campaign = sub.campaigns || {};
    const platform = (campaign.channels?.[0] || extractPlatformFromUrl(sub.post_url) || 'tiktok').toLowerCase();
    const views = sub.final_view_count || sub.views_count || 0;
    const cpmRate = campaign.cpm_rate || 3500;
    const earned = sub.payout_amount || (views > 0 ? (views / 1000) * cpmRate : 0);

    return {
      id: sub.id,
      campaignId: campaign.id || sub.campaign_id,
      campaignTitle: campaign.title || 'Campaign Audit',
      campaignCode: `KP-CAMP-${(campaign.id || sub.campaign_id).slice(-5).toUpperCase()}`,
      platform,
      postUrl: sub.post_url,
      viewsCount: views,
      engagementRate: sub.engagement_rate || (views > 0 ? 8.5 : 0),
      cpmRate,
      earnedAmount: earned,
      status: normalizeSubmissionStatus(sub.status),
      submittedAt: sub.submitted_at,
      verifiedAt: sub.verified_at,
    };
  });

  const totalSubmitted = submissions.length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const auditingCount = submissions.filter((s) => s.status === 'auditing' || s.status === 'pending').length;
  const totalVerifiedViews = submissions.reduce((sum, s) => sum + s.viewsCount, 0);
  const approvedRate = totalSubmitted > 0 ? Math.round((approvedCount / totalSubmitted) * 1000) / 10 : 90.1;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const submittedThisWeek = submissions.filter((s) => new Date(s.submittedAt).getTime() >= oneWeekAgo).length;

  return {
    totalSubmitted,
    submittedThisWeek: submittedThisWeek || 12,
    approvedCount,
    approvedRate,
    auditingCount,
    totalVerifiedViews,
    submissions,
    activeCampaigns: activeCampaigns.length > 0 ? activeCampaigns : [
      { id: 'camp-88293', title: 'Nike Air Max Launch', campaignCode: 'KP-CAMP-88293' },
      { id: 'camp-12241', title: 'Apple Watch Ultra S2', campaignCode: 'KP-CAMP-12241' },
      { id: 'camp-44521', title: 'Red Bull Cliff Dive', campaignCode: 'KP-CAMP-44521' },
    ],
  };
}
