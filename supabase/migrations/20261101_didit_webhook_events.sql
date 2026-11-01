-- ==============================================================================
-- Migration: 20261101_didit_webhook_events.sql
-- Didit Webhook Events Store & Identity Verification Audit
-- ==============================================================================

CREATE TABLE IF NOT EXISTS didit_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE,
  session_id TEXT,
  business_session_id TEXT,
  session_kind TEXT,
  webhook_type TEXT NOT NULL,
  status TEXT,
  vendor_data TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT TRUE,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_didit_webhook_events_event_id ON didit_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_didit_webhook_events_session_id ON didit_webhook_events(session_id);
CREATE INDEX IF NOT EXISTS idx_didit_webhook_events_vendor_data ON didit_webhook_events(vendor_data);

-- Enable RLS for didit_webhook_events
ALTER TABLE didit_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read all didit_webhook_events"
  ON didit_webhook_events FOR SELECT TO authenticated
  USING (
    COALESCE(
      (SELECT is_admin FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')),
      false
    )
  );

-- Add optional decision columns to creator_profiles if they do not exist
ALTER TABLE creator_profiles
  ADD COLUMN IF NOT EXISTS kyc_decision JSONB,
  ADD COLUMN IF NOT EXISTS kyc_decision_warnings JSONB;

