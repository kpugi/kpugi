import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import ScraperDashboardManager, {
  VerificationCheckRow,
  SubmissionAuditRow,
} from '@/components/admin/scraper/ScraperDashboardManager';
import {
  getGitHubWorkflowStatusAction,
  getApifyStatusAction,
} from '@/app/actions/admin-scraper';

export const revalidate = 0;

export default async function AdminScraperPage() {
  const { supabase } = await requireAdminSession();

  // Parallel data queries
  const [
    totalChecksRes,
    checksRes,
    dueSubmissionsRes,
    auditsRes,
    githubStatus,
    apifyStatus,
  ] = await Promise.all([
    // 1. Total checks count
    supabase.from('verification_checks').select('*', { count: 'exact', head: true }),

    // 2. Recent verification checks with joined context
    supabase
      .from('verification_checks')
      .select(`
        id,
        submission_id,
        checked_at,
        post_reachable,
        view_count,
        raw_scrape,
        notes,
        submission:submissions (
          id,
          post_url,
          status,
          campaign:campaigns (
            title
          ),
          creator:creator_profiles (
            profile:profiles (
              full_name,
              avatar_url
            ),
            display_name,
            creator_handle
          )
        )
      `)
      .order('checked_at', { ascending: false })
      .limit(100),

    // 3. Due submissions count
    supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'joined', 'verified_pass']),

    // 4. Settlement audits ledger
    supabase
      .from('submission_audits')
      .select(`
        id,
        submission_id,
        campaign_id,
        creator_id,
        cycle_number,
        views_scraped,
        views_delta,
        payout_amount,
        status,
        settled_at,
        failure_reason,
        submission:submissions (
          post_url,
          campaign:campaigns (
            title
          ),
          creator:creator_profiles (
            profile:profiles (
              full_name
            ),
            display_name,
            creator_handle
          )
        )
      `)
      .order('settled_at', { ascending: false })
      .limit(50),

    // 5. GitHub Actions workflow runs
    getGitHubWorkflowStatusAction(15),

    // 6. Apify account & actor runs
    getApifyStatusAction(),
  ]);

  // Transform checks data
  const rawChecks = checksRes.data || [];
  const checks: VerificationCheckRow[] = rawChecks.map((chk: any) => {
    const sub = Array.isArray(chk.submission) ? chk.submission[0] : chk.submission;
    const creator = sub?.creator
      ? Array.isArray(sub.creator)
        ? sub.creator[0]
        : sub.creator
      : null;
    const profile = creator?.profile
      ? Array.isArray(creator.profile)
        ? creator.profile[0]
        : creator.profile
      : null;
    const campaign = sub?.campaign
      ? Array.isArray(sub.campaign)
        ? sub.campaign[0]
        : sub.campaign
      : null;

    return {
      id: chk.id,
      submission_id: chk.submission_id,
      checked_at: chk.checked_at,
      post_reachable: chk.post_reachable,
      view_count: chk.view_count,
      raw_scrape: chk.raw_scrape,
      notes: chk.notes,
      submission: sub
        ? {
            id: sub.id,
            post_url: sub.post_url,
            status: sub.status,
            campaign: campaign ? { title: campaign.title } : null,
            creator: creator
              ? {
                  full_name: profile?.full_name || null,
                  display_name: creator.display_name || null,
                  creator_handle: creator.creator_handle || null,
                  avatar_url: profile?.avatar_url || null,
                }
              : null,
          }
        : null,
    };
  });

  // Transform audits data
  const rawAudits = auditsRes.data || [];
  const audits: SubmissionAuditRow[] = rawAudits.map((a: any) => {
    const sub = Array.isArray(a.submission) ? a.submission[0] : a.submission;
    const creator = sub?.creator
      ? Array.isArray(sub.creator)
        ? sub.creator[0]
        : sub.creator
      : null;
    const profile = creator?.profile
      ? Array.isArray(creator.profile)
        ? creator.profile[0]
        : creator.profile
      : null;
    const campaign = sub?.campaign
      ? Array.isArray(sub.campaign)
        ? sub.campaign[0]
        : sub.campaign
      : null;

    return {
      id: a.id,
      submission_id: a.submission_id,
      campaign_id: a.campaign_id,
      creator_id: a.creator_id,
      cycle_number: a.cycle_number,
      views_scraped: a.views_scraped,
      views_delta: a.views_delta,
      payout_amount: a.payout_amount,
      status: a.status,
      settled_at: a.settled_at,
      failure_reason: a.failure_reason,
      submission: sub
        ? {
            post_url: sub.post_url,
            campaign: campaign ? { title: campaign.title } : null,
            creator: creator
              ? {
                  full_name: profile?.full_name || null,
                  display_name: creator.display_name || null,
                  creator_handle: creator.creator_handle || null,
                }
              : null,
          }
        : null,
    };
  });

  // Compute telemetry metrics & extractor distribution
  const totalChecks = totalChecksRes.count || checks.length;
  const reachableChecksCount = checks.filter((c) => c.post_reachable).length;
  const reachabilityRate =
    checks.length > 0 ? Math.round((reachableChecksCount / checks.length) * 100) : 100;
  const dueSubmissionsCount = dueSubmissionsRes.count || 0;
  const totalSettledCount = audits.length;

  const extractorDistribution: Record<string, number> = {};
  checks.forEach((c) => {
    const ext = ((c.raw_scrape as any)?.extractor || 'standard').toLowerCase();
    extractorDistribution[ext] = (extractorDistribution[ext] || 0) + 1;
  });

  // Views delta sum from recent audits
  const recentViewsDelta = audits.reduce((sum, a) => sum + (Number(a.views_delta) || 0), 0);

  return (
    <ScraperDashboardManager
      initialSummary={{
        totalChecks,
        reachabilityRate,
        recentViewsDelta,
        dueSubmissionsCount,
        totalSettledCount,
      }}
      initialGitHubStatus={githubStatus}
      initialApifyStatus={apifyStatus}
      initialChecks={checks}
      initialAudits={audits}
      extractorDistribution={extractorDistribution}
    />
  );
}
