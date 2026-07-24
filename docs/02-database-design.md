# Kpugi — Database Design (Supabase / Postgres)

Auth is handled by Clerk, so Supabase does not store passwords/credentials — only a `profiles` table keyed on `clerk_id` that mirrors the Clerk user and carries Kpugi-specific fields (role, wallet, verification status, etc.). Row Level Security (RLS) should be enabled on every table; policies scope advertisers to their own campaigns/wallet and creators to their own submissions/accounts, with service-role bypass for cron/webhook jobs.

## Entity overview

- `profiles` — one row per Clerk user; role = advertiser or creator (or both)
- `advertiser_profiles` — brand-specific fields
- `creator_profiles` — creator-specific fields
- `social_accounts` — OAuth-connected pages/profiles belonging to a creator
- `campaigns` — advertiser-created ad campaigns
- `campaign_creatives` — the actual ad files/copy attached to a campaign
- `submissions` — a creator "clocking in" to a campaign with a live post
- `verification_checks` — cron/scraper log of checks against a submission's live post
- `wallets` — one per advertiser (funding balance) and one per creator (earnings balance)
- `wallet_transactions` — ledger of all money movement (funding, reservation, release, refund, payout, commission)
- `paystack_events` — raw webhook log from Paystack for auditability
- `notifications` — outbound notification log (mirrors what's sent via Knock)

---

## Schema (SQL)

```sql
-- =========================================================
-- PROFILES
-- =========================================================
create table profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null check (role in ('advertiser', 'creator', 'both')),
  phone text,
  paystack_customer_code text,          -- for advertisers funding via Paystack
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table advertiser_profiles (
  profile_id uuid primary key references profiles(id) on delete cascade,
  company_name text not null,
  company_website text,
  billing_email text,
  agreed_global_rules_at timestamptz,   -- timestamp of accepting platform-wide rules
  created_at timestamptz not null default now()
);

create table creator_profiles (
  profile_id uuid primary key references profiles(id) on delete cascade,
  display_name text,
  bio text,
  paystack_recipient_code text,         -- payout destination on Paystack
  total_earned numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- SOCIAL ACCOUNTS (OAuth-connected creator pages)
-- =========================================================
create table social_accounts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(profile_id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'x', 'facebook', 'youtube')),
  handle text not null,
  platform_user_id text not null,
  follower_count int,
  oauth_access_token text,              -- encrypted at rest
  oauth_refresh_token text,             -- encrypted at rest
  oauth_scopes text[],
  connected_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_synced_at timestamptz,
  unique (platform, platform_user_id)
);

-- =========================================================
-- CAMPAIGNS
-- =========================================================
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references advertiser_profiles(profile_id) on delete cascade,
  title text not null,
  description text not null,
  ad_format text not null check (ad_format in ('text', 'image', 'video')),
  requirements jsonb not null default '{}',   -- advisory: audience, niche, min followers, platforms, geography, etc.
  cpm_rate numeric(10,2) not null default 2000.00,  -- naira per 1,000 views
  total_budget numeric(14,2) not null,
  reserved_budget numeric(14,2) not null default 0,  -- sum of active submission reservations
  spent_budget numeric(14,2) not null default 0,     -- sum of completed payouts (creator + commission)
  min_view_threshold int not null default 1000,       -- hard cliff floor
  required_live_duration_hours int not null default 72,
  verification_grace_hours int not null default 24,   -- grace window after duration before final check
  status text not null default 'draft'
    check (status in ('draft', 'funding_pending', 'live', 'budget_committed', 'completed', 'cancelled')),
  funded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaign_creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  file_url text,             -- for image/video
  copy_text text,            -- for text ads / captions
  caption_suggestion text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- SUBMISSIONS (a creator "clocking in")
-- =========================================================
create table submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  creator_id uuid not null references creator_profiles(profile_id) on delete cascade,
  social_account_id uuid not null references social_accounts(id),
  post_url text not null unique,          -- global de-dupe
  screenshot_url text not null,
  submitted_at timestamptz not null default now(),
  reserved_amount numeric(14,2) not null,  -- budget carved out at submission time
  status text not null default 'pending'
    check (status in ('pending', 'verified_pass', 'verified_fail', 'forfeited', 'paid')),
  final_view_count int,
  verified_at timestamptz,
  failure_reason text,   -- 'below_threshold' | 'post_removed' | 'oauth_revoked' | 'account_private'
  paid_at timestamptz,
  payout_amount numeric(14,2),        -- after 10% commission
  commission_amount numeric(14,2),
  unique (campaign_id, creator_id)    -- one active submission per creator per campaign
);

create table verification_checks (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  checked_at timestamptz not null default now(),
  post_reachable boolean not null,
  view_count int,
  raw_scrape jsonb,          -- raw scraper payload for debugging/audit
  notes text
);

-- =========================================================
-- WALLETS & LEDGER
-- =========================================================
create table wallets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  wallet_type text not null check (wallet_type in ('advertiser_funding', 'creator_earnings')),
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (profile_id, wallet_type)
);

create table wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallets(id) on delete cascade,
  type text not null check (type in (
    'campaign_funding', 'budget_reservation', 'budget_release_refund',
    'payout_release', 'commission_deduction', 'withdrawal'
  )),
  amount numeric(14,2) not null,     -- positive = credit, negative = debit
  campaign_id uuid references campaigns(id),
  submission_id uuid references submissions(id),
  paystack_reference text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- PAYSTACK WEBHOOK LOG
-- =========================================================
create table paystack_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  reference text,
  payload jsonb not null,
  processed boolean not null default false,
  received_at timestamptz not null default now()
);

-- =========================================================
-- NOTIFICATIONS LOG (mirrors Knock sends)
-- =========================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  knock_workflow_key text not null,
  channel text not null check (channel in ('email', 'in_app', 'push')),
  payload jsonb,
  sent_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES
-- =========================================================
create index idx_campaigns_status on campaigns(status);
create index idx_campaigns_advertiser on campaigns(advertiser_id);
create index idx_submissions_campaign on submissions(campaign_id);
create index idx_submissions_status on submissions(status);
create index idx_social_accounts_creator on social_accounts(creator_id);
create index idx_wallet_tx_wallet on wallet_transactions(wallet_id);
create index idx_verification_checks_submission on verification_checks(submission_id);
```

## Notes on key relationships

- **Budget integrity**: `campaigns.reserved_budget + campaigns.spent_budget` should never exceed `campaigns.total_budget`. Enforce this in the submission-creation transaction (application logic, or a Postgres trigger/check) rather than trusting the client.
- **One active submission per creator per campaign**: enforced via the `unique (campaign_id, creator_id)` constraint on `submissions`.
- **Global URL dedupe**: enforced via `unique` on `submissions.post_url`.
- **Failed slot → refund**: when a submission moves to `verified_fail` or `forfeited`, a job should (a) insert a `budget_release_refund` wallet_transaction, (b) decrement `campaigns.reserved_budget` by `reserved_amount`, freeing it for a new/queued submission.
- **Payout math**: on `verified_pass`, compute `payout_amount = (final_view_count / 1000) * cpm_rate * 0.9` and `commission_amount = ... * 0.10`, write both to the submission, insert matching `wallet_transactions`, and move `campaigns.reserved_budget → campaigns.spent_budget`.
- **RLS pattern**: advertisers can `select`/`update` only rows where `advertiser_id = auth profile`; creators similarly scoped to their own `creator_profiles`/`submissions`/`social_accounts`. Cron/webhook jobs run under the Supabase service role, bypassing RLS.
