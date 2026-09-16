-- ==============================================================================
-- Migration: Atomic Advertiser & Creator Wallet Operations (Race Condition Hardening)
-- Date: 2026-09-16
-- ==============================================================================

-- 1. ATOMIC DEDUCTION FOR ADVERTISER CAMPAIGN BUDGET
-- Locks the advertiser wallet row, verifies available funds, deducts budget,
-- and records the budget reservation ledger transaction in a single atomic transaction.
CREATE OR REPLACE FUNCTION atomic_deduct_advertiser_budget(
  p_profile_id uuid,
  p_amount numeric,
  p_reference text,
  p_campaign_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_new_balance numeric;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Deduction amount must be positive');
  END IF;

  -- Row-level lock on advertiser wallet
  SELECT * INTO v_wallet
  FROM wallets
  WHERE profile_id = p_profile_id AND wallet_type = 'advertiser_funding'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Advertiser wallet not found');
  END IF;

  IF v_wallet.balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient available balance. You have ₦' || TO_CHAR(v_wallet.balance, 'FM999,999,990.00') || ' available but this campaign requires ₦' || TO_CHAR(p_amount, 'FM999,999,990.00') || '.'
    );
  END IF;

  v_new_balance := v_wallet.balance - p_amount;

  UPDATE wallets
  SET balance = v_new_balance
  WHERE id = v_wallet.id;

  INSERT INTO wallet_transactions (
    wallet_id,
    type,
    amount,
    campaign_id,
    paystack_reference,
    status,
    created_at
  ) VALUES (
    v_wallet.id,
    'budget_reservation',
    -p_amount,
    p_campaign_id,
    p_reference,
    'completed',
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'wallet_id', v_wallet.id,
    'new_balance', v_new_balance,
    'reference', p_reference
  );
END;
$$;

-- 2. ATOMIC DEPOSIT FOR ADVERTISER WALLET (IDEMPOTENT TOP-UP)
-- Ensures duplicate Paystack webhook deliveries or concurrent client verification
-- calls cannot credit the wallet more than once for the same transaction reference.
CREATE OR REPLACE FUNCTION atomic_deposit_advertiser_wallet(
  p_profile_id uuid,
  p_amount numeric,
  p_reference text,
  p_receipt_number text DEFAULT NULL,
  p_advertiser_email text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_tx wallet_transactions%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_new_balance numeric;
  v_receipt_num text;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Deposit amount must be positive');
  END IF;

  -- 1. Idempotency check: verify if reference was already credited
  SELECT * INTO v_existing_tx
  FROM wallet_transactions
  WHERE paystack_reference = p_reference
    AND type = 'deposit'
    AND status = 'completed'
  LIMIT 1;

  IF FOUND THEN
    -- Already credited; fetch current balance and return safely
    SELECT balance INTO v_new_balance
    FROM wallets
    WHERE id = v_existing_tx.wallet_id;

    RETURN jsonb_build_object(
      'success', true,
      'already_processed', true,
      'amount', v_existing_tx.amount,
      'new_balance', v_new_balance,
      'reference', p_reference
    );
  END IF;

  -- 2. Lock or create advertiser funding wallet
  SELECT * INTO v_wallet
  FROM wallets
  WHERE profile_id = p_profile_id AND wallet_type = 'advertiser_funding'
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (profile_id, wallet_type, balance)
    VALUES (p_profile_id, 'advertiser_funding', 0)
    RETURNING * INTO v_wallet;
  END IF;

  -- 3. Atomic balance increment
  v_new_balance := COALESCE(v_wallet.balance, 0) + p_amount;

  UPDATE wallets
  SET balance = v_new_balance
  WHERE id = v_wallet.id;

  -- 4. Record ledger transaction
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
    'deposit',
    p_amount,
    p_amount,
    p_amount,
    p_reference,
    'completed',
    NOW()
  );

  -- 5. Write or update payment receipts record
  v_receipt_num := COALESCE(
    p_receipt_number,
    CASE
      WHEN p_reference LIKE 'KPG-PAY-%' THEN p_reference
      ELSE 'KPG-PAY-' || UPPER(SUBSTRING(p_reference FROM LENGTH(p_reference) - 4 FOR 5))
    END
  );

  INSERT INTO payment_receipts (
    receipt_number,
    advertiser_id,
    total_amount,
    escrow_budget,
    featured_fee,
    is_featured,
    payment_method,
    paystack_reference,
    transaction_type,
    advertiser_email,
    notes,
    created_at
  ) VALUES (
    v_receipt_num,
    p_profile_id,
    p_amount,
    p_amount,
    0,
    false,
    'paystack',
    p_reference,
    'wallet_deposit',
    p_advertiser_email,
    COALESCE(p_notes, 'Paystack wallet top-up verified atomically'),
    NOW()
  )
  ON CONFLICT (receipt_number) DO UPDATE
  SET status = 'completed',
      paystack_reference = EXCLUDED.paystack_reference;

  RETURN jsonb_build_object(
    'success', true,
    'already_processed', false,
    'amount', p_amount,
    'new_balance', v_new_balance,
    'reference', p_reference,
    'receipt_number', v_receipt_num
  );
END;
$$;

-- 3. ATOMIC REFUND OF UNSPENT CAMPAIGN BUDGET
CREATE OR REPLACE FUNCTION atomic_refund_campaign_budget(
  p_profile_id uuid,
  p_campaign_id uuid,
  p_refund_amount numeric,
  p_reference text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_new_balance numeric;
BEGIN
  IF p_refund_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Refund amount must be positive');
  END IF;

  -- Row-level lock on advertiser wallet
  SELECT * INTO v_wallet
  FROM wallets
  WHERE profile_id = p_profile_id AND wallet_type = 'advertiser_funding'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Advertiser wallet not found');
  END IF;

  v_new_balance := COALESCE(v_wallet.balance, 0) + p_refund_amount;

  UPDATE wallets
  SET balance = v_new_balance
  WHERE id = v_wallet.id;

  INSERT INTO wallet_transactions (
    wallet_id,
    type,
    amount,
    campaign_id,
    paystack_reference,
    status,
    created_at
  ) VALUES (
    v_wallet.id,
    'budget_release_refund',
    p_refund_amount,
    p_campaign_id,
    p_reference,
    'completed',
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'refund_amount', p_refund_amount
  );
END;
$$;

-- 4. ATOMIC SUBMISSION PAYOUT RELEASE (CRON & AUTOMATION)
-- Credits creator wallet atomically and deducts pending amount from submission.
CREATE OR REPLACE FUNCTION atomic_release_submission_payout(
  p_submission_id uuid,
  p_reference text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub submissions%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_payout numeric;
  v_new_balance numeric;
BEGIN
  -- Row lock submission
  SELECT * INTO v_sub
  FROM submissions
  WHERE id = p_submission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Submission not found');
  END IF;

  v_payout := COALESCE(v_sub.pending_payout_amount, 0);
  IF v_payout <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No pending payout amount on submission');
  END IF;

  -- Row lock creator earnings wallet
  SELECT * INTO v_wallet
  FROM wallets
  WHERE profile_id = v_sub.creator_id AND wallet_type = 'creator_earnings'
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (profile_id, wallet_type, balance)
    VALUES (v_sub.creator_id, 'creator_earnings', 0)
    RETURNING * INTO v_wallet;
  END IF;

  v_new_balance := COALESCE(v_wallet.balance, 0) + v_payout;

  UPDATE wallets
  SET balance = v_new_balance
  WHERE id = v_wallet.id;

  INSERT INTO wallet_transactions (
    wallet_id,
    type,
    amount,
    gross_amount,
    net_amount,
    campaign_id,
    submission_id,
    paystack_reference,
    status,
    created_at
  ) VALUES (
    v_wallet.id,
    'payout_release',
    v_payout,
    v_payout,
    v_payout,
    v_sub.campaign_id,
    p_submission_id,
    p_reference,
    'completed',
    NOW()
  );

  -- Zero out pending payout amount and mark as verified_pass if not already
  UPDATE submissions
  SET
    pending_payout_amount = 0,
    payout_amount = COALESCE(payout_amount, 0) + v_payout,
    status = CASE WHEN status = 'pending_verification' THEN 'verified_pass' ELSE status END,
    verified_at = NOW()
  WHERE id = p_submission_id;

  -- Update creator profile total_earned
  UPDATE creator_profiles
  SET total_earned = COALESCE(total_earned, 0) + v_payout
  WHERE profile_id = v_sub.creator_id;

  RETURN jsonb_build_object(
    'success', true,
    'payout_amount', v_payout,
    'new_balance', v_new_balance,
    'creator_id', v_sub.creator_id
  );
END;
$$;
