import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/server';
import CampaignDetailAdminView from '@/components/admin/campaigns/CampaignDetailAdminView';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('title, campaign_code')
    .or(`id.eq.${id},campaign_code.ilike.${id}`)
    .maybeSingle();

  return {
    title: campaign?.title
      ? `${campaign.title} (${campaign.campaign_code || 'Overview'}) — Admin Ops`
      : 'Campaign Inspection — Admin',
  };
}

export default async function AdminCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const supabase = createAdminClient();

  // 1. Fetch Campaign with advertiser profiles and creatives
  const { data: campaign, error: campaignErr } = await supabase
    .from('campaigns')
    .select(`
      id,
      campaign_code,
      title,
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
      is_featured,
      is_hero_pinned,
      created_at,
      funded_at,
      advertiser_id,
      advertiser_profiles:advertiser_id (
        company_name,
        company_website,
        billing_email,
        profiles:profiles!advertiser_profiles_profile_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      ),
      campaign_creatives (
        id,
        file_url,
        copy_text,
        caption_suggestion,
        created_at
      )
    `)
    .or(`id.eq.${id},campaign_code.ilike.${id}`)
    .maybeSingle();

  if (campaignErr || !campaign) {
    console.error('[AdminCampaignDetailPage] Campaign not found:', id, campaignErr);
    notFound();
  }

  // 2. Query pinned hero count for slot tracking
  const { count: heroPinnedCount } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('is_hero_pinned', true);

  // 3. Query creator submissions under this campaign
  const { data: submissionsData } = await supabase
    .from('submissions')
    .select(`
      id,
      post_url,
      screenshot_url,
      submitted_at,
      reserved_amount,
      payout_amount,
      status,
      final_view_count,
      verified_at,
      failure_reason,
      creator:creator_profiles!creator_id (
        profile_id,
        display_name,
        profiles:profiles!creator_profiles_profile_id_fkey (
          full_name,
          email,
          avatar_url
        )
      ),
      social_account:social_accounts!social_account_id (
        platform,
        handle
      )
    `)
    .eq('campaign_id', campaign.id)
    .order('submitted_at', { ascending: false });

  // 4. Query forensic audit trail for this campaign
  const [adminAuditRes, brandAuditRes] = await Promise.all([
    supabase
      .from('admin_audit_log')
      .select('id, action, details, payload, created_at')
      .eq('target_id', campaign.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('brand_audit_log')
      .select('id, action, details, payload, created_at')
      .eq('target_id', campaign.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  const auditTrail = [
    ...(adminAuditRes.data || []).map((l: any) => ({ ...l, source: 'admin' as const })),
    ...(brandAuditRes.data || []).map((l: any) => ({ ...l, source: 'brand' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // 5. Query verification checks for this campaign's submissions
  const submissionIds = (submissionsData || []).map((s: any) => s.id);
  let verificationChecks: any[] = [];
  if (submissionIds.length > 0) {
    const { data: checksData } = await supabase
      .from('verification_checks')
      .select(`
        id,
        submission_id,
        checked_at,
        post_reachable,
        view_count,
        raw_scrape,
        notes
      `)
      .in('submission_id', submissionIds)
      .order('checked_at', { ascending: false })
      .limit(50);

    const subMap = new Map((submissionsData || []).map((s: any) => [s.id, s]));
    verificationChecks = (checksData || []).map((chk: any) => {
      const sub: any = subMap.get(chk.submission_id);
      const creatorProf = Array.isArray(sub?.creator) ? sub.creator[0] : sub?.creator;
      const creatorUser = creatorProf?.profiles
        ? Array.isArray(creatorProf.profiles)
          ? creatorProf.profiles[0]
          : creatorProf.profiles
        : null;
      const soc = Array.isArray(sub?.social_account) ? sub.social_account[0] : sub?.social_account;

      return {
        id: chk.id,
        submission_id: chk.submission_id,
        checked_at: chk.checked_at,
        post_reachable: !!chk.post_reachable,
        view_count: chk.view_count !== null ? Number(chk.view_count) : null,
        raw_scrape: chk.raw_scrape || null,
        notes: chk.notes || '',
        post_url: sub?.post_url || '',
        creator_name: creatorProf?.display_name || creatorUser?.full_name || 'Creator',
        platform: soc?.platform || 'social',
        handle: soc?.handle ? `@${soc.handle}` : '',
      };
    });
  }

  // 6. Query GitHub Actions workflow execution runs
  let githubRuns: any[] = [];
  try {
    const ghRes = await fetch('https://api.github.com/repos/kpugi/kpugi/actions/runs?per_page=10', {
      headers: {
        'User-Agent': 'Kpugi-App',
        ...(process.env.GITHUB_PAT ? { Authorization: `Bearer ${process.env.GITHUB_PAT}` } : {}),
      },
      next: { revalidate: 60 },
    });
    if (ghRes.ok) {
      const ghData = await ghRes.json();
      githubRuns = (ghData.workflow_runs || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        status: w.status,
        conclusion: w.conclusion,
        event: w.event,
        created_at: w.created_at,
        updated_at: w.updated_at,
        run_duration_ms:
          new Date(w.updated_at).getTime() - new Date(w.created_at).getTime(),
        html_url: w.html_url,
      }));
    }
  } catch (ghErr) {
    console.warn('[AdminCampaignDetailPage] Error querying GitHub runs:', ghErr);
  }

  // 7. Structure advertiser info cleanly
  const adv = Array.isArray(campaign.advertiser_profiles)
    ? campaign.advertiser_profiles[0]
    : campaign.advertiser_profiles;

  const advProfile = adv?.profiles
    ? Array.isArray(adv.profiles)
      ? adv.profiles[0]
      : adv.profiles
    : null;

  const advertiser = adv
    ? {
        company_name: adv.company_name || 'Brand Partner',
        company_website: adv.company_website || null,
        billing_email: adv.billing_email || advProfile?.email || null,
        profile: advProfile
          ? {
              id: advProfile.id,
              full_name: advProfile.full_name,
              email: advProfile.email,
              avatar_url: advProfile.avatar_url,
            }
          : null,
      }
    : null;

  const creatives = Array.isArray(campaign.campaign_creatives)
    ? campaign.campaign_creatives
    : [];

  const submissions = (submissionsData || []).map((s: any) => {
    const creatorProf = Array.isArray(s.creator) ? s.creator[0] : s.creator;
    const creatorUser = creatorProf?.profiles
      ? Array.isArray(creatorProf.profiles)
        ? creatorProf.profiles[0]
        : creatorProf.profiles
      : null;
    const soc = Array.isArray(s.social_account) ? s.social_account[0] : s.social_account;

    return {
      id: s.id,
      post_url: s.post_url,
      screenshot_url: s.screenshot_url,
      submitted_at: s.submitted_at,
      reserved_amount: Number(s.reserved_amount || 0),
      payout_amount: s.payout_amount ? Number(s.payout_amount) : null,
      status: s.status,
      final_view_count: s.final_view_count ? Number(s.final_view_count) : 0,
      verified_at: s.verified_at,
      failure_reason: s.failure_reason,
      creator: creatorProf
        ? {
            profile_id: creatorProf.profile_id,
            display_name: creatorProf.display_name,
            profiles: creatorUser,
          }
        : null,
      social_account: soc ? { platform: soc.platform, handle: soc.handle } : null,
    };
  });

  return (
    <CampaignDetailAdminView
      campaign={{
        id: campaign.id,
        campaign_code: campaign.campaign_code,
        title: campaign.title,
        description: campaign.description,
        ad_format: campaign.ad_format,
        requirements: campaign.requirements,
        cpm_rate: Number(campaign.cpm_rate || 2000),
        total_budget: Number(campaign.total_budget || 0),
        reserved_budget: Number(campaign.reserved_budget || 0),
        spent_budget: Number(campaign.spent_budget || 0),
        min_view_threshold: campaign.min_view_threshold,
        required_live_duration_hours: campaign.required_live_duration_hours,
        verification_grace_hours: campaign.verification_grace_hours,
        status: campaign.status,
        is_featured: !!campaign.is_featured,
        is_hero_pinned: !!campaign.is_hero_pinned,
        created_at: campaign.created_at,
        funded_at: campaign.funded_at,
        advertiser_id: campaign.advertiser_id,
      }}
      advertiser={advertiser}
      creatives={creatives}
      submissions={submissions}
      auditTrail={auditTrail}
      verificationChecks={verificationChecks}
      githubRuns={githubRuns}
      heroPinnedCount={heroPinnedCount || 0}
    />
  );
}
