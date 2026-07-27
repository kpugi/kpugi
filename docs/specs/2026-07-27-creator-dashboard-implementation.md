# Creator Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full Creator Dashboard routes, data fetching functions, server actions, and UI components with Supabase DB and Clerk Auth integration.

**Architecture:** Next.js App Router server components fetching data from Supabase (`lib/supabase/creator.ts`), processing mutations through Next.js Server Actions (`app/actions/creator.ts`), and rendering modular UI components under `components/creator/`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase Client/Server SDK, Clerk Auth, Paystack API, Tailwind CSS.

---

## File Map

### New & Modified Files:
- `lib/supabase/creator.ts`: Data services layer for all creator queries (overview, campaigns, earnings, accounts, settings).
- `app/actions/creator.ts`: Server Actions for video submissions, payout requests, bank resolution, social account linking, profile updates.
- `app/dashboard/page.tsx`: Connects overview page to `getCreatorOverviewData`.
- `app/(creator)/campaigns/page.tsx`: Campaigns list page server component.
- `app/(creator)/campaigns/[id]/page.tsx`: Campaign workspace server component.
- `app/(creator)/earnings/page.tsx`: Earnings & payout management page server component.
- `app/(creator)/accounts/page.tsx`: Connected social handles page server component.
- `app/(creator)/settings/page.tsx`: Profile & settings page server component.
- `components/creator/overview/*`: Overview stat cards, hero card, recent activity ledger.
- `components/creator/campaigns/*`: Campaigns grid, workspace view, video submission form, audit panel.
- `components/creator/earnings/*`: Balance cards, bank account card, payout request modal, transaction ledger table.
- `components/creator/accounts/*`: Connected social accounts view and handle linking.
- `components/creator/settings/*`: Creator profile and niche category settings form.

---

### Task 1: Create Supabase Creator Data Services (`lib/supabase/creator.ts`)

**Files:**
- Create: `lib/supabase/creator.ts`

- [ ] **Step 1: Write creator data service functions**

```typescript
import { createServerClient } from './server';

export interface CreatorOverviewData {
  totalEarned: number;
  activeSubmissionsCount: number;
  availableBalance: number;
  pendingEscrow: number;
  featuredSubmission?: any;
  recentActivity: any[];
}

export async function getCreatorOverviewData(profileId: string): Promise<CreatorOverviewData> {
  const supabase = await createServerClient();

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, wallet_balance, total_earned')
    .eq('user_profile_id', profileId)
    .single();

  const { data: submissions } = await supabase
    .from('campaign_submissions')
    .select(`
      id,
      campaign_id,
      video_url,
      views_count,
      earned_amount,
      status,
      created_at,
      campaigns ( title, reward_per_1k_views, min_views_payout )
    `)
    .eq('creator_profile_id', creator?.id || '')
    .order('created_at', { ascending: false });

  const activeAudits = submissions?.filter((s) => s.status === 'auditing' || s.status === 'pending').length || 0;
  const featured = submissions?.find((s) => s.status === 'pending' || s.status === 'auditing') || submissions?.[0];

  return {
    totalEarned: creator?.total_earned || 0,
    activeSubmissionsCount: activeAudits,
    availableBalance: creator?.wallet_balance || 0,
    pendingEscrow: 0,
    featuredSubmission: featured,
    recentActivity: submissions || [],
  };
}

export async function getCreatorCampaigns(profileId: string, filter?: string) {
  const supabase = await createServerClient();
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_profile_id', profileId)
    .single();

  let query = supabase
    .from('campaign_submissions')
    .select(`
      id,
      campaign_id,
      video_url,
      views_count,
      earned_amount,
      status,
      created_at,
      campaigns (*)
    `)
    .eq('creator_profile_id', creator?.id || '');

  const { data } = await query;
  return data || [];
}

export async function getCreatorCampaignDetails(profileId: string, campaignId: string) {
  const supabase = await createServerClient();
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_profile_id', profileId)
    .single();

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  const { data: submission } = await supabase
    .from('campaign_submissions')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('creator_profile_id', creator?.id || '')
    .maybeSingle();

  return { campaign, submission };
}

export async function getCreatorEarningsData(profileId: string) {
  const supabase = await createServerClient();
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('*, bank_accounts(*)')
    .eq('user_profile_id', profileId)
    .single();

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('creator_profile_id', creator?.id || '')
    .order('created_at', { ascending: false });

  return {
    availableBalance: creator?.wallet_balance || 0,
    pendingEscrow: 0,
    totalEarned: creator?.total_earned || 0,
    bankDetails: creator?.bank_accounts?.[0] || null,
    transactions: transactions || [],
  };
}

export async function getCreatorSocialAccounts(profileId: string) {
  const supabase = await createServerClient();
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_profile_id', profileId)
    .single();

  const { data: accounts } = await supabase
    .from('creator_social_accounts')
    .select('*')
    .eq('creator_profile_id', creator?.id || '');

  return accounts || [];
}

export async function getCreatorProfileSettings(profileId: string) {
  const supabase = await createServerClient();
  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('*, user_profiles(*)')
    .eq('user_profile_id', profileId)
    .single();

  return profile;
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: Clean pass with no type errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/creator.ts
git commit -m "feat: add Supabase creator data services layer"
```

---

### Task 2: Create Server Actions Layer (`app/actions/creator.ts`)

**Files:**
- Create: `app/actions/creator.ts`

- [ ] **Step 1: Write server actions for campaign submission, payout, bank accounts, social links, and settings**

```typescript
'use me';
'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createServerClient } from '@/lib/supabase/server';

export async function submitCampaignVideoAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) throw new Error('Unauthorized');

  const campaignId = formData.get('campaignId') as string;
  const videoUrl = formData.get('videoUrl') as string;

  if (!campaignId || !videoUrl) throw new Error('Missing fields');

  const supabase = await createServerClient();
  const { error } = await supabase.from('campaign_submissions').upsert({
    campaign_id: campaignId,
    creator_profile_id: userProfile.creatorProfile.id,
    video_url: videoUrl,
    status: 'pending',
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath('/campaigns');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function requestPayoutAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) throw new Error('Unauthorized');

  const amount = Number(formData.get('amount'));
  if (!amount || amount < 1000) throw new Error('Minimum withdrawal is ₦1,000');

  const supabase = await createServerClient();
  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('wallet_balance')
    .eq('id', userProfile.creatorProfile.id)
    .single();

  if (!creator || creator.wallet_balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  // Deduct balance and create transaction record
  await supabase
    .from('creator_profiles')
    .update({ wallet_balance: creator.wallet_balance - amount })
    .eq('id', userProfile.creatorProfile.id);

  await supabase.from('wallet_transactions').insert({
    creator_profile_id: userProfile.creatorProfile.id,
    type: 'payout',
    amount: amount,
    status: 'processing',
  });

  revalidatePath('/earnings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function saveBankAccountAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) throw new Error('Unauthorized');

  const bankCode = formData.get('bankCode') as string;
  const accountNumber = formData.get('accountNumber') as string;
  const accountName = formData.get('accountName') as string;

  const supabase = await createServerClient();
  await supabase.from('bank_accounts').upsert({
    creator_profile_id: userProfile.creatorProfile.id,
    bank_code: bankCode,
    account_number: accountNumber,
    account_name: accountName,
    is_verified: true,
  });

  revalidatePath('/earnings');
  return { success: true };
}

export async function linkSocialAccountAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) throw new Error('Unauthorized');

  const platform = formData.get('platform') as string;
  const handle = formData.get('handle') as string;

  const supabase = await createServerClient();
  await supabase.from('creator_social_accounts').upsert({
    creator_profile_id: userProfile.creatorProfile.id,
    platform,
    handle,
    is_verified: true,
  });

  revalidatePath('/accounts');
  return { success: true };
}

export async function updateCreatorProfileAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) throw new Error('Unauthorized');

  const displayName = formData.get('displayName') as string;
  const bio = formData.get('bio') as string;
  const niches = formData.getAll('niches') as string[];

  const supabase = await createServerClient();
  await supabase
    .from('creator_profiles')
    .update({
      display_name: displayName,
      bio,
      niches,
    })
    .eq('id', userProfile.creatorProfile.id);

  revalidatePath('/settings');
  return { success: true };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/actions/creator.ts
git commit -m "feat: add Next.js Server Actions for creator workflows"
```

---

### Task 3: Build Creator Overview Route (`/dashboard`) & Components

**Files:**
- Modify: `app/dashboard/page.tsx`
- Create: `components/creator/overview/OverviewStatCards.tsx`
- Create: `components/creator/overview/FeaturedCampaignHeroCard.tsx`
- Create: `components/creator/overview/RecentActivityLedger.tsx`

- [ ] **Step 1: Create components under `components/creator/overview/`**
- [ ] **Step 2: Connect `app/dashboard/page.tsx` to `getCreatorOverviewData`**
- [ ] **Step 3: Verify build**
Run: `npm run build` or `npx tsc --noEmit`
- [ ] **Step 4: Commit**
```bash
git add app/dashboard/page.tsx components/creator/overview/
git commit -m "feat: implement modular creator overview dashboard page"
```

---

### Task 4: Build Creator Campaigns Routes (`/campaigns`, `/campaigns/[id]`) & Components

**Files:**
- Create: `app/(creator)/campaigns/page.tsx`
- Create: `app/(creator)/campaigns/[id]/page.tsx`
- Create: `components/creator/campaigns/CreatorCampaignsView.tsx`
- Create: `components/creator/campaigns/CreatorCampaignWorkspaceView.tsx`
- Create: `components/creator/campaigns/VideoSubmissionForm.tsx`

- [ ] **Step 1: Implement `/campaigns` page & view components**
- [ ] **Step 2: Implement `/campaigns/[id]` workspace page with video submission form action**
- [ ] **Step 3: Commit**
```bash
git add app/\(creator\)/campaigns/ components/creator/campaigns/
git commit -m "feat: implement creator campaigns list and submission workspace"
```

---

### Task 5: Build Creator Earnings Route (`/earnings`) & Components

**Files:**
- Create: `app/(creator)/earnings/page.tsx`
- Create: `components/creator/earnings/CreatorEarningsView.tsx`
- Create: `components/creator/earnings/BankAccountCard.tsx`
- Create: `components/creator/earnings/PayoutRequestModal.tsx`

- [ ] **Step 1: Implement `/earnings` page component and payout request modal**
- [ ] **Step 2: Commit**
```bash
git add app/\(creator\)/earnings/ components/creator/earnings/
git commit -m "feat: implement creator earnings and withdrawal page"
```

---

### Task 6: Build Creator Accounts & Settings Routes (`/accounts`, `/settings`)

**Files:**
- Create: `app/(creator)/accounts/page.tsx`
- Create: `app/(creator)/settings/page.tsx`
- Create: `components/creator/accounts/CreatorAccountsView.tsx`
- Create: `components/creator/settings/CreatorSettingsView.tsx`

- [ ] **Step 1: Implement `/accounts` and `/settings` pages**
- [ ] **Step 2: Commit**
```bash
git add app/\(creator\)/accounts/ app/\(creator\)/settings/ components/creator/accounts/ components/creator/settings/
git commit -m "feat: implement creator accounts and profile settings routes"
```
