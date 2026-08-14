-- =========================================================
-- CAMPAIGN SOFT DELETE COLUMN
-- Add a deleted boolean column to campaigns to support soft delete
-- =========================================================

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_campaigns_deleted ON campaigns(deleted) WHERE deleted = true;
