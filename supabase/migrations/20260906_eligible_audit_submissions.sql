-- Migration: Per-post 60-minute audit cooldown and 72-hour lifecycle query function
-- Date: 2026-09-06
-- Updated: Require parent campaign status = 'live' so completed/archived campaigns are never scraped

CREATE OR REPLACE FUNCTION get_due_submissions(batch_limit int DEFAULT 50)
RETURNS SETOF submissions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT s.* 
  FROM submissions s
  INNER JOIN campaigns c ON c.id = s.campaign_id
  WHERE s.post_url IS NOT NULL
    AND c.status = 'live'
    AND s.status IN ('pending', 'verified_pass')
    AND (
      -- 1. Initial Audit: Brand new submission waiting for 1st audit (at least 60 mins organic growth)
      (s.last_scraped_at IS NULL AND s.submitted_at <= (NOW() - INTERVAL '60 minutes'))
      OR
      -- 2. Recurring Audits: Last scraped at least 60 mins ago AND still within the 72-hour retention window
      (s.last_scraped_at IS NOT NULL 
       AND s.last_scraped_at <= (NOW() - INTERVAL '60 minutes')
       AND s.submitted_at > (NOW() - INTERVAL '72 hours'))
      OR
      -- 3. Final 72-Hour Settlement Audit: Post reached 72h mark, but has not had its final 72h audit yet
      (s.submitted_at <= (NOW() - INTERVAL '72 hours')
       AND (s.last_scraped_at IS NULL OR s.last_scraped_at < (s.submitted_at + INTERVAL '72 hours')))
    )
  ORDER BY COALESCE(s.last_scraped_at, s.submitted_at) ASC
  LIMIT batch_limit;
$$;
