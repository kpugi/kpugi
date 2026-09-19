-- =========================================================
-- KPUGI ADMIN CONSOLE: Phase A — DB-Level RBAC + Audit Log
-- Migration: 20260919_admin_and_audit.sql
-- =========================================================

-- -------------------------------------------------------
-- 1. Admin flag on profiles
-- -------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- -------------------------------------------------------
-- 2. Hero slider explicit pin on campaigns
--    is_featured  = appears on floor grid with Featured badge
--    is_hero_pinned = explicitly placed in the 5-slot hero slider
-- -------------------------------------------------------
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_hero_pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- -------------------------------------------------------
-- 3. RBAC helper functions
--    These run inside Postgres on every user-scoped query.
--    Marked STABLE so Postgres caches the result per query — 
--    called once per statement, NOT once per row.
-- -------------------------------------------------------

-- Resolve the profiles.id UUID from the Clerk 'sub' claim in the JWT
CREATE OR REPLACE FUNCTION get_profile_id()
RETURNS uuid AS $$
  SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if the current JWT user is an admin (live DB check — not JWT claim)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get the role string of the current JWT user
CREATE OR REPLACE FUNCTION get_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -------------------------------------------------------
-- 4. Platform-wide audit log
--    Append-only. NEVER UPDATE or DELETE rows.
--    Covers: creator, advertiser, admin, and system/cron actions.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL = system/cron
  actor_role    TEXT NOT NULL CHECK (actor_role IN ('creator', 'advertiser', 'admin', 'system')),
  action        TEXT NOT NULL,  -- e.g. 'campaign.featured.toggle', 'submission.status.override'
  target_table  TEXT,           -- e.g. 'campaigns', 'submissions', 'profiles'
  target_id     UUID,           -- the affected row's primary key
  payload       JSONB,          -- { before: {...}, after: {...} } or relevant context
  ip_address    TEXT,           -- best-effort from x-forwarded-for header
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_log_profile   ON audit_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_target    ON audit_log(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action    ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created   ON audit_log(created_at DESC);

-- -------------------------------------------------------
-- 5. Admin RLS policies
--    These are ADDITIVE — existing public/user policies remain.
--    is_admin() = true grants full read+write access to all tables.
-- -------------------------------------------------------

-- Drop existing admin policies if re-running this migration
DROP POLICY IF EXISTS "Admin: read all campaigns"           ON campaigns;
DROP POLICY IF EXISTS "Admin: write all campaigns"          ON campaigns;
DROP POLICY IF EXISTS "Admin: read all submissions"         ON submissions;
DROP POLICY IF EXISTS "Admin: write all submissions"        ON submissions;
DROP POLICY IF EXISTS "Admin: read all profiles"            ON profiles;
DROP POLICY IF EXISTS "Admin: write all profiles"           ON profiles;
DROP POLICY IF EXISTS "Admin: read all advertiser_profiles" ON advertiser_profiles;
DROP POLICY IF EXISTS "Admin: read all creator_profiles"    ON creator_profiles;
DROP POLICY IF EXISTS "Admin: write creator_profiles"       ON creator_profiles;
DROP POLICY IF EXISTS "Admin: read all wallets"             ON wallets;
DROP POLICY IF EXISTS "Admin: read all wallet_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admin: read all social_accounts"     ON social_accounts;
DROP POLICY IF EXISTS "Admin: read all verification_checks" ON verification_checks;
DROP POLICY IF EXISTS "Admin: read all notifications"       ON notifications;
DROP POLICY IF EXISTS "Admin: read audit_log"               ON audit_log;

-- CAMPAIGNS
CREATE POLICY "Admin: read all campaigns"
  ON campaigns FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admin: write all campaigns"
  ON campaigns FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- SUBMISSIONS
CREATE POLICY "Admin: read all submissions"
  ON submissions FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admin: write all submissions"
  ON submissions FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- PROFILES
CREATE POLICY "Admin: read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admin: write all profiles"
  ON profiles FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ADVERTISER PROFILES
CREATE POLICY "Admin: read all advertiser_profiles"
  ON advertiser_profiles FOR SELECT TO authenticated
  USING (is_admin());

-- CREATOR PROFILES
CREATE POLICY "Admin: read all creator_profiles"
  ON creator_profiles FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admin: write creator_profiles"
  ON creator_profiles FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- WALLETS
CREATE POLICY "Admin: read all wallets"
  ON wallets FOR SELECT TO authenticated
  USING (is_admin());

-- WALLET TRANSACTIONS
CREATE POLICY "Admin: read all wallet_transactions"
  ON wallet_transactions FOR SELECT TO authenticated
  USING (is_admin());

-- SOCIAL ACCOUNTS
CREATE POLICY "Admin: read all social_accounts"
  ON social_accounts FOR SELECT TO authenticated
  USING (is_admin());

-- VERIFICATION CHECKS
CREATE POLICY "Admin: read all verification_checks"
  ON verification_checks FOR SELECT TO authenticated
  USING (is_admin());

-- NOTIFICATIONS
CREATE POLICY "Admin: read all notifications"
  ON notifications FOR SELECT TO authenticated
  USING (is_admin());

-- AUDIT LOG: only admins can read; writes are service-role only (bypasses RLS)
CREATE POLICY "Admin: read audit_log"
  ON audit_log FOR SELECT TO authenticated
  USING (is_admin());
