-- =========================================================
-- KPUGI USER GOVERNANCE & SUSPENSION SCHEMA
-- Migration: 20260921_user_suspension.sql
-- =========================================================

-- 1. Add account_status, suspended_reason, and suspended_at to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended')),
  ADD COLUMN IF NOT EXISTS suspended_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

-- 2. Index for efficient querying by account_status and role
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, account_status);
