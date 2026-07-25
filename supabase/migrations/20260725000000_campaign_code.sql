ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_code VARCHAR(10) UNIQUE;

UPDATE campaigns 
SET campaign_code = 'KPG-LNC9X' 
WHERE title = 'Kpugi Official Platform Launch' AND campaign_code IS NULL;
