'use server';

import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent } from '@/lib/audit';
import { triggerScraperRun } from '@/lib/scraper/trigger';
import { extractPostForVerification } from '@/lib/verification/post-verifier';
import { revalidatePath } from 'next/cache';

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | string;
  conclusion: 'success' | 'failure' | 'cancelled' | 'timed_out' | 'skipped' | null | string;
  event: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  run_number: number;
  run_attempt: number;
  head_branch: string;
  head_sha: string;
  commit_message?: string;
  actor_login?: string;
  actor_avatar?: string;
  duration_seconds?: number | null;
}

export interface ApifyActorRunInfo {
  id: string;
  actId: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationSeconds?: number | null;
  exitCode?: number | null;
}

export interface ApifySystemStatus {
  connected: boolean;
  username?: string;
  email?: string;
  plan?: string;
  actorId?: string;
  actorName?: string;
  actorTitle?: string;
  recentRuns: ApifyActorRunInfo[];
  error?: string;
}

/**
 * getGitHubWorkflowStatusAction
 * Queries live GitHub Actions REST API for scraper-cron.yml runs and health
 */
export async function getGitHubWorkflowStatusAction(limit = 15): Promise<{
  connected: boolean;
  repo: string;
  workflowFile: string;
  totalCount: number;
  runs: GitHubWorkflowRun[];
  error?: string;
}> {
  await requireAdminSession();

  const token = process.env.GITHUB_PAT;
  const repo = process.env.GITHUB_REPO || 'kpugi/kpugi';
  const workflowFile = 'scraper-cron.yml';

  if (!token) {
    return {
      connected: false,
      repo,
      workflowFile,
      totalCount: 0,
      runs: [],
      error: 'GITHUB_PAT environment variable is not configured.',
    };
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/runs?per_page=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Kpugi-Admin-CommandCenter',
        },
        next: { revalidate: 15 }, // cached for 15s
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        connected: false,
        repo,
        workflowFile,
        totalCount: 0,
        runs: [],
        error: `GitHub API error (HTTP ${res.status}): ${errText}`,
      };
    }

    const data = await res.json();
    const rawRuns = data.workflow_runs || [];

    const runs: GitHubWorkflowRun[] = rawRuns.map((r: any) => {
      let durationSeconds: number | null = null;
      if (r.created_at && r.updated_at && r.status === 'completed') {
        const start = new Date(r.created_at).getTime();
        const end = new Date(r.updated_at).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          durationSeconds = Math.round((end - start) / 1000);
        }
      }

      return {
        id: r.id,
        name: r.name || 'Automated Scraper',
        status: r.status,
        conclusion: r.conclusion,
        event: r.event,
        created_at: r.created_at,
        updated_at: r.updated_at,
        html_url: r.html_url,
        run_number: r.run_number,
        run_attempt: r.run_attempt || 1,
        head_branch: r.head_branch || 'main',
        head_sha: r.head_sha || '',
        commit_message: r.head_commit?.message || '',
        actor_login: r.actor?.login || 'github-actions',
        actor_avatar: r.actor?.avatar_url || '',
        duration_seconds: durationSeconds,
      };
    });

    return {
      connected: true,
      repo,
      workflowFile,
      totalCount: data.total_count || runs.length,
      runs,
    };
  } catch (err: any) {
    return {
      connected: false,
      repo,
      workflowFile,
      totalCount: 0,
      runs: [],
      error: err.message || 'Failed to connect to GitHub API.',
    };
  }
}

/**
 * dispatchGitHubWorkflowAction
 * Dispatches an on-demand scraper run via GitHub Actions workflow_dispatch
 */
export async function dispatchGitHubWorkflowAction(batchSize = 50, ref = 'main') {
  const { profileId: adminId } = await requireAdminSession();

  const token = process.env.GITHUB_PAT;
  const repo = process.env.GITHUB_REPO || 'kpugi/kpugi';
  const workflowFile = 'scraper-cron.yml';

  if (!token) {
    throw new Error('GITHUB_PAT is not configured in .env.local.');
  }

  const res = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Kpugi-Admin-CommandCenter',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref,
        inputs: {
          batch_size: String(batchSize),
        },
      }),
    }
  );

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to dispatch GitHub workflow (HTTP ${res.status}): ${errText}`);
  }

  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'scraper.github_workflow.dispatch',
    targetTable: 'system',
    targetId: workflowFile,
    details: `Admin dispatched GitHub Actions scraper workflow (batch_size=${batchSize}, ref=${ref})`,
    payload: {
      repo,
      workflowFile,
      batchSize,
      ref,
    },
  });

  revalidatePath('/admin/scraper');

  return {
    success: true,
    message: `GitHub Actions workflow dispatched successfully (Batch Size: ${batchSize}).`,
  };
}

/**
 * getApifyStatusAction
 * Queries live Apify account telemetry, actor health, and recent cloud runs
 */
export async function getApifyStatusAction(): Promise<ApifySystemStatus> {
  await requireAdminSession();

  const rawTokens = process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN || '';
  const token = rawTokens.split(',')[0]?.trim();
  const actorId = process.env.APIFY_INSTAGRAM_ACTOR || 'nH2AHrwxeTRJoN5hX';

  if (!token) {
    return {
      connected: false,
      actorId,
      recentRuns: [],
      error: 'APIFY_API_TOKENS environment variable is not configured.',
    };
  }

  try {
    const { ApifyClient } = await import('apify-client');
    const client = new ApifyClient({ token });

    const [userRes, actorRes, runsRes] = await Promise.allSettled([
      client.user().get(),
      client.actor(actorId).get(),
      client.actor(actorId).runs().list({ limit: 10 }),
    ]);

    const user = userRes.status === 'fulfilled' ? userRes.value : null;
    const actor = actorRes.status === 'fulfilled' ? actorRes.value : null;
    const runsList = runsRes.status === 'fulfilled' ? runsRes.value?.items || [] : [];

    const recentRuns: ApifyActorRunInfo[] = runsList.map((r: any) => {
      let durationSeconds: number | null = null;
      if (r.startedAt && r.finishedAt) {
        const start = new Date(r.startedAt).getTime();
        const end = new Date(r.finishedAt).getTime();
        if (!isNaN(start) && !isNaN(end)) {
          durationSeconds = Math.round((end - start) / 1000);
        }
      }

      return {
        id: r.id,
        actId: r.actId,
        status: r.status,
        startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : '',
        finishedAt: r.finishedAt ? new Date(r.finishedAt).toISOString() : null,
        durationSeconds,
        exitCode: r.exitCode ?? null,
      };
    });

    return {
      connected: true,
      username: user?.username || 'tuazor',
      email: user?.email || undefined,
      plan: (user as any)?.plan?.name || 'Pay-as-you-go',
      actorId,
      actorName: actor?.name || 'instagram-post-scraper',
      actorTitle: actor?.title || 'Instagram Post Scraper',
      recentRuns,
    };
  } catch (err: any) {
    return {
      connected: false,
      actorId,
      recentRuns: [],
      error: err.message || 'Failed to connect to Apify API.',
    };
  }
}

/**
 * testScrapePlaygroundAction
 * Real-time diagnostic test bench to scrape any post URL across extractors
 */
export async function testScrapePlaygroundAction(
  url: string,
  engine: 'auto' | 'apify' | 'fallback' = 'auto'
): Promise<{
  success: boolean;
  url: string;
  durationMs: number;
  engineUsed: string;
  data: any;
  error?: string;
}> {
  await requireAdminSession();

  if (!url || !url.trim().startsWith('http')) {
    throw new Error('Please enter a valid HTTP/HTTPS social post URL.');
  }

  const startTime = Date.now();

  try {
    const verifiedDetails = await extractPostForVerification(url.trim());
    const durationMs = Date.now() - startTime;

    return {
      success: verifiedDetails.reachable,
      url: url.trim(),
      durationMs,
      engineUsed: engine === 'apify' ? 'apify_instagram' : 'multi_tier_router',
      data: verifiedDetails,
      error: verifiedDetails.errorMessage || undefined,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      url: url.trim(),
      durationMs,
      engineUsed: engine,
      data: null,
      error: err.message || 'Scrape execution failed.',
    };
  }
}

/**
 * triggerGlobalBatchScrapeAction
 * Dispatches an on-demand scraper run (via GitHub Actions if configured, or internal cron)
 */
export async function triggerGlobalBatchScrapeAction() {
  const { profileId: adminId } = await requireAdminSession();

  const res = await triggerScraperRun();

  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'scraper.batch.manual_trigger',
    targetTable: 'system',
    targetId: 'global_audit',
    details: `Admin initiated global scraper batch via ${res.channel}: ${res.message}`,
    payload: {
      channel: res.channel,
      message: res.message,
    },
  });

  revalidatePath('/admin/scraper');

  return res;
}
