-- =========================================================
-- KPUGI CAMPAIGN & PLATFORM REVIEWS MIGRATION
-- =========================================================

create table if not exists campaign_reviews (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  reviewer_profile_id uuid not null references profiles(id) on delete cascade,
  reviewer_role text not null check (reviewer_role in ('creator', 'advertiser')),
  target_type text not null check (target_type in ('campaign_and_brand', 'platform')),
  target_advertiser_id uuid references advertiser_profiles(profile_id) on delete set null,
  
  -- Ratings & Sentiments
  sentiment_id text not null check (sentiment_id in ('poor', 'mediocre', 'decent', 'great', 'legendary')),
  rating int not null check (rating >= 1 and rating <= 5),
  tags text[] default '{}',
  comment text,
  metrics_highlight text,
  
  -- Visibility & Curation
  is_public boolean not null default true,
  is_featured boolean not null default false,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Prevent multiple reviews per target
  unique (campaign_id, reviewer_profile_id, target_type)
);

-- Indices for performance
create index if not exists idx_campaign_reviews_campaign on campaign_reviews(campaign_id);
create index if not exists idx_campaign_reviews_reviewer on campaign_reviews(reviewer_profile_id);
create index if not exists idx_campaign_reviews_advertiser on campaign_reviews(target_advertiser_id);
create index if not exists idx_campaign_reviews_featured on campaign_reviews(is_featured) where is_featured = true;

-- Enable RLS
alter table campaign_reviews enable row level security;

-- Public read access for public reviews
create policy if not exists "Public reviews are readable by everyone"
  on campaign_reviews for select
  using (is_public = true);

-- Users can insert their own reviews
create policy if not exists "Users can insert their own reviews"
  on campaign_reviews for insert
  with check (
    reviewer_profile_id in (
      select id from profiles where clerk_id = auth.jwt()->>'sub'
    )
  );

-- Users can update their own reviews
create policy if not exists "Users can update their own reviews"
  on campaign_reviews for update
  using (
    reviewer_profile_id in (
      select id from profiles where clerk_id = auth.jwt()->>'sub'
    )
  );
