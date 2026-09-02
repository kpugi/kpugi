-- =========================================================
-- ONBOARDING & PRODUCT TOUR PROGRESS TRACKING
-- =========================================================

-- Add onboarding tour and checklist tracking columns to profiles
alter table if exists profiles
  add column if not exists onboarding_tour_completed boolean not null default false,
  add column if not exists onboarding_tour_dismissed_at timestamptz,
  add column if not exists onboarding_checklist_state jsonb not null default '{}'::jsonb;

-- Create index on onboarding_tour_completed for fast lookups
create index if not exists idx_profiles_onboarding_tour on profiles(onboarding_tour_completed);
