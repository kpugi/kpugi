-- ==============================================================================
-- Migration: Bachs.io Payment Gateway Integration & Multi-Processor Schema
-- Date: 2026-10-28
-- ==============================================================================

-- 1. BACHS WEBHOOK EVENT AUDIT LOG
CREATE TABLE IF NOT EXISTS bachs_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  reference text,
  session_id text,
  payload jsonb,
  processed boolean DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bachs_events_reference ON bachs_events(reference);
CREATE INDEX IF NOT EXISTS idx_bachs_events_session ON bachs_events(session_id);

-- Enable RLS for bachs_events (service-role only)
ALTER TABLE bachs_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to bachs_events"
  ON bachs_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 2. ADD BACHS DESTINATION COLUMN TO CREATOR PROFILES
ALTER TABLE creator_profiles 
ADD COLUMN IF NOT EXISTS bachs_destination_id text;

-- 3. ADD GENERIC PROCESSOR_REFERENCE TO TRANSACTIONS AND RECEIPTS
ALTER TABLE wallet_transactions 
ADD COLUMN IF NOT EXISTS processor_reference text;

ALTER TABLE payment_receipts 
ADD COLUMN IF NOT EXISTS processor_reference text;

-- 4. BACKFILL PROCESSOR_REFERENCE FROM EXISTING PAYSTACK_REFERENCE
UPDATE wallet_transactions
SET processor_reference = paystack_reference
WHERE processor_reference IS NULL AND paystack_reference IS NOT NULL;

UPDATE payment_receipts
SET processor_reference = paystack_reference
WHERE processor_reference IS NULL AND paystack_reference IS NOT NULL;

