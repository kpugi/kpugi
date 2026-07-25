ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

UPDATE campaigns 
SET is_featured = TRUE 
WHERE title = 'Kpugi Official Platform Launch';
