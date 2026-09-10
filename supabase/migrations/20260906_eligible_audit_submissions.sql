-- Migration: Per-post 60-minute audit cooldown with continuous checking for entire campaign life
-- Date: 2026-09-06 (Updated)
-- Submissions are audited continuously every 60 minutes as long as the campaign remains 'live'.
-- No 72-hour cutoff: posts continue to gain views and accrue earnings until campaign budget depletes or completes.

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
      -- 2. Recurring Audits: Last scraped at least 60 mins ago (continuous recurring checks for life of campaign)
      (s.last_scraped_at IS NOT NULL AND s.last_scraped_at <= (NOW() - INTERVAL '60 minutes'))
    )
  ORDER BY COALESCE(s.last_scraped_at, s.submitted_at) ASC
  LIMIT batch_limit;
$$;
