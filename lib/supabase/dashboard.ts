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
    ad_format: string;
    cpm_rate: number;
    total_budget: number;
    min_view_threshold: number;
    created_at: string;
    updated_at: string;
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
  description: string;
  ad_format: string;
  cpm_rate: number;
  total_budget: number;
  reserved_budget: number;
  spent_budget: number;
  status: string;
  created_at: string;
  updated_at: string;
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
}

export async function getAdvertiserDashboardData(profileId: string): Promise<AdvertiserDashboardData> {
  const supabase = createAdminClient();

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
    .select('id, title, description, ad_format, cpm_rate, total_budget, reserved_budget, spent_budget, status, created_at, updated_at')
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

  const camps = (campaigns || []) as AdvertiserCampaign[];
  const totalSpent = camps.reduce((sum, c) => sum + Number(c.spent_budget || 0), 0);

  return {
    totalSpent,
    walletBalance: Number(wallet?.balance || 0),
    activeCampaigns: camps.filter((c) => c.status === 'live' || c.status === 'budget_committed').length,
    pendingSubmissions,
    campaigns: camps,
    recentNotifications: notifications || [],
  };
}
