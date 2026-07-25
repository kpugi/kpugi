-- Add channels text array column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS channels TEXT[] NOT NULL DEFAULT '{}';

-- Backfill campaigns with their supported channels
UPDATE campaigns SET channels = ARRAY['TikTok', 'Instagram', 'X']::TEXT[] WHERE campaign_code = 'KPG-LNC9X';
UPDATE campaigns SET channels = ARRAY['TikTok', 'Instagram', 'X']::TEXT[] WHERE campaign_code = 'KPG-PGVST';
UPDATE campaigns SET channels = ARRAY['Instagram', 'TikTok']::TEXT[] WHERE campaign_code = 'KPG-CHOWD';
UPDATE campaigns SET channels = ARRAY['TikTok', 'Instagram', 'X']::TEXT[] WHERE campaign_code = 'KPG-INFNX';
UPDATE campaigns SET channels = ARRAY['Instagram', 'TikTok']::TEXT[] WHERE campaign_code = 'KPG-ZARON';
