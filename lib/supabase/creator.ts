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
  pending_payout_amount?: number | null;
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
    cover_image_url?: string | null;
    requirements?: any;
  };
}

export interface CreatorOverviewData {
  totalEarned: number;
  walletBalance: number;
  todayAccrual: number;
  todayViews: number;
  pendingEscrow?: number;
  activeSubmissions: number;
  pendingAudits: number;
  completedCampaigns: number;
  totalVerifiedViews: number;
  submissions: CreatorSubmission[];
  featuredSubmission?: CreatorSubmission;
  recommendedCampaigns: any[];
  recentSettlements: any[];
  recentNotifications: any[];
  recentActivity: any[];
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export interface CreatorCampaignItem {
  id: string;
  campaignId: string;
  title: string;
  brandName?: string;
  companyLogo?: string | null;
  coverImageUrl?: string | null;
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
  todayAccrual: number;
  todayViews?: number;
  totalEarned: number;
  totalWithdrawn: number;
  lastWithdrawalDate: string | null;
  nextClearanceDate?: string | null;
  nextClearanceAmount?: number;
  bankDetails: BankAccountItem | null;
  bankAccounts: BankAccountItem[];
  transactions: any[];
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export async function getCreatorOverviewData(profileId: string): Promise<CreatorOverviewData> {
  const supabase = createAdminClient();

  // 0. Auto-release matured batches and auto-roll previous day's accruals
  const { autoReleaseMaturedBatches, processDailyBatchSettlement } = await import('@/lib/supabase/settlement');
  await autoReleaseMaturedBatches(supabase, profileId);

  const todayUtcStart = new Date();
  todayUtcStart.setUTCHours(0, 0, 0, 0);
  const { data: previousDaySubs } = await supabase
    .from('submissions')
    .select('id')
    .eq('creator_id', profileId)
    .gt('pending_payout_amount', 0)
    .lt('verified_at', todayUtcStart.toISOString())
    .limit(1);

  if (previousDaySubs && previousDaySubs.length > 0) {
    await processDailyBatchSettlement(supabase, profileId);
  }
  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('id, total_earned, kyc_status')
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`)
    .maybeSingle();

  const creatorProfileId = creatorProfile?.id;
  const creatorIds = [profileId, creatorProfileId].filter(Boolean) as string[];
  const creatorOrFilter = creatorIds.map((id) => `creator_id.eq.${id}`).join(',');

  // 2. Concurrently fetch wallet, submissions, notifications, and submission_audits
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
        last_paid_view_count,
        max_verified_views,
        verified_at,
        payout_amount,
        pending_payout_amount,
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
          requirements,
          advertiser:advertiser_profiles (
            company_name,
            profile:profiles (
              avatar_url
            )
          )
        )
      `)
      .or(creatorOrFilter)
      .order('submitted_at', { ascending: false }),
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

  const wallet = walletRes.data;
  const rawSubmissions = rawSubmissionsRes.data;
  const notifications = notificationsRes.data;
  const rawAudits = auditsRes.data || [];

  const submissions: CreatorSubmission[] = (rawSubmissions || []).map((sub: any) => {
    const campaignObj = Array.isArray(sub.campaign) ? sub.campaign[0] : sub.campaign;
    const adv = campaignObj?.advertiser as any;
    const campaignImg = campaignObj?.cover_image_url || campaignObj?.requirements?.creative_image_url || adv?.profile?.avatar_url || null;

    return {
      id: sub.id,
      post_url: sub.post_url,
      status: sub.status,
      submitted_at: sub.submitted_at,
      reserved_amount: sub.reserved_amount,
      final_view_count: sub.final_view_count,
      verified_at: sub.verified_at,
      payout_amount: sub.payout_amount,
      pending_payout_amount: sub.pending_payout_amount,
      campaign: {
        ...campaignObj,
        company_name: adv?.company_name || 'Brand Partner',
        company_logo: campaignImg,
        cover_image_url: campaignObj?.cover_image_url || null,
      },
    };
  });

  // 2. Compute Today's In-Cycle Accrual & Views
  let todayAccrual = 0;
  let todayViews = 0;

  (rawSubmissions || []).forEach((s: any) => {
    const pendingPayout = Number(s.pending_payout_amount || 0);
    if (pendingPayout > 0) {
      todayAccrual += pendingPayout;
      const finalViews = Number(s.final_view_count || 0);
      const lastPaid = Math.max(Number(s.last_paid_view_count || 0), Number(s.max_verified_views || 0));
      const deltaViews = Math.max(0, finalViews - lastPaid);
      todayViews += deltaViews;
    }
  });

  const activeSubmissions = submissions.filter(
    (s) => s.status === 'pending' || s.status === 'under_review' || s.status === 'approved' || s.status === 'reserved' || s.status === 'joined' || s.status === 'verified_pass' || s.status === 'auditing'
  ).length;

  const pendingAudits = submissions.filter((s) => s.status === 'under_review' || s.status === 'pending' || s.status === 'auditing').length;
  const completedCampaigns = submissions.filter((s) => s.status === 'paid' || s.status === 'completed' || s.status === 'verified_pass').length;
  const totalVerifiedViews = submissions.reduce((sum, s) => sum + (s.final_view_count || 0), 0);

  const featured = submissions.find((s) => s.status === 'under_review' || s.status === 'pending' || s.status === 'reserved' || s.status === 'joined' || s.status === 'verified_pass') || submissions[0];

  // 3. Recommended open opportunities (campaigns the creator has not joined yet)
  const joinedCampaignIds = submissions.map((s) => s.campaign?.id).filter(Boolean);
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

  const submissionsTotalEarned = (rawSubmissions || []).reduce(
    (sum: number, s: any) => sum + Number(s.payout_amount || 0) + Number(s.pending_payout_amount || 0),
    0
  );
  const liveTotalEarned = Math.max(
    Number(creatorProfile?.total_earned || 0),
    submissionsTotalEarned,
    Number(wallet?.balance || 0)
  );

  return {
    totalEarned: liveTotalEarned,
    walletBalance: wallet?.balance || 0,
    todayAccrual,
    todayViews: todayViews > 0 ? todayViews : totalVerifiedViews,
    activeSubmissions,
    pendingAudits,
    completedCampaigns,
    totalVerifiedViews,
    submissions,
    featuredSubmission: featured,
    recommendedCampaigns,
    recentSettlements,
    recentNotifications: notifications || [],
    recentActivity: submissions.slice(0, 5),
    kycStatus: (creatorProfile?.kyc_status as any) || 'unverified',
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
        total_budget,
        min_view_threshold,
        cover_image_url,
        requirements,
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
    const campaignImg = campaign?.cover_image_url || campaign?.requirements?.creative_image_url || adv?.profile?.avatar_url || null;

    const maxCreatorCap = Number(campaign?.total_budget || 0) > 0 ? Number(campaign.total_budget) * 0.25 : 0;
    const isJoinedOnly = !sub.post_url || sub.status === 'joined' || sub.status === 'reserved';

    let earnedAmount = 0;
    if (!isJoinedOnly) {
      const settledPayout = Number(sub.payout_amount || 0) + Number(sub.pending_payout_amount || 0);
      const minThreshold = campaign?.min_view_threshold || 500;
      const views = sub.final_view_count || 0;
      const estEarnings = views >= minThreshold ? Math.floor((views / 1000) * (campaign?.cpm_rate || 0)) : 0;
      const rawEarned = Math.max(settledPayout, estEarnings);
      earnedAmount = maxCreatorCap > 0 ? Math.min(rawEarned, maxCreatorCap) : rawEarned;
    }

    const targetThreshold = campaign?.min_view_threshold || 500;
    const fallbackReserve = Math.round((targetThreshold / 1000) * (campaign?.cpm_rate || 0));
    const reservedAmount = Number(sub.reserved_amount) || fallbackReserve;

    return {
      id: sub.id,
      campaignId: campaign?.id || sub.id,
      title: campaign?.title || 'Campaign',
      brandName: adv?.company_name || 'Brand Partner',
      companyLogo: campaignImg,
      coverImageUrl: campaign?.cover_image_url || null,
      platform: campaign?.channels?.[0] || 'tiktok',
      ratePer1k: campaign?.cpm_rate || 0,
      minThreshold: targetThreshold,
      reservedAmount: reservedAmount,
      status: sub.status,
      postUrl: sub.post_url,
      viewsCount: sub.final_view_count || 0,
      earnedAmount: earnedAmount,
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

  // Auto-release any matured 24h escrow batches into the available wallet balance.
  // NOTE: processDailyBatchSettlement is intentionally NOT called here — settlement
  // is handled exclusively by the GitHub Actions cron (/api/cron/daily-settlement).
  // Calling it on page load caused orphaned clearing transactions and balance zeroing.
  const { autoReleaseMaturedBatches } = await import('@/lib/supabase/settlement');
  await autoReleaseMaturedBatches(supabase, profileId);

  let { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('profile_id', profileId)
    .eq('wallet_type', 'creator_earnings')
    .maybeSingle();

  if (!wallet) {
    const { data: newW } = await supabase
      .from('wallets')
      .insert({
        profile_id: profileId,
        wallet_type: 'creator_earnings',
        balance: 0,
      })
      .select('id, balance')
      .single();
    wallet = newW;
  }

  const walletId = wallet?.id;

  const [
    creatorRes,
    transactionsRes,
    payoutRequestsRes,
    rawSubmissionsRes,
    dbBankAccountsRes,
  ] = await Promise.all([
    supabase
      .from('creator_profiles')
      .select('profile_id, total_earned, paystack_recipient_code, kyc_status')
      .eq('profile_id', profileId)
      .maybeSingle(),
    walletId
      ? supabase
          .from('wallet_transactions')
          .select('*, campaigns:campaign_id(title, cpm_rate), submissions:submission_id(final_view_count, last_paid_view_count, payout_amount)')
          .eq('wallet_id', walletId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from('payout_requests')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false }),
    supabase
      .from('submissions')
      .select(`
        id,
        campaign_id,
        reserved_amount,
        payout_amount,
        pending_payout_amount,
        final_view_count,
        last_paid_view_count,
        max_verified_views,
        status,
        submitted_at,
        verified_at,
        paid_at,
        auto_approve_at,
        campaign:campaigns (
          id,
          title,
          cpm_rate,
          min_view_threshold
        )
      `)
      .eq('creator_id', profileId),
    supabase
      .from('bank_accounts')
      .select('*')
      .eq('profile_id', profileId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  const creator = creatorRes.data;
  const rawTransactions = transactionsRes.data || [];
  const payoutRequests = payoutRequestsRes.data || [];
  const rawSubmissions = rawSubmissionsRes.data || [];
  const dbBankAccounts = dbBankAccountsRes.data || [];

  const totalWithdrawn = payoutRequests
    .filter((p) => p.status === 'success' || p.status === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const lastWithdrawalDate = payoutRequests.length > 0 ? payoutRequests[0].created_at : null;

  // 2. Compute Today's In-Cycle Accrual & Views (Only new views collected today)
  let todayAccrual = 0;
  let todayViews = 0;

  rawSubmissions.forEach((s: any) => {
    const pendingPayout = Number(s.pending_payout_amount || 0);
    if (pendingPayout > 0) {
      todayAccrual += pendingPayout;
      const finalViews = Number(s.final_view_count || 0);
      const lastPaid = Math.max(Number(s.last_paid_view_count || 0), Number(s.max_verified_views || 0));
      const deltaViews = Math.max(0, finalViews - lastPaid);
      todayViews += deltaViews;
    }
  });

  // 3. Compute Pending Clearance from active 24h escrow batch transactions
  const nowTime = Date.now();
  let pendingEscrow = 0;
  let soonestClearanceTime: number | null = null;
  let soonestClearanceAmount = 0;

  rawTransactions.forEach((tx: any) => {
    if (tx.status === 'clearing' && Number(tx.amount || 0) > 0) {
      const amt = Number(tx.amount || 0);
      pendingEscrow += amt;
      const clTime = tx.clears_at ? new Date(tx.clears_at).getTime() : new Date(tx.created_at).getTime() + 24 * 3600 * 1000;
      if (clTime > nowTime) {
        if (soonestClearanceTime === null || clTime < soonestClearanceTime) {
          soonestClearanceTime = clTime;
          soonestClearanceAmount = amt;
        }
      }
    }
  });

  const availableBalance = Number(wallet?.balance || 0);
  const submissionsTotalEarned = (rawSubmissions || []).reduce(
    (sum: number, s: any) => sum + Number(s.payout_amount || 0) + Number(s.pending_payout_amount || 0),
    0
  );
  const totalEarned = Math.max(
    Number(creator?.total_earned || 0),
    submissionsTotalEarned,
    availableBalance + pendingEscrow + totalWithdrawn
  );

  // 4. Construct Clean, Non-Duplicative Transaction History
  const formattedTransactions: any[] = [];

  // A. Format wallet_transactions (Daily Batches, completed payouts, reversals)
  rawTransactions.forEach((tx: any) => {
    const isClearing = tx.status === 'clearing';
    const campTitle = tx.campaigns?.title || 'Daily Settlement Batch';
    const subObj = tx.submissions;
    const viewsSettled = subObj ? Number(subObj.last_paid_view_count || subObj.final_view_count || 0) : 0;
    const cpmRate = Number(tx.campaigns?.cpm_rate || 0);
    const clearanceTime = tx.clears_at || new Date(new Date(tx.created_at).getTime() + 24 * 3600 * 1000).toISOString();

    formattedTransactions.push({
      id: tx.id,
      title: campTitle,
      campaign_title: isClearing ? '24h Verification Escrow' : 'Settled to Available Balance',
      reference: tx.paystack_reference || `KP-TX-${tx.id.slice(0, 8).toUpperCase()}`,
      amount: Number(tx.amount || 0),
      views_count: viewsSettled,
      views_scraped: viewsSettled,
      views_delta: viewsSettled,
      cpm_rate: cpmRate,
      type: tx.type === 'withdrawal' || Number(tx.amount || 0) < 0 ? 'debit' : 'credit',
      transaction_type: tx.type,
      status: isClearing ? 'clearing' : tx.status,
      created_at: tx.created_at,
      settled_at: tx.created_at,
      clearance_at: clearanceTime,
      is_clearing: isClearing,
      settlement_method: isClearing ? '24h EOD Verification Escrow' : 'Settled to Available Balance',
    });
  });

  // B. Format payout_requests (Bank withdrawals)
  payoutRequests.forEach((p: any) => {
    formattedTransactions.push({
      id: `payout-req-${p.id}`,
      title: `Bank Withdrawal (${p.bank_name || 'NUBAN'})`,
      campaign_title: 'Bank Transfer',
      reference: p.paystack_transfer_code || p.reference || `KP-WDR-${p.id.slice(0, 8).toUpperCase()}`,
      amount: -Number(p.amount || 0),
      type: 'debit',
      transaction_type: 'withdrawal',
      status: p.status === 'success' || p.status === 'completed' ? 'completed' : p.status,
      created_at: p.created_at,
      settled_at: p.created_at,
      settlement_method: 'Direct Bank Settlement (NUBAN)',
    });
  });

  formattedTransactions.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
    availableBalance: Number(availableBalance || 0),
    pendingEscrow: Number(pendingEscrow || 0),
    todayAccrual: Number(todayAccrual || 0),
    todayViews: Number(todayViews || 0),
    totalEarned: Number(totalEarned || 0),
    totalWithdrawn: Number(totalWithdrawn || 0),
    lastWithdrawalDate,
    bankDetails: primaryBank,
    bankAccounts,
    transactions: formattedTransactions,
    nextClearanceDate: soonestClearanceTime ? new Date(soonestClearanceTime).toISOString() : null,
    nextClearanceAmount: soonestClearanceAmount,
    kycStatus: creator?.kyc_status || 'unverified',
  };
}

export interface SocialAccountDetails {
  id?: string;
  platform?: string;
  handle: string;
  avatarUrl?: string | null;
  followerCount?: number | null;
  followingCount?: number | null;
  likesCount?: number | null;
  videoCount?: number | null;
  avgViews?: number | null;
  engagementRate?: number | null;
  platformUserId?: string | null;
  lastSyncedAt?: string | null;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'failed';
  verificationCode?: string | null;
  verificationMethod?: string | null;
  verifiedAt?: string | null;
}

export async function getCreatorSocialAccounts(
  profileId: string
): Promise<Record<string, SocialAccountDetails>> {
  const grouped = await getCreatorSocialAccountsGrouped(profileId);
  const result: Record<string, SocialAccountDetails> = {};
  Object.keys(grouped).forEach((key) => {
    if (grouped[key] && grouped[key].length > 0) {
      // Pick the first account or verified account as primary
      const verified = grouped[key].find((a) => a.verificationStatus === 'verified');
      result[key] = verified || grouped[key][0];
    }
  });
  return result;
}

export async function getCreatorSocialAccountsGrouped(
  profileId: string
): Promise<Record<string, SocialAccountDetails[]>> {
  const supabase = createAdminClient();
  
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('creator_id', profileId);

  const result: Record<string, SocialAccountDetails[]> = {};

  if (accounts) {
    accounts.forEach((acc: any) => {
      if (acc.platform && acc.handle) {
        const key = acc.platform.toLowerCase();
        if (!result[key]) result[key] = [];
        result[key].push({
          id: acc.id,
          platform: key,
          handle: acc.handle,
          avatarUrl: acc.avatar_url || null,
          followerCount: acc.follower_count ?? null,
          followingCount: acc.following_count ?? null,
          likesCount: acc.likes_count ?? null,
          videoCount: acc.video_count ?? null,
          avgViews: acc.avg_views ?? null,
          engagementRate: acc.engagement_rate ?? null,
          platformUserId: acc.platform_user_id || null,
          lastSyncedAt: acc.last_synced_at || null,
          verificationStatus: acc.verification_status || (acc.oauth_access_token ? 'verified' : 'unverified'),
          verificationCode: acc.verification_code || null,
          verificationMethod: acc.verification_method || (acc.oauth_access_token ? 'oauth' : null),
          verifiedAt: acc.verified_at || null,
        });
      }
    });
  }

  // Alias twitter & x for uniform key lookup across views
  if (result.twitter && !result.x) result.x = result.twitter;
  if (result.x && !result.twitter) result.twitter = result.x;

  return result;
}

export async function saveSocialAccount({
  profileId,
  platform,
  handle,
  platformUserId,
  followerCount = null,
  followingCount = null,
  likesCount = null,
  videoCount = null,
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
  followingCount?: number | null;
  likesCount?: number | null;
  videoCount?: number | null;
  avatarUrl?: string | null;
  avgViews?: number | null;
  engagementRate?: number | null;
  accessToken?: string | null;
  scopes?: string[] | null;
}) {
  const supabase = createAdminClient();
  const cleanHandle = handle.trim().replace(/^@/, '');
  let platformKey = platform.toLowerCase();
  if (platformKey === 'twitter') {
    platformKey = 'x';
  }
  const userId = platformUserId || cleanHandle;

  // 1. Check if social account record already exists for this creator, platform, AND handle
  const { data: existing } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('creator_id', profileId)
    .eq('platform', platformKey)
    .ilike('handle', cleanHandle)
    .maybeSingle();

  const updateData: any = {
    handle: cleanHandle,
    platform_user_id: userId,
    last_synced_at: new Date().toISOString(),
  };

  if (accessToken) {
    updateData.verification_status = 'verified';
    updateData.verification_method = 'oauth';
    updateData.verified_at = new Date().toISOString();
  }

  // Only set columns that exist in the social_accounts schema
  if (followerCount !== undefined && followerCount !== null) updateData.follower_count = followerCount;
  if (followingCount !== undefined && followingCount !== null) updateData.following_count = followingCount;
  if (likesCount !== undefined && likesCount !== null) updateData.likes_count = likesCount;
  if (videoCount !== undefined && videoCount !== null) updateData.video_count = videoCount;
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
      following_count: followingCount ?? 0,
      likes_count: likesCount ?? 0,
      video_count: videoCount ?? 0,
      avatar_url: avatarUrl,
      avg_views: avgViews,
      engagement_rate: engagementRate,
      oauth_access_token: accessToken,
      oauth_scopes: scopes,
      verification_status: accessToken ? 'verified' : 'unverified',
      verification_method: accessToken ? 'oauth' : null,
      verified_at: accessToken ? new Date().toISOString() : null,
      connected_at: new Date().toISOString(),
    });
  }

  return { success: true };
}

export interface CreatorSettingsPayload {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    clerk_id: string;
  };
  creator: {
    id: string;
    display_name: string | null;
    creator_handle: string | null;
    bio: string | null;
    niche_categories: string[];
    total_earned: number;
    notification_preferences: {
      notify_email: boolean;
      notify_payouts: boolean;
      notify_campaigns: boolean;
    };
    kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
    kyc_didit_session_id: string | null;
    kyc_verified_at: string | null;
  };
  socialAccounts: Record<string, SocialAccountDetails>;
  primaryBank: BankAccountItem | null;
  completeness: {
    score: number;
    steps: {
      id: string;
      label: string;
      isComplete: boolean;
      shortcutUrl?: string;
    }[];
  };
}

export async function getCreatorProfileSettings(profileId: string): Promise<CreatorSettingsPayload> {
  const supabase = createAdminClient();

  // 1. Fetch base profile from profiles table
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile) {
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', profileId)
      .maybeSingle();
    profile = userProfile;
  }

  // 2. Fetch creator profile details
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  // 3. Fetch connected social accounts
  const socialAccounts = await getCreatorSocialAccounts(profileId);

  // 4. Fetch bank details
  const earningsData = await getCreatorEarningsData(profileId);
  const primaryBank = earningsData.bankDetails;

  // Notification preferences default
  const rawNotifs = creator?.notification_preferences || {};
  const notificationPreferences = {
    notify_email: typeof rawNotifs.notify_email === 'boolean' ? rawNotifs.notify_email : true,
    notify_payouts: typeof rawNotifs.notify_payouts === 'boolean' ? rawNotifs.notify_payouts : true,
    notify_campaigns: typeof rawNotifs.notify_campaigns === 'boolean' ? rawNotifs.notify_campaigns : true,
  };

  const hasName = Boolean((creator?.display_name || profile?.full_name || '').trim());
  const hasBio = Boolean((creator?.bio || '').trim());
  const hasNiches = Boolean(creator?.niche_categories && creator.niche_categories.length > 0);
  const hasConnectedSocial = Object.keys(socialAccounts).length > 0;
  const hasBank = Boolean(primaryBank);
  const isKycVerified = creator?.kyc_status === 'verified';

  const steps = [
    { id: 'name', label: 'Display Name & Handle', isComplete: hasName },
    { id: 'bio', label: 'Creator Statement & Bio', isComplete: hasBio },
    { id: 'niches', label: 'Content Niches Selected', isComplete: hasNiches },
    { id: 'social', label: 'Connect Social Media Account', isComplete: hasConnectedSocial, shortcutUrl: '/accounts' },
    { id: 'bank', label: 'Add Nigerian Bank Payout Account', isComplete: hasBank, shortcutUrl: '/earnings' },
    { id: 'kyc', label: 'Identity Verification (Didit KYC)', isComplete: isKycVerified },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const score = Math.round((completedCount / steps.length) * 100);

  return {
    profile: {
      id: profileId,
      email: profile?.email || '',
      full_name: profile?.full_name || null,
      avatar_url: creator?.avatar_url || profile?.avatar_url || null,
      phone: profile?.phone || null,
      clerk_id: profile?.clerk_id || '',
    },
    creator: {
      id: creator?.id || profileId,
      display_name: creator?.display_name || profile?.full_name || null,
      creator_handle: creator?.creator_handle || null,
      bio: creator?.bio || null,
      niche_categories: creator?.niche_categories || [],
      total_earned: Number(creator?.total_earned || 0),
      notification_preferences: notificationPreferences,
      kyc_status: (creator?.kyc_status as any) || 'unverified',
      kyc_didit_session_id: creator?.kyc_didit_session_id || null,
      kyc_verified_at: creator?.kyc_verified_at || null,
    },
    socialAccounts,
    primaryBank,
    completeness: {
      score,
      steps,
    },
  };
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
  creatorProfileId: string,
  secondaryProfileId?: string
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

  // Resolve all candidate IDs for the creator (profile_id and creator_profiles.id)
  const candidateIds = Array.from(
    new Set([creatorProfileId, secondaryProfileId].filter(Boolean))
  );

  if (candidateIds.length > 0) {
    const { data: cp } = await supabase
      .from('creator_profiles')
      .select('id, profile_id')
      .or(`id.in.(${candidateIds.join(',')}),profile_id.in.(${candidateIds.join(',')})`)
      .maybeSingle();

    if (cp) {
      if (cp.id) candidateIds.push(cp.id);
      if (cp.profile_id) candidateIds.push(cp.profile_id);
    }
  }

  const uniqueIds = Array.from(new Set(candidateIds));

  // 2. Fetch submissions from database tables where post_url is non-null
  let query = supabase
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
    .not('post_url', 'is', null)
    .order('submitted_at', { ascending: false });

  if (uniqueIds.length > 1) {
    query = query.in('creator_id', uniqueIds);
  } else if (uniqueIds.length === 1) {
    query = query.eq('creator_id', uniqueIds[0]);
  }

  const { data: subs1, error: subsError } = await query;
  if (subsError) {
    console.error('[getCreatorSubmissionsData] Error fetching submissions:', subsError);
  }

  const rawSubmissions = (subs1 || []).filter(
    (sub) => sub.post_url && sub.post_url.trim().length > 0
  );

  let submissions: DetailedSubmissionItem[] = [];

  if (rawSubmissions.length > 0) {
    submissions = rawSubmissions.map((sub: any) => {
      const campaign = sub.campaign || sub.campaigns || {};
      const platform = (campaign.channels?.[0] || extractPlatformFromUrl(sub.post_url) || 'tiktok').toLowerCase();
      const views = sub.final_view_count || 0;
      const cpmRate = campaign.cpm_rate || 3500;
      const minThresh = campaign.min_view_threshold || 1000;
      const viewsEarned = views >= minThresh ? Math.floor((views / 1000) * cpmRate) : 0;
      const earned = Math.max(Number(sub.payout_amount || 0) + Number(sub.pending_payout_amount || 0), viewsEarned);

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
        rejectionReason: sub.failure_reason,
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
