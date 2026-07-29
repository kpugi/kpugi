-- Add statistical fields to social_accounts table
ALTER TABLE social_accounts 
ADD COLUMN IF NOT EXISTS following_count INT,
ADD COLUMN IF NOT EXISTS likes_count INT,
ADD COLUMN IF NOT EXISTS video_count INT;
