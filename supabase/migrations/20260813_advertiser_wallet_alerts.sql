-- Migration: 20260813_advertiser_wallet_alerts.sql
-- Add low-balance alert configurations to advertiser_profiles

ALTER TABLE advertiser_profiles 
  ADD COLUMN IF NOT EXISTS low_balance_alert_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS low_balance_alert_threshold numeric(14,2) DEFAULT 10000.00;
