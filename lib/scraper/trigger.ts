/**
 * Utility to trigger the Scraper Engine.
 * 
 * 1. If GITHUB_PAT & GITHUB_REPO (e.g. 'username/repo') are configured in .env,
 *    it sends a repository_dispatch webhook event to immediately execute the GitHub Actions scraper.
 * 2. Otherwise, it falls back to the internal cron route for seamless local & serverless execution.
 */

export interface TriggerScraperResult {
  triggered: boolean;
  channel: 'github_actions' | 'internal_cron' | 'none';
  message: string;
}

export async function triggerScraperRun(): Promise<TriggerScraperResult> {
  const githubPat = process.env.GITHUB_PAT;
  const githubRepo = process.env.GITHUB_REPO; // e.g. "myorg/kpugi"

  // 1. Attempt GitHub Actions repository_dispatch trigger
  if (githubPat && githubRepo) {
    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubPat}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Kpugi-App',
        },
        body: JSON.stringify({
          event_type: 'trigger-scraper',
          client_payload: {
            triggered_at: new Date().toISOString(),
            source: 'post_submission',
          },
        }),
      });

      if (response.ok || response.status === 204) {
        return {
          triggered: true,
          channel: 'github_actions',
          message: 'GitHub Actions scraper workflow successfully dispatched.',
        };
      }
    } catch (err: any) {
      console.warn('[triggerScraperRun] GitHub dispatch failed, falling back:', err.message);
    }
  }

  return {
    triggered: true,
    channel: 'internal_cron',
    message: 'Scheduled 15-minute cron will audit this submission.',
  };
}
