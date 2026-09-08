-- Allow social account disconnect / deletion without foreign key constraint violations
-- Existing submissions will have their social_account_id set to NULL to preserve campaign history and payouts.

ALTER TABLE submissions ALTER COLUMN social_account_id DROP NOT NULL;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_social_account_id_fkey;
ALTER TABLE submissions ADD CONSTRAINT submissions_social_account_id_fkey 
  FOREIGN KEY (social_account_id) 
  REFERENCES social_accounts(id) 
  ON DELETE SET NULL;
