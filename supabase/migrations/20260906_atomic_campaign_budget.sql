-- Migration: Atomic campaign budget deduction function with row-level locking
-- Date: 2026-09-06

CREATE OR REPLACE FUNCTION atomic_update_campaign_budget(
  p_campaign_id uuid,
  p_spent_increment numeric,
  p_reserved_decrement numeric,
  p_new_status text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign campaigns%ROWTYPE;
  v_new_spent numeric;
  v_new_reserved numeric;
  v_final_status text;
BEGIN
  -- Row-level lock to eliminate any concurrent race conditions
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Campaign not found');
  END IF;

  v_new_spent := COALESCE(v_campaign.spent_budget, 0) + p_spent_increment;
  v_new_reserved := GREATEST(0, COALESCE(v_campaign.reserved_budget, 0) - p_reserved_decrement);
  
  IF p_new_status IS NOT NULL THEN
    v_final_status := p_new_status;
  ELSIF v_campaign.total_budget > 0 AND v_new_spent >= v_campaign.total_budget THEN
    v_final_status := 'completed';
  ELSE
    v_final_status := v_campaign.status;
  END IF;

  UPDATE campaigns
  SET
    spent_budget = v_new_spent,
    reserved_budget = v_new_reserved,
    status = v_final_status,
    updated_at = NOW()
  WHERE id = p_campaign_id;

  RETURN jsonb_build_object(
    'success', true,
    'spent_budget', v_new_spent,
    'reserved_budget', v_new_reserved,
    'status', v_final_status
  );
END;
$$;
