-- Migration to update campaigns_status_check constraint to support 'archived' status
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
  CHECK (status IN ('draft', 'funding_pending', 'live', 'budget_committed', 'completed', 'cancelled', 'archived'));
