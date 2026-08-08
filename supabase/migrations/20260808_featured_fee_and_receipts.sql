-- =========================================================
-- FEATURED FEE & PAYMENT RECEIPTS SCHEMA MIGRATION
-- =========================================================

-- 1. Add featured_fee column to campaigns table
ALTER TABLE campaigns 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS featured_fee NUMERIC(10,2) DEFAULT 0.00;

-- 2. Create payment_receipts table for checkout receipts & invoicing
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  advertiser_id UUID NOT NULL REFERENCES advertiser_profiles(profile_id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  total_amount NUMERIC(14,2) NOT NULL,
  escrow_budget NUMERIC(14,2) NOT NULL,
  featured_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paystack', 'wallet')),
  paystack_reference TEXT,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by advertiser or campaign
CREATE INDEX IF NOT EXISTS idx_payment_receipts_advertiser ON payment_receipts(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_campaign ON payment_receipts(campaign_id);
