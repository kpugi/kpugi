-- =========================================================
-- KPUGI INITIAL DATABASE SCHEMA
-- =========================================================

-- PROFILES
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null check (role in ('advertiser', 'creator', 'both')),
  phone text,
  paystack_customer_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists advertiser_profiles (
  profile_id uuid primary key references profiles(id) on delete cascade,
  company_name text not null,
  company_website text,
  billing_email text,
  agreed_global_rules_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists creator_profiles (
  profile_id uuid primary key references profiles(id) on delete cascade,
  display_name text,
  bio text,
  paystack_recipient_code text,
  total_earned numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

-- SOCIAL ACCOUNTS
create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(profile_id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'x', 'facebook', 'youtube')),
  handle text not null,
  platform_user_id text not null,
  follower_count int,
  oauth_access_token text,
  oauth_refresh_token text,
  oauth_scopes text[],
  connected_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_synced_at timestamptz,
  unique (platform, platform_user_id)
);

-- CAMPAIGNS
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references advertiser_profiles(profile_id) on delete cascade,
  title text not null,
  description text not null,
  ad_format text not null check (ad_format in ('text', 'image', 'video')),
  requirements jsonb not null default '{}',
  cpm_rate numeric(10,2) not null default 2000.00,
  total_budget numeric(14,2) not null,
  reserved_budget numeric(14,2) not null default 0,
  spent_budget numeric(14,2) not null default 0,
  min_view_threshold int not null default 1000,
  required_live_duration_hours int not null default 72,
  verification_grace_hours int not null default 24,
  status text not null default 'draft'
    check (status in ('draft', 'funding_pending', 'live', 'budget_committed', 'completed', 'cancelled')),
  funded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaign_creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  file_url text,
  copy_text text,
  caption_suggestion text,
  created_at timestamptz not null default now()
);

-- SUBMISSIONS
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  creator_id uuid not null references creator_profiles(profile_id) on delete cascade,
  social_account_id uuid not null references social_accounts(id),
  post_url text not null unique,
  screenshot_url text not null,
  submitted_at timestamptz not null default now(),
  reserved_amount numeric(14,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'verified_pass', 'verified_fail', 'forfeited', 'paid')),
  final_view_count int,
  verified_at timestamptz,
  failure_reason text,
  paid_at timestamptz,
  payout_amount numeric(14,2),
  commission_amount numeric(14,2),
  unique (campaign_id, creator_id)
);

create table if not exists verification_checks (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  checked_at timestamptz not null default now(),
  post_reachable boolean not null,
  view_count int,
  raw_scrape jsonb,
  notes text
);

-- WALLETS & LEDGER
create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  wallet_type text not null check (wallet_type in ('advertiser_funding', 'creator_earnings')),
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (profile_id, wallet_type)
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallets(id) on delete cascade,
  type text not null check (type in (
    'campaign_funding', 'budget_reservation', 'budget_release_refund',
    'payout_release', 'commission_deduction', 'withdrawal'
  )),
  amount numeric(14,2) not null,
  campaign_id uuid references campaigns(id),
  submission_id uuid references submissions(id),
  paystack_reference text,
  created_at timestamptz not null default now()
);

-- PAYSTACK WEBHOOK LOG
create table if not exists paystack_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  reference text,
  payload jsonb not null,
  processed boolean not null default false,
  received_at timestamptz not null default now()
);

-- NOTIFICATIONS LOG
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  knock_workflow_key text not null,
  channel text not null check (channel in ('email', 'in_app', 'push')),
  payload jsonb,
  sent_at timestamptz not null default now()
);

-- INDEXES
create index if not exists idx_campaigns_status on campaigns(status);
create index if not exists idx_campaigns_advertiser on campaigns(advertiser_id);
create index if not exists idx_submissions_campaign on submissions(campaign_id);
create index if not exists idx_submissions_status on submissions(status);
create index if not exists idx_social_accounts_creator on social_accounts(creator_id);
create index if not exists idx_wallet_tx_wallet on wallet_transactions(wallet_id);
create index if not exists idx_verification_checks_submission on verification_checks(submission_id);
