import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import FinancesDashboardManager, {
  WalletWithProfile,
  CampaignEscrowItem,
} from '@/components/admin/finances/FinancesDashboardManager';
import {
  fetchPlatformTreasuryMetricsAction,
  TreasuryMetrics,
} from '@/app/actions/admin-finances';
import { TransactionLedgerItem } from '@/components/admin/finances/modals/TransactionDetailModal';
import { PayoutRequestItem } from '@/components/admin/finances/modals/PayoutActionModal';

export const revalidate = 0;

export default async function AdminFinancesPage() {
  const { supabase } = await requireAdminSession();

  // 1. Fetch metrics, raw tables, and profiles in parallel
  const [
    metrics,
    txRes,
    payoutRes,
    walletsRes,
    campaignsRes,
    profilesRes,
    creatorsRes,
    advertisersRes,
    submissionsRes,
  ] = await Promise.all([
    fetchPlatformTreasuryMetricsAction(),
    supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('payout_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('wallets')
      .select('*')
      .order('balance', { ascending: false })
      .limit(200),
    supabase
      .from('campaigns')
      .select('id, title, total_budget, spent_budget, reserved_budget, status, created_at, is_featured, advertiser_id')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role'),
    supabase
      .from('creator_profiles')
      .select('profile_id, display_name, creator_handle, kyc_status, total_earned'),
    supabase
      .from('advertiser_profiles')
      .select('profile_id, company_name, company_website'),
    supabase
      .from('submissions')
      .select('id, post_url')
      .limit(500),
  ]);

  // 2. Build Fast Lookup Maps
  const profileMap = new Map<string, any>();
  (profilesRes.data || []).forEach((p: any) => {
    profileMap.set(p.id, p);
  });

  const creatorMap = new Map<string, any>();
  (creatorsRes.data || []).forEach((c: any) => {
    creatorMap.set(c.profile_id, c);
  });

  const advertiserMap = new Map<string, any>();
  (advertisersRes.data || []).forEach((a: any) => {
    advertiserMap.set(a.profile_id, a);
  });

  const walletMap = new Map<string, any>();
  (walletsRes.data || []).forEach((w: any) => {
    walletMap.set(w.id, w);
  });

  const campaignMap = new Map<string, any>();
  (campaignsRes.data || []).forEach((c: any) => {
    campaignMap.set(c.id, c);
  });

  const submissionMap = new Map<string, any>();
  (submissionsRes.data || []).forEach((s: any) => {
    submissionMap.set(s.id, s);
  });

  // 3. Hydrate Transactions
  const hydratedTransactions: TransactionLedgerItem[] = (txRes.data || []).map((t: any) => {
    const wallet = walletMap.get(t.wallet_id);
    const profile = wallet ? profileMap.get(wallet.profile_id) : null;
    const campaign = t.campaign_id ? campaignMap.get(t.campaign_id) : null;
    const submission = t.submission_id ? submissionMap.get(t.submission_id) : null;

    return {
      id: t.id,
      wallet_id: t.wallet_id,
      type: t.type,
      amount: Number(t.amount) || 0,
      status: t.status,
      paystack_reference: t.paystack_reference,
      created_at: t.created_at,
      campaign_id: t.campaign_id,
      submission_id: t.submission_id,
      gross_amount: t.gross_amount ? Number(t.gross_amount) : null,
      fee_amount: t.fee_amount ? Number(t.fee_amount) : null,
      net_amount: t.net_amount ? Number(t.net_amount) : null,
      views_audited: t.views_audited ? Number(t.views_audited) : null,
      wallet: wallet
        ? {
            wallet_type: wallet.wallet_type,
            profile_id: wallet.profile_id,
          }
        : null,
      profile: profile
        ? {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            avatar_url: profile.avatar_url,
          }
        : null,
      campaign: campaign
        ? {
            id: campaign.id,
            title: campaign.title,
          }
        : null,
      submission: submission
        ? {
            id: submission.id,
            post_url: submission.post_url,
          }
        : null,
    };
  });

  // 4. Hydrate Payout Requests
  const hydratedPayouts: PayoutRequestItem[] = (payoutRes.data || []).map((p: any) => {
    const profile = profileMap.get(p.profile_id);
    const creator = creatorMap.get(p.profile_id);

    return {
      id: p.id,
      profile_id: p.profile_id,
      amount: Number(p.amount) || 0,
      status: p.status,
      bank_name: p.bank_name,
      account_number: p.account_number,
      account_name: p.account_name,
      reference: p.reference,
      created_at: p.created_at,
      profile: profile
        ? {
            full_name: profile.full_name,
            email: profile.email,
            avatar_url: profile.avatar_url,
          }
        : null,
      creator_profile: creator
        ? {
            display_name: creator.display_name,
            creator_handle: creator.creator_handle,
            kyc_status: creator.kyc_status,
            total_earned: creator.total_earned ? Number(creator.total_earned) : null,
          }
        : null,
    };
  });

  // 5. Hydrate Wallets
  const hydratedWallets: WalletWithProfile[] = (walletsRes.data || []).map((w: any) => {
    const profile = profileMap.get(w.profile_id);
    return {
      id: w.id,
      profile_id: w.profile_id,
      wallet_type: w.wallet_type,
      balance: Number(w.balance) || 0,
      created_at: w.created_at,
      updated_at: w.updated_at,
      profile: profile
        ? {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            avatar_url: profile.avatar_url,
            role: profile.role,
          }
        : null,
    };
  });

  // 6. Hydrate Campaign Escrows
  const hydratedCampaigns: CampaignEscrowItem[] = (campaignsRes.data || []).map((c: any) => {
    const advertiser = c.advertiser_id ? advertiserMap.get(c.advertiser_id) : null;
    const profile = c.advertiser_id ? profileMap.get(c.advertiser_id) : null;

    return {
      id: c.id,
      title: c.title,
      total_budget: Number(c.total_budget) || 0,
      spent_budget: Number(c.spent_budget) || 0,
      reserved_budget: Number(c.reserved_budget) || 0,
      status: c.status,
      created_at: c.created_at,
      is_featured: c.is_featured,
      advertiser: {
        full_name: profile?.full_name || null,
        company_name: advertiser?.company_name || null,
      },
    };
  });

  return (
    <FinancesDashboardManager
      initialMetrics={metrics}
      transactions={hydratedTransactions}
      payoutRequests={hydratedPayouts}
      wallets={hydratedWallets}
      campaigns={hydratedCampaigns}
    />
  );
}
