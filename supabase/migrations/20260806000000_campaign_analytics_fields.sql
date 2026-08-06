-- Add analytics & engagement columns to campaigns and submissions tables

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS avg_watch_time_seconds numeric(5,1) DEFAULT 24.5,
ADD COLUMN IF NOT EXISTS target_engagement_rate numeric(5,2) DEFAULT 8.4;

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS likes_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS watch_time_seconds numeric(5,1) DEFAULT 24.5;
