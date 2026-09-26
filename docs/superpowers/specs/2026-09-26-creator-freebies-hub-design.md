# Design Specification: Creator Freebies, Perks & Challenges Hub

**Date:** 2026-09-26  
**Status:** Approved for Implementation  
**Audience:** Kpugi Engineering & Product  

---

## 1. Executive Summary & Context

Kpugi is introducing a dedicated **"Freebies & Perks Hub"** for creators. This space centralizes all incentives, community challenges, software discounts, and freebies directly between **Kpugi and the Creator** (independent of standard advertiser campaigns).

### Key Business Goals:
1. **Creator Retention & Gamification:** Motivate creators to post content, level up their rank, and participate in platform bounties.
2. **Value-Add Software & Tool Perks:** Provide negotiated discounts and trials for creator tools (editing software, music licenses, equipment deals) with a subtle, non-intrusive `ⓘ Partner perk` disclosure.
3. **Full Admin Control:** Provide an internal control center where Kpugi administrators can deploy new challenges, set eligibility criteria based on Kpugi's 14 creator ranks, review manual proofs, and trigger instant wallet payouts with a single click.

---

## 2. Database Schema & Atomic Transactions

### 2.1 Table: `platform_perks`
Stores all freebies, challenges, coupons, and partner perks deployed by admins.

```sql
CREATE TABLE IF NOT EXISTS platform_perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  perk_type TEXT NOT NULL CHECK (perk_type IN ('challenge', 'coupon', 'software_deal', 'freebie', 'bonus')),
  category TEXT NOT NULL DEFAULT 'general', -- 'editing_tools', 'music', 'cash_bounty', 'gear', 'courses', 'general'
  
  -- Visual Presentation
  cover_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  theme_color TEXT DEFAULT 'indigo', -- 'indigo', 'emerald', 'amber', 'purple', 'rose'
  
  -- Reward & Offer Details
  reward_type TEXT NOT NULL CHECK (reward_type IN ('cash_wallet', 'coupon_discount', 'free_license', 'merch_gift', 'custom')),
  reward_amount NUMERIC DEFAULT 0, -- Cash in Naira (for challenges/bonuses)
  coupon_code TEXT, -- Copyable discount/promo code
  affiliate_url TEXT, -- External link (SaaS, tool, partner deal)
  has_affiliate_disclaimer BOOLEAN DEFAULT FALSE, -- Displays subtle "(i) Partner deal" badge
  
  -- Eligibility & Limits
  min_creator_level INTEGER DEFAULT 1 CHECK (min_creator_level BETWEEN 1 AND 14), -- Links to CREATOR_LEVELS
  requires_proof BOOLEAN DEFAULT FALSE, -- True for challenges/bonuses needing proof submission
  proof_instructions TEXT, -- Step-by-step instructions for what link/proof to submit
  total_quota INTEGER, -- NULL = unlimited claims, or capped (e.g. 50 claims)
  claimed_count INTEGER DEFAULT 0,
  
  -- Status & Scheduling
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'paused', 'expired')),
  start_at TIMESTAMPTZ DEFAULT NOW(),
  end_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_perks_status ON platform_perks(status);
CREATE INDEX IF NOT EXISTS idx_platform_perks_type ON platform_perks(perk_type);
CREATE INDEX IF NOT EXISTS idx_platform_perks_min_level ON platform_perks(min_creator_level);
```

### 2.2 Table: `platform_perk_claims`
Tracks creator participation, submitted proof URLs, review decisions, and wallet payouts.

```sql
CREATE TABLE IF NOT EXISTS platform_perk_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perk_id UUID NOT NULL REFERENCES platform_perks(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'unlocked' CHECK (status IN ('unlocked', 'submitted', 'approved', 'rejected')),
  
  -- Manual Proof Submission Fields
  proof_url TEXT, -- Link to social post, video, or drive folder
  proof_notes TEXT, -- Creator commentary / details
  submitted_at TIMESTAMPTZ,
  
  -- Admin Review & Audit
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT, -- Admin feedback or rejection reason
  
  -- Automated Wallet Payout
  reward_paid BOOLEAN DEFAULT FALSE,
  wallet_transaction_id UUID REFERENCES wallet_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(perk_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_perk_claims_creator ON platform_perk_claims(creator_id);
CREATE INDEX IF NOT EXISTS idx_perk_claims_status ON platform_perk_claims(status);
```

### 2.3 Atomic Wallet Credit Procedure: `atomic_approve_perk_claim`
Runs inside an ACID transaction to guarantee race-free balance updates.

```sql
CREATE OR REPLACE FUNCTION atomic_approve_perk_claim(
  p_claim_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim platform_perk_claims%ROWTYPE;
  v_perk platform_perks%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_new_balance NUMERIC;
  v_tx_id UUID;
  v_ref TEXT;
BEGIN
  -- 1. Lock claim row
  SELECT * INTO v_claim
  FROM platform_perk_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim record not found');
  END IF;

  IF v_claim.status = 'approved' AND v_claim.reward_paid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim has already been approved and credited');
  END IF;

  -- 2. Fetch perk details
  SELECT * INTO v_perk
  FROM platform_perks
  WHERE id = v_claim.perk_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Perk not found');
  END IF;

  -- 3. If perk pays cash, credit the creator's wallet atomically
  IF v_perk.reward_type = 'cash_wallet' AND COALESCE(v_perk.reward_amount, 0) > 0 THEN
    SELECT * INTO v_wallet
    FROM wallets
    WHERE profile_id = v_claim.creator_id AND wallet_type = 'creator_earnings'
    FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO wallets (profile_id, wallet_type, balance)
      VALUES (v_claim.creator_id, 'creator_earnings', 0)
      RETURNING * INTO v_wallet;
    END IF;

    v_new_balance := COALESCE(v_wallet.balance, 0) + v_perk.reward_amount;

    UPDATE wallets
    SET balance = v_new_balance
    WHERE id = v_wallet.id;

    v_ref := 'KPG-BONUS-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));

    INSERT INTO wallet_transactions (
      wallet_id,
      type,
      amount,
      gross_amount,
      net_amount,
      paystack_reference,
      status,
      created_at
    ) VALUES (
      v_wallet.id,
      'bonus_credit',
      v_perk.reward_amount,
      v_perk.reward_amount,
      v_perk.reward_amount,
      v_ref,
      'completed',
      NOW()
    ) RETURNING id INTO v_tx_id;
  END IF;

  -- 4. Update claim record
  UPDATE platform_perk_claims
  SET status = 'approved',
      reward_paid = (v_perk.reward_type = 'cash_wallet'),
      wallet_transaction_id = v_tx_id,
      reviewed_by = p_admin_id,
      reviewed_at = NOW(),
      admin_notes = p_admin_notes,
      updated_at = NOW()
  WHERE id = v_claim.id;

  -- 5. Increment claimed count on perk
  UPDATE platform_perks
  SET claimed_count = COALESCE(claimed_count, 0) + 1
  WHERE id = v_perk.id;

  RETURN jsonb_build_object(
    'success', true,
    'claim_id', v_claim.id,
    'reward_amount', v_perk.reward_amount,
    'new_balance', v_new_balance
  );
END;
$$;
```

---

## 3. Creator Experience & UI Architecture

### 3.1 Routing & Navigation
- **Sidebar Integration:** Added to [`components/dashboard/DashboardLayoutShell.tsx`](file:///c:/Users/HP/Desktop/Kpugi/components/dashboard/DashboardLayoutShell.tsx):
  - Route: `/c/freebies`
  - Label: `Freebies & Perks`
  - Icon: Tabler `IconGift` / Lucide `Gift`
- **Sub-routes:**
  - Dynamic Item Detail: `/c/freebies/[id]`

### 3.2 Main Hub Page: `/c/freebies`
- **Creator Rank Banner:**
  - Displays user's current level (from `lib/utils/levels.ts`, e.g. `Level 3: Enthusiast 🎯`).
  - Total challenge bonuses earned to date.
  - Quick count of perks unlocked at their current rank.
- **Hero Spotlight Card:**
  - Highlights top active cash challenge or newest partner deal.
  - Large cover banner, countdown/deadline, and 1-click CTA.
- **Category Filter Tabs:**
  - `All Perks`
  - `🔥 Challenges` (Milestones with Naira payouts)
  - `🛠️ Tools & SaaS` (Exclusive partner subscriptions with subtle disclaimer)
  - `🏷️ Coupons & Deals` (Promo codes)
  - `🎁 Freebies & Swag` (Merch, packs, guides)
- **Rank & Status Filter Chips:**
  - `Unlocked for my Rank` vs `All Ranks`
  - `Available`, `Submitted (Under Review)`, `Claimed / Completed`
- **Card Design:**
  - **16:9 Cover Image** with fallback category gradient.
  - Floating badges for perk type and reward amount (`₦25,000 Cash` or `50% Off`).
  - Subtle `ⓘ Partner perk` badge if `has_affiliate_disclaimer` is true.
  - Rank status pill (`✓ Unlocked` or `🔒 Level 4+ Senior Required`).

### 3.3 Detail Pages: `/c/freebies/[id]`
Polymorphic layout tailored to the `perk_type`:

1. **Challenge Detail View:**
   - Full hero cover image with title and deadline.
   - Guaranteed reward callout box (`₦ Amount directly to Kpugi Wallet`).
   - Detailed rules, guidelines, and hashtag requirements.
   - **Manual Proof Submission Box:**
     - Post URL input (TikTok, Instagram, YouTube, X).
     - Notes/context textarea.
     - "Submit Proof for Review" button.
   - **Live Submission Status Tracker:**
     - `Submitted on [Date]` ➔ `Under Admin Review` ➔ `Approved & Credited` (or `Rejected with Reason`).
2. **Coupon / Partner Deal View:**
   - Deal explanation and redemption instructions.
   - 1-click **Copy Coupon Code** button with toast alert.
   - **"Redeem on Partner Site ↗"** button.
   - Subtle partner disclaimer:
     > *"ℹ️ Kpugi Partner Perk: We partner with top creator software and tools to negotiate exclusive discounts. Some partner links may earn Kpugi a commission at zero additional cost to you."*
3. **Freebie / Swag View:**
   - Direct download links for digital packs, or shipping address submission for physical kits.

---

## 4. Admin Experience & Management Architecture

### 4.1 Routing & Navigation
- **Sidebar Integration:** Added to [`components/admin/layout/AppSidebar.tsx`](file:///c:/Users/HP/Desktop/Kpugi/components/admin/layout/AppSidebar.tsx):
  - Route: `/admin/freebies`
  - Label: `Freebies & Perks`
  - Icon: `Gift`

### 4.2 Admin Control Center: `/admin/freebies`
- **Live Metrics Dashboard:**
  - Active Perks Count
  - Pending Proof Submissions Queue Count
  - Total Naira Paid Out via Challenges
- **Tab 1: Perks Catalog:**
  - Complete list of all deployed items with filters for status and type.
  - Table: Cover Thumbnail, Title & Type, Rank Required, Reward, Claims / Quota, Status (`Active`, `Paused`, `Draft`, `Expired`).
  - Actions: Edit Perk, Pause/Activate, Delete.
  - **"+ Deploy New Perk"** primary CTA opening the deployment wizard.
- **Tab 2: Submissions & Proofs Review Queue:**
  - Real-time queue of all creator challenge submissions.
  - Details: Creator Profile, Rank Badge, Challenge Title, Reward Amount (₦), Clickable Proof Link, Submission Notes, Submitted Date.
  - **1-Click "Approve & Credit ₦X"**:
    - Calls `atomic_approve_perk_claim(...)`.
    - Credits creator wallet immediately.
    - Updates claim state to `approved`.
    - Creates an entry in `admin_audit_logs`.
  - **"Reject" Action:**
    - Modal to provide rejection feedback (e.g. "Video set to private", "Wrong sound used").
    - Allows creator to rectify and re-submit.

### 4.3 Deployment Wizard / Modal
- **Step 1: Perk Type & Category:**
  - Select type: `Challenge`, `Partner Deal`, `Coupon`, `Freebie`, `Bonus`.
  - Category selector (`Video Editing`, `Audio & Music`, `Cash Bounty`, `Hardware & Swag`, `General`).
- **Step 2: Content & Cover Image:**
  - Title & auto-generated slug.
  - Rich description & step-by-step instructions.
  - **Cover Image Selector:**
    - Custom image URL input.
    - Quick preset category covers (1-click high-res themes).
    - Live 16:9 banner preview.
- **Step 3: Reward & Partner Settings:**
  - For challenges: Cash Reward in Naira (`₦`).
  - For coupons: Coupon code & discount terms.
  - For partner tools: Affiliate URL + `Show subtle "(i) Partner perk" disclaimer` checkbox.
- **Step 4: Eligibility & Quota:**
  - Minimum Creator Level (from Level 1 Novice up to Level 14 Diamond).
  - Requires Proof Submission checkbox (defaults to True for challenges).
  - Total Claims Quota (optional limit).
  - Expiry / End Date.

---

## 5. Security & Verification

1. **Row Level Security (RLS):**
   - `platform_perks`: Public read for active perks; write restricted to admins.
   - `platform_perk_claims`: Creators can view and insert their own claims; admins have full read/write access.
2. **Rank Gating:** Server-side verification ensures a creator cannot submit proof for a perk above their current level.
3. **Idempotency & Race Condition Protection:**
   - Unique constraint `(perk_id, creator_id)` prevents duplicate claims.
   - Row-level locking on wallet operations prevents duplicate payouts.

---

## 6. Implementation Milestones

1. **Phase 1: Database & Server Actions**
   - Migration file with `platform_perks`, `platform_perk_claims`, RLS, and `atomic_approve_perk_claim`.
   - Server actions for fetching perks, submitting proofs, deploying perks, and approving/rejecting claims.
2. **Phase 2: Admin Control Panel**
   - Admin routes `/admin/freebies`.
   - Catalog manager, Deploy Wizard modal with cover preview, and Proof Review Queue with 1-click payout.
3. **Phase 3: Creator Hub & Detail Views**
   - Sidebar links in `DashboardLayoutShell.tsx`.
   - Main dashboard page `/c/freebies` with rank banner, tabs, filters, and cover cards.
   - Dynamic detail page `/c/freebies/[id]` with proof submission form and status timeline.
4. **Phase 4: End-to-End Testing & Polish**
   - End-to-end test of the full lifecycle: Admin deploys challenge ➔ Creator views & submits proof ➔ Admin approves ➔ Wallet credited with audit transaction.
