-- Platform Broadcasts Table
-- Stores multi-channel announcements, updates, and alerts dispatched by admins
CREATE TABLE IF NOT EXISTS platform_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  tag text NOT NULL DEFAULT 'update' CHECK (tag IN ('new_feature', 'update', 'action_required', 'maintenance', 'promotion', 'tip')),
  target_audience text NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'creators', 'brands')),
  channels text[] NOT NULL DEFAULT ARRAY['dashboard_banner'],
  has_cta boolean NOT NULL DEFAULT false,
  cta_label text,
  cta_url text,
  cta_style text NOT NULL DEFAULT 'primary' CHECK (cta_style IN ('primary', 'success', 'outline')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  email_subject text,
  email_preview_text text,
  sent_count int NOT NULL DEFAULT 0,
  click_count int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Indexing for active queries
CREATE INDEX IF NOT EXISTS idx_platform_broadcasts_status ON platform_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_platform_broadcasts_audience ON platform_broadcasts(target_audience);
CREATE INDEX IF NOT EXISTS idx_platform_broadcasts_created_at ON platform_broadcasts(created_at DESC);

-- Row Level Security
ALTER TABLE platform_broadcasts ENABLE ROW LEVEL SECURITY;

-- Admins have full access
CREATE POLICY "Admins full access on platform_broadcasts"
  ON platform_broadcasts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Authenticated and anonymous users can read active banners
CREATE POLICY "Users can read active broadcasts"
  ON platform_broadcasts
  FOR SELECT
  USING (status = 'active');
