-- Platform Settings Table
-- Stores dynamic configuration parameters for Kpugi platform modules
CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Row Level Security
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users with admin role to read and modify
CREATE POLICY "Admins can view and edit platform settings"
  ON platform_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Pre-seed default settings rows if not present
INSERT INTO platform_settings (key, value)
VALUES
  ('marketplace', '{
    "maintenanceMode": false,
    "commissionRate": 0.10,
    "minViewsThreshold": 100,
    "minWithdrawalAmount": 5000,
    "minCampaignBudget": 10000,
    "featuredFee": 2500,
    "defaultCurrency": "NGN",
    "currencySymbol": "₦",
    "supportEmail": "support@kpugi.com"
  }'::jsonb),
  ('browse', '{
    "heroMaxSlots": 5,
    "heroAutoSlideIntervalSec": 6,
    "defaultSortAlgorithm": "trending",
    "activeCategories": ["Tech", "Finance", "Lifestyle", "Fashion", "Food & Drink", "Gaming", "Beauty", "Sports"],
    "announcementBanner": {
      "enabled": false,
      "message": "",
      "theme": "info",
      "linkUrl": ""
    },
    "emptyStateTitle": "No matching campaigns found",
    "emptyStateDescription": "Try adjusting your filters, searching for a different keyword, or check back soon for new briefs."
  }'::jsonb),
  ('campaigns', '{
    "approvalPolicy": "admin_review",
    "autoCloseDepleted": true,
    "allowedSocialPlatforms": {
      "tiktok": true,
      "instagram": true,
      "youtube": true,
      "twitter": true
    },
    "verificationWindowHours": 48,
    "maxSubmissionsPerCreator": 3
  }'::jsonb),
  ('users', '{
    "kycPolicy": "strict",
    "kycThresholdAmount": 50000,
    "followerMinimums": {
      "tiktok": 1000,
      "instagram": 1000,
      "youtube": 500
    },
    "requireOnboardingChecklist": true,
    "flagViewVelocitySpikes": true,
    "blockDuplicateBankAccounts": true
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
