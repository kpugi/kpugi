-- =========================================================
-- PAYMENT RECORDS LOOKUP ENHANCEMENT MIGRATION
-- Enhances payment_receipts to cover all payment types
-- and enables fast lookup by reference ID
-- =========================================================

-- 1. Add missing columns to payment_receipts
ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS transaction_type TEXT NOT NULL DEFAULT 'campaign_funding'
    CHECK (transaction_type IN ('campaign_funding', 'wallet_deposit', 'unspent_refund', 'payout_release')),
  ADD COLUMN IF NOT EXISTS advertiser_email TEXT,
  ADD COLUMN IF NOT EXISTS campaign_title TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. Index for fast lookup by paystack_reference (receipt_number already has UNIQUE constraint)
CREATE INDEX IF NOT EXISTS idx_payment_receipts_ref
  ON payment_receipts(paystack_reference);

-- 3. Index for fast lookup by issued_at for date-range queries
CREATE INDEX IF NOT EXISTS idx_payment_receipts_issued
  ON payment_receipts(issued_at DESC);
