-- ==============================================================================
-- Migration: Platform Perks, Freebies & Challenges Hub
-- Date: 2026-09-26
-- Description: Unified incentives system for creator-facing perks deployed by admin.
--              Covers challenges, coupons, software deals, freebies, and bonuses.
-- ==============================================================================

-- ── 1. platform_perks ─────────────────────────────────────────────────────────
-- Central catalog of all freebies, challenges, coupons, and partner perks.

CREATE TABLE IF NOT EXISTS platform_perks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  slug            TEXT        UNIQUE NOT NULL,
  description     TEXT        NOT NULL,
  perk_type       TEXT        NOT NULL CHECK (perk_type IN ('challenge', 'coupon', 'software_deal', 'freebie', 'bonus')),
  category        TEXT        NOT NULL DEFAULT 'general',
    -- 'editing_tools' | 'music' | 'cash_bounty' | 'gear' | 'digital_assets' | 'fintech' | 'referral' | 'courses' | 'general'

  -- Visual Presentation
  cover_image_url TEXT        NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  theme_color     TEXT        DEFAULT 'indigo',
    -- 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose'

  -- Reward & Offer Details
  reward_type     TEXT        NOT NULL CHECK (reward_type IN ('cash_wallet', 'coupon_discount', 'free_license', 'merch_gift', 'custom')),
  reward_amount   NUMERIC     DEFAULT 0,        -- Cash amount in Naira (for challenges/bonuses)
  coupon_code     TEXT,                         -- Copyable discount/promo code
  affiliate_url   TEXT,                         -- External link (SaaS, partner deal, tool)
  has_affiliate_disclaimer BOOLEAN DEFAULT FALSE, -- Shows subtle "(i) Partner deal" badge

  -- Eligibility & Quota
  min_creator_level INTEGER   DEFAULT 1 CHECK (min_creator_level BETWEEN 1 AND 14),
  requires_proof    BOOLEAN   DEFAULT FALSE,
  proof_instructions TEXT,
  total_quota       INTEGER,                    -- NULL = unlimited
  claimed_count     INTEGER   DEFAULT 0,
  savings_value     TEXT,                       -- Human-readable e.g. "Worth ₦29,000"
  partner_name      TEXT,                       -- Brand or partner name

  -- Status & Scheduling
  status          TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'paused', 'expired')),
  start_at        TIMESTAMPTZ DEFAULT NOW(),
  end_at          TIMESTAMPTZ,
  created_by      UUID        REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_perks_status    ON platform_perks(status);
CREATE INDEX IF NOT EXISTS idx_platform_perks_type      ON platform_perks(perk_type);
CREATE INDEX IF NOT EXISTS idx_platform_perks_min_level ON platform_perks(min_creator_level);
CREATE INDEX IF NOT EXISTS idx_platform_perks_end_at    ON platform_perks(end_at);

-- ── 2. platform_perk_claims ───────────────────────────────────────────────────
-- Tracks creator participation, proof submissions, review decisions, and payouts.

CREATE TABLE IF NOT EXISTS platform_perk_claims (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  perk_id         UUID        NOT NULL REFERENCES platform_perks(id) ON DELETE CASCADE,
  creator_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  status          TEXT        NOT NULL DEFAULT 'unlocked' CHECK (status IN ('unlocked', 'submitted', 'approved', 'rejected')),

  -- Manual Proof Submission
  proof_url       TEXT,                         -- TikTok, Instagram, YouTube, X post URL
  proof_notes     TEXT,                         -- Creator commentary / context
  submitted_at    TIMESTAMPTZ,

  -- Admin Review & Audit
  reviewed_by     UUID        REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  admin_notes     TEXT,                         -- Feedback or rejection reason

  -- Automated Wallet Payout
  reward_paid     BOOLEAN     DEFAULT FALSE,
  wallet_transaction_id UUID  REFERENCES wallet_transactions(id),

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(perk_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_perk_claims_creator  ON platform_perk_claims(creator_id);
CREATE INDEX IF NOT EXISTS idx_perk_claims_perk     ON platform_perk_claims(perk_id);
CREATE INDEX IF NOT EXISTS idx_perk_claims_status   ON platform_perk_claims(status);

-- ── 3. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE platform_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_perk_claims ENABLE ROW LEVEL SECURITY;

-- Perks: any authenticated user can read active perks
CREATE POLICY "perks_public_read" ON platform_perks
  FOR SELECT USING (status = 'active');

-- Perks: admins have full access (is_admin flag on profiles)
CREATE POLICY "perks_admin_all" ON platform_perks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- Claims: creators can read and insert their own claims
CREATE POLICY "claims_creator_read" ON platform_perk_claims
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "claims_creator_insert" ON platform_perk_claims
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "claims_creator_update_own" ON platform_perk_claims
  FOR UPDATE USING (creator_id = auth.uid() AND status = 'unlocked');

-- Claims: admins have full access
CREATE POLICY "claims_admin_all" ON platform_perk_claims
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- ── 4. Atomic Perk Claim Approval Function ────────────────────────────────────
-- ACID transaction: credits wallet, records ledger transaction, marks claim approved.
-- Uses row-level locking to prevent duplicate payouts.

CREATE OR REPLACE FUNCTION atomic_approve_perk_claim(
  p_claim_id   UUID,
  p_admin_id   UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim  platform_perk_claims%ROWTYPE;
  v_perk   platform_perks%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_wallet_type TEXT := 'creator_earnings';
  v_new_balance NUMERIC;
  v_tx_id  UUID;
  v_ref    TEXT;
BEGIN
  -- 1. Lock claim row to prevent concurrent duplicate approval
  SELECT * INTO v_claim
  FROM platform_perk_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim record not found');
  END IF;

  IF v_claim.status = 'approved' AND v_claim.reward_paid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim already approved and credited');
  END IF;

  -- 2. Fetch perk details
  SELECT * INTO v_perk
  FROM platform_perks
  WHERE id = v_claim.perk_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Perk not found');
  END IF;

  -- 3. Determine user role and corresponding wallet type
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = v_claim.creator_id;

  IF v_profile.role = 'advertiser' THEN
    v_wallet_type := 'advertiser_funding';
  ELSE
    v_wallet_type := 'creator_earnings';
  END IF;

  -- 4. If cash reward, credit the user's wallet atomically
  IF v_perk.reward_type = 'cash_wallet' AND COALESCE(v_perk.reward_amount, 0) > 0 THEN
    SELECT * INTO v_wallet
    FROM wallets
    WHERE profile_id = v_claim.creator_id AND wallet_type = v_wallet_type
    FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO wallets (profile_id, wallet_type, balance)
      VALUES (v_claim.creator_id, v_wallet_type, 0)
      RETURNING * INTO v_wallet;
    END IF;

    v_new_balance := COALESCE(v_wallet.balance, 0) + v_perk.reward_amount;

    UPDATE wallets
    SET balance = v_new_balance
    WHERE id = v_wallet.id;

    v_ref := 'KPG-BONUS-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));

    INSERT INTO wallet_transactions (
      wallet_id,
      type,
      amount,
      gross_amount,
      net_amount,
      paystack_reference,
      status,
      created_at
    ) VALUES (
      v_wallet.id,
      'bonus_credit',
      v_perk.reward_amount,
      v_perk.reward_amount,
      v_perk.reward_amount,
      v_ref,
      'completed',
      NOW()
    ) RETURNING id INTO v_tx_id;
  END IF;

  -- 4. Update claim status
  UPDATE platform_perk_claims
  SET status               = 'approved',
      reward_paid          = (v_perk.reward_type = 'cash_wallet'),
      wallet_transaction_id = v_tx_id,
      reviewed_by          = p_admin_id,
      reviewed_at          = NOW(),
      admin_notes          = p_admin_notes,
      updated_at           = NOW()
  WHERE id = v_claim.id;

  -- 5. Increment claimed_count on perk
  UPDATE platform_perks
  SET claimed_count = COALESCE(claimed_count, 0) + 1,
      updated_at    = NOW()
  WHERE id = v_perk.id;

  RETURN jsonb_build_object(
    'success',        true,
    'claim_id',       v_claim.id,
    'reward_amount',  v_perk.reward_amount,
    'new_balance',    v_new_balance,
    'tx_reference',   v_ref
  );
END;
$$;

-- ── 5. Reject Perk Claim Function ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reject_perk_claim(
  p_claim_id    UUID,
  p_admin_id    UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim platform_perk_claims%ROWTYPE;
BEGIN
  SELECT * INTO v_claim
  FROM platform_perk_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim not found');
  END IF;

  IF v_claim.status = 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot reject an already approved claim');
  END IF;

  UPDATE platform_perk_claims
  SET status       = 'rejected',
      reviewed_by  = p_admin_id,
      reviewed_at  = NOW(),
      admin_notes  = p_admin_notes,
      updated_at   = NOW()
  WHERE id = v_claim.id;

  RETURN jsonb_build_object('success', true, 'claim_id', v_claim.id);
END;
$$;

-- ── 6. Updated_at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at_platform_perks()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_platform_perks_updated_at ON platform_perks;
CREATE TRIGGER trg_platform_perks_updated_at
  BEFORE UPDATE ON platform_perks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_platform_perks();

DROP TRIGGER IF EXISTS trg_perk_claims_updated_at ON platform_perk_claims;
CREATE TRIGGER trg_perk_claims_updated_at
  BEFORE UPDATE ON platform_perk_claims
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_platform_perks();
