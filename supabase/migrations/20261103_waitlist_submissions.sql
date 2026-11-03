-- =========================================================
-- KPUGI VIP WAITLIST SUBMISSIONS TABLE
-- =========================================================

create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('creator', 'brand')),
  full_name text not null,
  work_email text not null,
  
  -- Creator-specific fields
  creator_handle text,
  primary_platform text check (primary_platform in ('tiktok', 'reels', 'shorts', 'x', null)),
  monthly_reach text,
  
  -- Brand-specific fields
  company_website text,
  ad_budget text,
  campaign_goals text,
  
  passcode text not null default 'KPUGI-VIP-20NOV',
  ip_address text,
  source text default 'countdown_page',
  status text not null default 'queued' check (status in ('queued', 'invited', 'active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for unique email lookups per role
create index if not exists idx_waitlist_email on public.waitlist_submissions(work_email);
create index if not exists idx_waitlist_role on public.waitlist_submissions(role);

-- Enable RLS
alter table public.waitlist_submissions enable row level security;

-- Allow public anonymous insert for waitlist signups
create policy "Allow public insert to waitlist"
  on public.waitlist_submissions
  for insert
  with check (true);

-- Allow service role and admins to view waitlist entries
create policy "Allow service role full access to waitlist"
  on public.waitlist_submissions
  for all
  using (true)
  with check (true);

