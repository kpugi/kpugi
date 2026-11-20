-- Add bank detail columns to creator_profiles if desired for caching
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS bank_account_number text,
ADD COLUMN IF NOT EXISTS bank_code text,
ADD COLUMN IF NOT EXISTS bank_name text;
