import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin/auth';
import SubmissionDetailAdminView, {
  SubmissionDetailData,
} from '@/components/admin/submissions/SubmissionDetailAdminView';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { supabase } = await requireAdminSession();

  const { data: sub } = await supabase
    .from('submissions')
    .select('id, campaign:campaigns(title)')
    .eq('id', id)
    .maybeSingle();

  const campaignTitle = (sub?.campaign as any)?.title || 'Campaign';

  return {
    title: `Submission #${id.slice(0, 8)} (${campaignTitle}) — KpugiAdmin`,
    description: `Inspect verification telemetry, media proofs, and audit logs for submission #${id}`,
  };
}

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: submissionId } = await params;
  const { supabase } = await requireAdminSession();

  // 1. Fetch submission with campaign, creator profile, and social account
  const { data: rawSub, error: subErr } = await supabase
    .from('submissions')
    .select(`
      id,
      campaign_id,
      creator_id,
      social_account_id,
      status,
      post_url,
      screenshot_url,
      submitted_at,
      reserved_amount,
      payout_amount,
      final_view_count,
      failure_reason,
      verified_at,
      paid_at,
      commission_amount,
      campaign:campaigns (
        id,
        title,
        cpm_rate,
        total_budget,
        spent_budget,
        status,
        channels,
        advertiser_id,
        advertiser:advertiser_profiles (
          company_name
        )
      ),
      creator_profile:creator_profiles (
        profile_id,
        display_name,
        creator_handle,
        kyc_status,
        total_earned,
        profile:profiles (
          id,
          full_name,
          email,
          avatar_url,
          phone,
          is_admin,
          created_at
        )
      ),
      social_account:social_accounts (
        id,
        platform,
        handle,
        follower_count,
        connected_at,
        last_synced_at
      )
    `)
    .eq('id', submissionId)
    .maybeSingle();

  if (subErr || !rawSub) {
    notFound();
  }

  // 2. Fetch parallel verification checks, wallet transactions, and audit logs
  const [checksRes, walletTxRes, auditsRes] = await Promise.all([
    supabase
      .from('verification_checks')
      .select('*')
      .eq('submission_id', submissionId)
      .order('checked_at', { ascending: false })
      .limit(100),
    supabase
      .from('wallet_transactions')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false }),
    supabase
      .from('audit_log')
      .select('id, action, details, payload, created_at')
      .eq('target_id', submissionId)
      .order('created_at', { ascending: false })
      .limit(60),
  ]);

  const creatorProf = Array.isArray(rawSub.creator_profile)
    ? rawSub.creator_profile[0]
    : rawSub.creator_profile;
  const profile = creatorProf?.profile
    ? Array.isArray(creatorProf.profile)
      ? creatorProf.profile[0]
      : creatorProf.profile
    : null;
  const campaign = Array.isArray(rawSub.campaign) ? rawSub.campaign[0] : rawSub.campaign;
  const advertiser = campaign?.advertiser
    ? Array.isArray(campaign.advertiser)
      ? campaign.advertiser[0]
      : campaign.advertiser
    : null;
  const social = Array.isArray(rawSub.social_account)
    ? rawSub.social_account[0]
    : rawSub.social_account;

  const data: SubmissionDetailData = {
    id: rawSub.id,
    campaign_id: rawSub.campaign_id,
    creator_id: rawSub.creator_id,
    social_account_id: rawSub.social_account_id,
    status: rawSub.status,
    post_url: rawSub.post_url,
    screenshot_url: rawSub.screenshot_url,
    submitted_at: rawSub.submitted_at,
    reserved_amount: Number(rawSub.reserved_amount) || 0,
    payout_amount: rawSub.payout_amount !== null ? Number(rawSub.payout_amount) : null,
    final_view_count: rawSub.final_view_count !== null ? Number(rawSub.final_view_count) : null,
    failure_reason: rawSub.failure_reason,
    verified_at: rawSub.verified_at,
    paid_at: rawSub.paid_at,
    commission_amount: rawSub.commission_amount !== null ? Number(rawSub.commission_amount) : null,
    campaign: campaign
      ? {
          id: campaign.id,
          title: campaign.title,
          cpm_rate: Number(campaign.cpm_rate) || 0,
          total_budget: Number(campaign.total_budget) || 0,
          spent_budget: Number(campaign.spent_budget) || 0,
          status: campaign.status,
          channels: campaign.channels,
          advertiser_id: campaign.advertiser_id,
          advertiser_name: advertiser?.company_name || 'Advertiser',
        }
      : null,
    creator: {
      id: rawSub.creator_id,
      full_name: profile?.full_name || null,
      email: profile?.email || undefined,
      avatar_url: profile?.avatar_url || null,
      display_name: creatorProf?.display_name || null,
      creator_handle: creatorProf?.creator_handle || null,
      kyc_status: creatorProf?.kyc_status || 'unverified',
      total_earned: Number(creatorProf?.total_earned) || 0,
      phone: profile?.phone || null,
      created_at: profile?.created_at,
    },
    social_account: social || null,
    verificationChecks: checksRes.data || [],
    walletTransactions: walletTxRes.data || [],
    auditLogs: auditsRes.data || [],
  };

  return <SubmissionDetailAdminView data={data} />;
}
