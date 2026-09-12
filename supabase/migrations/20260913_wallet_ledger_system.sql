-- ==============================================================================
-- Migration: Atomic Double-Entry Wallet Ledger & Campaign Settlement System
-- Date: 2026-09-13
-- ==============================================================================

-- 1. ENHANCE WALLET_TRANSACTIONS SCHEMA
ALTER TABLE IF EXISTS wallet_transactions
  ADD COLUMN IF NOT EXISTS gross_amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS fee_amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS net_amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS views_audited integer,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS clears_at timestamptz;

-- Update the type check constraint to accommodate all supported transaction types
DO $$
BEGIN
  ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
  ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check
    CHECK (type IN (
      'campaign_funding',
      'budget_reservation',
      'budget_release_refund',
      'payout_release',
      'campaign_payout',
      'commission_deduction',
      'withdrawal',
      'deposit'
    ));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. ATOMIC SETTLEMENT FOR COMPLETED CAMPAIGNS
-- Called when a campaign concludes (via budget depletion, end date, or brand completion).
-- Calculates gross, deducts 10% platform fee, credits net to creator wallet, and guarantees
-- exactly ONE consolidated transaction per creator per campaign.
CREATE OR REPLACE FUNCTION atomic_settle_completed_campaign(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign campaigns%ROWTYPE;
  v_sub RECORD;
  v_wallet wallets%ROWTYPE;
  v_views integer;
  v_cpm numeric;
  v_gross numeric;
  v_fee numeric;
  v_net numeric;
  v_cap numeric;
  v_settled_count integer := 0;
  v_total_net numeric := 0;
  v_total_gross numeric := 0;
  v_total_fees numeric := 0;
  v_tx_id uuid;
  v_ref text;
BEGIN
  -- Lock the campaign row
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Campaign not found');
  END IF;

  -- Gross 25% creator pool cap based on campaign total budget
  IF v_campaign.total_budget > 0 THEN
    v_cap := v_campaign.total_budget * 0.25;
  ELSE
    v_cap := 999999999;
  END IF;

  v_cpm := COALESCE(v_campaign.cpm_rate, 0);

  -- Loop over each verified creator submission for this campaign
  FOR v_sub IN
    SELECT s.id, s.creator_id, s.final_view_count, s.payout_amount, s.status
    FROM submissions s
    WHERE s.campaign_id = p_campaign_id
      AND s.status NOT IN ('verified_fail', 'rejected')
      AND COALESCE(s.final_view_count, 0) >= COALESCE(v_campaign.min_view_threshold, 1000)
    FOR UPDATE
  LOOP
    v_views := COALESCE(v_sub.final_view_count, 0);
    
    -- Calculate raw gross: (views / 1000) * CPM
    v_gross := ROUND((v_views::numeric / 1000.0) * v_cpm);
    
    -- Enforce 25% gross cap per creator
    IF v_gross > v_cap THEN
      v_gross := v_cap;
    END IF;

    -- Calculate 10% Kpugi Platform Fee
    v_fee := ROUND(v_gross * 0.10);
    
    -- Calculate Net Payout (90% take-home)
    v_net := v_gross - v_fee;

    -- Find or create creator wallet
    SELECT * INTO v_wallet
    FROM wallets
    WHERE profile_id = v_sub.creator_id AND wallet_type = 'creator_earnings'
    FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO wallets (profile_id, wallet_type, balance)
      VALUES (v_sub.creator_id, 'creator_earnings', 0)
      RETURNING * INTO v_wallet;
    END IF;

    -- Look for existing payout transaction for this campaign and wallet
    SELECT id INTO v_tx_id
    FROM wallet_transactions
    WHERE wallet_id = v_wallet.id
      AND campaign_id = p_campaign_id
      AND type IN ('campaign_payout', 'payout_release')
    LIMIT 1;

    v_ref := 'KP-CMP-' || UPPER(SUBSTRING(p_campaign_id::text FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(v_sub.id::text FROM 1 FOR 4));

    IF v_tx_id IS NOT NULL THEN
      -- Update existing transaction to final single consolidated settlement
      UPDATE wallet_transactions
      SET
        type = 'payout_release',
        amount = v_net,
        gross_amount = v_gross,
        fee_amount = v_fee,
        net_amount = v_net,
        views_audited = v_views,
        status = 'completed',
        submission_id = v_sub.id,
        paystack_reference = v_ref
      WHERE id = v_tx_id;

      -- Remove any duplicate/legacy micro-batches for this same campaign in this wallet
      DELETE FROM wallet_transactions
      WHERE wallet_id = v_wallet.id
        AND campaign_id = p_campaign_id
        AND type IN ('campaign_payout', 'payout_release')
        AND id <> v_tx_id;
    ELSE
      -- Insert 1 clean single consolidated transaction
      INSERT INTO wallet_transactions (
        wallet_id,
        type,
        amount,
        gross_amount,
        fee_amount,
        net_amount,
        views_audited,
        campaign_id,
        submission_id,
        status,
        paystack_reference,
        created_at
      ) VALUES (
        v_wallet.id,
        'payout_release',
        v_net,
        v_gross,
        v_fee,
        v_net,
        v_views,
        p_campaign_id,
        v_sub.id,
        'completed',
        v_ref,
        NOW()
      );
    END IF;

    -- Update submission record with net payout
    UPDATE submissions
    SET
      payout_amount = v_net,
      pending_payout_amount = 0,
      status = 'verified_pass',
      verified_at = NOW()
    WHERE id = v_sub.id;

    -- Recompute wallet balance atomically from its completed transactions
    UPDATE wallets
    SET balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM wallet_transactions
      WHERE wallet_id = v_wallet.id AND status = 'completed'
    )
    WHERE id = v_wallet.id;

    -- Update creator total_earned (sum of positive completed credits)
    UPDATE creator_profiles
    SET total_earned = (
      SELECT COALESCE(SUM(amount), 0)
      FROM wallet_transactions
      WHERE wallet_id = v_wallet.id AND status = 'completed' AND amount > 0
    )
    WHERE profile_id = v_sub.creator_id;

    v_settled_count := v_settled_count + 1;
    v_total_net := v_total_net + v_net;
    v_total_gross := v_total_gross + v_gross;
    v_total_fees := v_total_fees + v_fee;
  END LOOP;

  -- Ensure campaign is marked as completed with final spent budget
  UPDATE campaigns
  SET
    status = 'completed',
    spent_budget = GREATEST(COALESCE(spent_budget, 0), v_total_gross),
    updated_at = NOW()
  WHERE id = p_campaign_id;

  RETURN jsonb_build_object(
    'success', true,
    'settled_creators_count', v_settled_count,
    'total_gross', v_total_gross,
    'total_fees', v_total_fees,
    'total_net_settled', v_total_net
  );
END;
$$;

-- 3. ATOMIC WITHDRAWAL REQUEST
-- Row-locks the creator wallet, verifies balance >= requested amount, deducts balance,
-- and records the withdrawal ledger transaction and payout request.
CREATE OR REPLACE FUNCTION atomic_request_withdrawal(
  p_profile_id uuid,
  p_amount numeric,
  p_reference text,
  p_bank_name text DEFAULT NULL,
  p_account_number text DEFAULT NULL,
  p_account_name text DEFAULT NULL
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
    RETURN jsonb_build_object('success', false, 'error', 'Withdrawal amount must be greater than zero');
  END IF;

  -- Lock wallet row
  SELECT * INTO v_wallet
  FROM wallets
  WHERE profile_id = p_profile_id AND wallet_type = 'creator_earnings'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Creator earnings wallet not found');
  END IF;

  IF v_wallet.balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient available balance. You have ₦' || TO_CHAR(v_wallet.balance, 'FM999,999,990.00') || ' available.'
    );
  END IF;

  v_new_balance := v_wallet.balance - p_amount;

  UPDATE wallets
  SET balance = v_new_balance
  WHERE id = v_wallet.id;

  -- Insert withdrawal transaction
  INSERT INTO wallet_transactions (
    wallet_id,
    type,
    amount,
    status,
    paystack_reference,
    created_at
  ) VALUES (
    v_wallet.id,
    'withdrawal',
    -p_amount,
    'completed',
    p_reference,
    NOW()
  );

  -- Insert into payout_requests table
  INSERT INTO payout_requests (
    profile_id,
    amount,
    status,
    bank_name,
    account_number,
    account_name,
    reference,
    created_at
  ) VALUES (
    p_profile_id,
    p_amount,
    'processing',
    COALESCE(p_bank_name, 'Direct Bank'),
    COALESCE(p_account_number, ''),
    COALESCE(p_account_name, 'Creator'),
    p_reference,
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'reference', p_reference
  );
END;
$$;

-- 4. ATOMIC WITHDRAWAL ROLLBACK
-- If Paystack rejects a transfer, this procedure rolls back the deducted balance cleanly.
CREATE OR REPLACE FUNCTION atomic_rollback_withdrawal(p_reference text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx wallet_transactions%ROWTYPE;
  v_wallet wallets%ROWTYPE;
BEGIN
  SELECT * INTO v_tx
  FROM wallet_transactions
  WHERE paystack_reference = p_reference AND type = 'withdrawal' AND status = 'completed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Withdrawal transaction not found or already reversed');
  END IF;

  SELECT * INTO v_wallet
  FROM wallets
  WHERE id = v_tx.wallet_id
  FOR UPDATE;

  UPDATE wallets
  SET balance = balance + ABS(v_tx.amount)
  WHERE id = v_wallet.id;

  UPDATE wallet_transactions
  SET status = 'failed'
  WHERE id = v_tx.id;

  UPDATE payout_requests
  SET status = 'failed'
  WHERE reference = p_reference;

  RETURN jsonb_build_object('success', true, 'rolled_back_amount', ABS(v_tx.amount));
END;
$$;

-- 5. HISTORICAL WALLET & LEDGER CONSOLIDATION SCRIPT
-- Consolidates duplicate legacy daily micro-batches per campaign into 1 clean row
-- and reconciles all wallet balances to match SUM(completed transactions).
CREATE OR REPLACE FUNCTION reconcile_all_creator_wallets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group RECORD;
  v_primary_id uuid;
  v_wallet RECORD;
  v_correct_balance numeric;
  v_reconciled_count integer := 0;
BEGIN
  -- A. Consolidate multiple legacy transactions for the same (wallet_id, campaign_id)
  FOR v_group IN
    SELECT wallet_id, campaign_id, COUNT(*) as cnt
    FROM wallet_transactions
    WHERE type IN ('payout_release', 'campaign_payout')
      AND campaign_id IS NOT NULL
    GROUP BY wallet_id, campaign_id
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the latest transaction as the primary record
    SELECT id INTO v_primary_id
    FROM wallet_transactions
    WHERE wallet_id = v_group.wallet_id
      AND campaign_id = v_group.campaign_id
      AND type IN ('payout_release', 'campaign_payout')
    ORDER BY created_at DESC
    LIMIT 1;

    -- Aggregate total gross, fee, net from the micro-batches
    UPDATE wallet_transactions
    SET
      amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM wallet_transactions
        WHERE wallet_id = v_group.wallet_id
          AND campaign_id = v_group.campaign_id
          AND type IN ('payout_release', 'campaign_payout')
      ),
      status = 'completed'
    WHERE id = v_primary_id;

    -- Delete the redundant duplicate rows
    DELETE FROM wallet_transactions
    WHERE wallet_id = v_group.wallet_id
      AND campaign_id = v_group.campaign_id
      AND type IN ('payout_release', 'campaign_payout')
      AND id <> v_primary_id;
  END LOOP;

  -- B. Recompute balances for all creator wallets
  FOR v_wallet IN
    SELECT id, profile_id
    FROM wallets
    WHERE wallet_type = 'creator_earnings'
    FOR UPDATE
  LOOP
    SELECT COALESCE(SUM(amount), 0)
    INTO v_correct_balance
    FROM wallet_transactions
    WHERE wallet_id = v_wallet.id AND status = 'completed';

    IF v_correct_balance < 0 THEN
      v_correct_balance := 0;
    END IF;

    UPDATE wallets
    SET balance = v_correct_balance
    WHERE id = v_wallet.id;

    UPDATE creator_profiles
    SET total_earned = (
      SELECT COALESCE(SUM(amount), 0)
      FROM wallet_transactions
      WHERE wallet_id = v_wallet.id AND status = 'completed' AND amount > 0
    )
    WHERE profile_id = v_wallet.profile_id;

    v_reconciled_count := v_reconciled_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'wallets_reconciled', v_reconciled_count
  );
END;
$$;
