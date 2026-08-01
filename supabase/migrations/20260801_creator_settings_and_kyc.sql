-- Migration: 20260801_creator_settings_and_kyc.sql
-- Add notification preferences, creator handle, and Didit KYC fields to creator_profiles

ALTER TABLE creator_profiles 
  ADD COLUMN IF NOT EXISTS creator_handle text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"notify_email": true, "notify_payouts": true, "notify_campaigns": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS kyc_didit_session_id text,
  ADD COLUMN IF NOT EXISTS kyc_verified_at timestamptz;

-- Index for handle lookup
CREATE INDEX IF NOT EXISTS idx_creator_profiles_handle ON creator_profiles(creator_handle);
