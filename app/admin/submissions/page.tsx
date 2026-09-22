import React from 'react';
import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/admin/auth';
import SubmissionsTableManager, {
  SubmissionRowData,
} from '@/components/admin/submissions/SubmissionsTableManager';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Submissions Management & Verification — KpugiAdmin',
  description:
    'Audit, verify, and manage content submissions, view telemetry, and escrow payouts across Kpugi campaigns.',
};

export default async function AdminSubmissionsPage() {
  const { supabase } = await requireAdminSession();

  // Query submissions joined with campaigns, creator profiles, and social accounts
  const { data: rawSubmissions, error: fetchErr } = await supabase
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
      campaign:campaigns (
        id,
        title,
        cpm_rate,
        status,
        channels
      ),
      creator_profile:creator_profiles (
        profile_id,
        display_name,
        creator_handle,
        profile:profiles (
          full_name,
          email,
          avatar_url
        )
      ),
      social_account:social_accounts (
        platform,
        handle
      )
    `)
    .order('submitted_at', { ascending: false })
    .limit(300);

  if (fetchErr) {
    console.error('[AdminSubmissionsPage] Failed to fetch submissions:', fetchErr);
  }

  const list = rawSubmissions || [];

  // Format into SubmissionRowData
  const submissions: SubmissionRowData[] = list.map((item: any) => {
    const creatorProf = Array.isArray(item.creator_profile)
      ? item.creator_profile[0]
      : item.creator_profile;
    const profile = creatorProf?.profile
      ? Array.isArray(creatorProf.profile)
        ? creatorProf.profile[0]
        : creatorProf.profile
      : null;
    const campaign = Array.isArray(item.campaign) ? item.campaign[0] : item.campaign;
    const social = Array.isArray(item.social_account)
      ? item.social_account[0]
      : item.social_account;

    return {
      id: item.id,
      campaign_id: item.campaign_id,
      creator_id: item.creator_id,
      status: item.status,
      post_url: item.post_url,
      screenshot_url: item.screenshot_url,
      submitted_at: item.submitted_at,
      reserved_amount: Number(item.reserved_amount) || 0,
      payout_amount: item.payout_amount !== null ? Number(item.payout_amount) : null,
      final_view_count: item.final_view_count !== null ? Number(item.final_view_count) : null,
      failure_reason: item.failure_reason,
      verified_at: item.verified_at,
      campaign: campaign || null,
      creator: {
        id: item.creator_id,
        full_name: profile?.full_name || null,
        email: profile?.email || undefined,
        avatar_url: profile?.avatar_url || null,
        display_name: creatorProf?.display_name || null,
        creator_handle: creatorProf?.creator_handle || null,
      },
      social_account: social || null,
    };
  });

  return (
    <div className="space-y-6">
      <SubmissionsTableManager initialSubmissions={submissions} />
    </div>
  );
}
