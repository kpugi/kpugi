-- =========================================================
-- KPUGI SECURITY HARDENING: ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20260901_enable_rls_security.sql
-- =========================================================

-- 1. Enable Row Level Security on all core tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS advertiser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaign_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS paystack_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing open/conflicting policies if any exist
DROP POLICY IF EXISTS "Public can view live campaigns" ON campaigns;
DROP POLICY IF EXISTS "Public can view creatives for live campaigns" ON campaign_creatives;
DROP POLICY IF EXISTS "Public can view public creator profiles" ON creator_profiles;
DROP POLICY IF EXISTS "Service role full access on profiles" ON profiles;
DROP POLICY IF EXISTS "Service role full access on wallets" ON wallets;
DROP POLICY IF EXISTS "Service role full access on wallet_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Service role full access on social_accounts" ON social_accounts;

-- 3. Define Explicit Least-Privilege Policies for Anon / Authenticated

-- CAMPAIGNS: Public read access for active catalogue campaigns
CREATE POLICY "Public can view live campaigns"
  ON campaigns
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('live', 'completed', 'budget_committed'));

-- CAMPAIGN CREATIVES: Public read access for creatives of visible campaigns
CREATE POLICY "Public can view creatives for live campaigns"
  ON campaign_creatives
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_creatives.campaign_id
        AND campaigns.status IN ('live', 'completed', 'budget_committed')
    )
  );

-- CREATOR PROFILES: Public read access for creator directory
CREATE POLICY "Public can view creator public bio"
  ON creator_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. Financial & High-Risk Tables: Default Deny for Anon / Public
-- Note: 'wallets', 'wallet_transactions', 'paystack_events', 'social_accounts' (tokens),
-- 'verification_checks', 'notifications', and 'advertiser_profiles' have NO public policies,
-- which means direct client-side PostgREST requests from unauthorized users will be rejected with 403 / empty set.
-- All legitimate backend mutations and queries run via createAdminClient() (SUPABASE_SERVICE_ROLE_KEY).
