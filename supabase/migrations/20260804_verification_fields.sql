-- Migration: Add verification fields to social_accounts
-- Applied: 2026-08-04

ALTER TABLE social_accounts
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'failed')),
  ADD COLUMN IF NOT EXISTS verification_method TEXT
    CHECK (verification_method IN ('oauth', 'code_in_bio', 'post', 'manual')),
  ADD COLUMN IF NOT EXISTS verification_code TEXT,
  ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

CREATE INDEX IF NOT EXISTS idx_social_accounts_verification_status
  ON social_accounts(verification_status);

CREATE INDEX IF NOT EXISTS idx_social_accounts_verification_code
  ON social_accounts(verification_code)
  WHERE verification_code IS NOT NULL;

-- Mark existing OAuth-connected accounts as verified
UPDATE social_accounts
SET
  verification_status = 'verified',
  verification_method = 'oauth',
  verified_at = connected_at
WHERE oauth_access_token IS NOT NULL
  AND verification_status = 'unverified';
