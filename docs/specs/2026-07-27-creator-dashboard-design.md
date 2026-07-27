# Creator Dashboard Architecture & Design Spec

**Date:** July 27, 2026  
**Status:** Proposal / Design Spec  
**Target Platform:** Next.js (App Router), Supabase PostgreSQL, Clerk Auth, Paystack API  

---

## 1. Overview & Architecture Goals

The **Creator Dashboard** is the command center for content creators on Kpugi. It provides creators with:
1. **Campaign Discovery & Participation**: View joined campaigns, submit content video URLs, and track live view counts and audit logs.
2. **Financial Management**: Track total earnings, escrowed funds, available balance, bank account connection, and instant payout withdrawals.
3. **Social Account Verification**: Link social accounts (TikTok, Instagram, YouTube) with follower counts and engagement metrics.
4. **Profile & Preferences**: Manage creator niche categories, personal details, and payout settings.

### Core Architectural Decisions
- **Route Model**: Top-level clean routes (`/dashboard`, `/campaigns`, `/campaigns/[id]`, `/earnings`, `/accounts`, `/settings`).
- **Data Layer**: Server-rendered React Components fetching directly via Supabase query helpers in `lib/supabase/creator.ts`.
- **Mutations & Business Logic**: Typed Next.js Server Actions in `app/actions/creator.ts`.
- **UI Component Pattern**: Feature-scoped modular UI components under `components/creator/`.

---

## 2. Route Hierarchy & Page Breakdown

```
app/
├── (creator)/
│   ├── layout.tsx              # Auth Guard & Creator Shell Navigation Header/Sidebar
│   ├── campaigns/
│   │   ├── page.tsx            # Joined & Active Creator Campaigns List
│   │   └── [id]/
│   │       └── page.tsx        # Campaign Workspace, Video Submission & Live Audit
│   ├── earnings/
│   │   └── page.tsx            # Financial Hub, Balance Breakdown & Payouts
│   ├── accounts/
│   │   └── page.tsx            # Connected Social Media Handles
│   └── settings/
│       └── page.tsx            # Creator Profile, Niche & Notification Settings
└── dashboard/
    └── page.tsx                # Creator Command Center Overview
```

---

### Route 1: `/dashboard` — Creator Command Center (Overview)
- **File**: `app/dashboard/page.tsx`
- **Component**: `<CreatorDashboardView />`
- **Data Required**: `getCreatorOverviewData(creatorId)`
- **Key UI Sections**:
  - **Summary Stat Cards**:
    - Total Earned (₦)
    - Active Audits Count (📡)
    - Available Balance (₦)
  - **Featured Campaign Hero Card**: Displays the highest-priority active/pending submission with CTA to view details or submit link.
  - **Recent Activity Ledger**: Quick preview of last 5 video submissions with view metrics.
  - **Quick Action Bar**: Shortcuts to `/campaigns`, `/earnings`, and `/accounts`.

---

### Route 2: `/campaigns` — Creator Joined & Available Campaigns
- **File**: `app/(creator)/campaigns/page.tsx`
- **Component**: `<CreatorCampaignsView />`
- **Data Required**: `getCreatorCampaigns(creatorId, filter)`
- **Key UI Sections**:
  - **Filter Tabs**: `All`, `Active / Pending Audit`, `Completed / Paid`, `Saved Opportunities`.
  - **Campaign Cards Grid**:
    - Brand Name & Logo
    - Campaign Title & Platform Badge (TikTok / Reels / Shorts)
    - Rate Card (e.g. ₦1,200 per 1,000 views)
    - Creator Payout & Submission Status Badge (`Pending Review`, `Auditing`, `Approved`, `Paid`)
    - CTA Button: `Open Campaign Workspace`

---

### Route 3: `/campaigns/[id]` — Campaign Workspace & Video Submission
- **File**: `app/(creator)/campaigns/[id]/page.tsx`
- **Component**: `<CreatorCampaignWorkspaceView />`
- **Data Required**: `getCreatorCampaignDetails(creatorId, campaignId)`
- **Key UI Sections**:
  - **Campaign Brief**: Deliverables, sound audio link, required tags/hashtags, guidelines.
  - **Video Submission Form**:
    - Input: Video URL (TikTok / Instagram / YouTube)
    - Server Action: `submitCampaignVideoAction`
  - **Live Audit Metrics Panel**:
    - Current Verified Views count (scraped/polled)
    - Accrued Payout (₦) based on views rate
    - Escrow Lock status
    - Audit Logs & Last Checked Timestamp

---

### Route 4: `/earnings` — Financial Hub & Payout Requests
- **File**: `app/(creator)/earnings/page.tsx`
- **Component**: `<CreatorEarningsView />`
- **Data Required**: `getCreatorEarningsData(creatorId)`
- **Key UI Sections**:
  - **Balance Cards**:
    - Available Balance (₦) — Ready for transfer
    - Escrow Balance (₦) — Locked in active campaigns
    - Total Lifetime Payouts (₦)
  - **Bank Account Setup Card**:
    - Display current bank name, account number, verified account holder name.
    - Trigger Bank Setup Modal (`saveBankAccountAction` using Paystack account resolution API).
  - **Payout Request Modal / Trigger**:
    - Amount input with validation (Min: ₦1,000, Max: Available Balance).
    - Server Action: `requestPayoutAction`.
  - **Transaction History Table**:
    - Credit events (Campaign View Payouts, Escrow Releases).
    - Debit events (Payout Withdrawals to Bank).

---

### Route 5: `/accounts` — Connected Social Profiles
- **File**: `app/(creator)/accounts/page.tsx`
- **Component**: `<CreatorAccountsView />`
- **Data Required**: `getCreatorSocialAccounts(creatorId)`
- **Key UI Sections**:
  - **Social Accounts List**:
    - TikTok Handle (`@username`), Follower Count, Verification Badge.
    - Instagram Handle (`@username`), Follower Count, Verification Badge.
    - YouTube Channel, Subscriber Count.
  - **Connect Handle Dialog**:
    - Select Platform -> Enter Handle -> Server Action `linkSocialAccountAction`.
  - **Account Actions**: Re-verify handle metrics, unlink account.

---

### Route 6: `/settings` — Creator Profile & Niche Preferences
- **File**: `app/(creator)/settings/page.tsx`
- **Component**: `<CreatorSettingsView />`
- **Data Required**: `getCreatorProfileSettings(creatorId)`
- **Key UI Sections**:
  - **Public Creator Profile Form**:
    - Full Name / Display Name, Bio, Avatar image upload, Location/City.
  - **Content Niches & Categories**:
    - Multi-select badges (e.g. Comedy, Tech & Gadgets, Fashion, Lifestyle, Education, Gaming).
  - **Notification Preferences**:
    - Email / SMS alerts for campaign approvals, payout releases, audit milestones.
  - Server Action: `updateCreatorProfileAction`.

---

## 3. Data Services Layer (`lib/supabase/creator.ts`)

```typescript
// Core Data Fetching Contract for Creator Dashboard

export interface CreatorOverviewData {
  totalEarned: number;
  activeSubmissionsCount: number;
  availableBalance: number;
  pendingEscrow: number;
  featuredSubmission?: CreatorSubmission;
  recentActivity: CreatorActivity[];
}

export interface CreatorCampaignItem {
  id: string;
  title: string;
  brandName: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  ratePer1k: number;
  status: 'draft' | 'pending' | 'approved' | 'auditing' | 'completed' | 'rejected';
  submittedUrl?: string;
  viewsCount: number;
  earnedAmount: number;
}

export interface CreatorEarningsData {
  availableBalance: number;
  pendingEscrow: number;
  totalEarned: number;
  bankDetails?: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isVerified: boolean;
  };
  transactions: TransactionRecord[];
}

// Server Data Functions
export async function getCreatorOverviewData(creatorId: string): Promise<CreatorOverviewData>;
export async function getCreatorCampaigns(creatorId: string, filter?: string): Promise<CreatorCampaignItem[]>;
export async function getCreatorCampaignDetails(creatorId: string, campaignId: string);
export async function getCreatorEarningsData(creatorId: string): Promise<CreatorEarningsData>;
export async function getCreatorSocialAccounts(creatorId: string);
export async function getCreatorProfileSettings(creatorId: string);
```

---

## 4. Server Actions Layer (`app/actions/creator.ts`)

All user interactions that modify data utilize Next.js Server Actions with strict Clerk authentication and Supabase security rules.

| Server Action Name | Target Route | Description / Output |
| :--- | :--- | :--- |
| `submitCampaignVideoAction` | `/campaigns/[id]` | Validates video URL structure, inserts/updates `submissions` record, sets status to `pending`, revalidates path. |
| `requestPayoutAction` | `/earnings` | Validates creator balance, creates payout record, initiates transfer via Paystack API, updates wallet balance. |
| `saveBankAccountAction` | `/earnings` | Resolves bank account holder name via Paystack (`/bank/resolve`), saves bank details to creator profile. |
| `linkSocialAccountAction` | `/accounts` | Verifies social handle availability, inserts record into `creator_social_accounts`. |
| `updateCreatorProfileAction` | `/settings` | Updates creator bio, display name, content niches, and avatar URL. |

---

## 5. UI Component Hierarchy

```
components/
└── creator/
    ├── overview/
    │   ├── CreatorDashboardView.tsx
    │   ├── OverviewStatCards.tsx
    │   ├── FeaturedCampaignHeroCard.tsx
    │   └── RecentActivityLedger.tsx
    ├── campaigns/
    │   ├── CreatorCampaignsView.tsx
    │   ├── CreatorCampaignCard.tsx
    │   ├── CreatorCampaignWorkspaceView.tsx
    │   ├── VideoSubmissionForm.tsx
    │   └── LiveAuditMetricsPanel.tsx
    ├── earnings/
    │   ├── CreatorEarningsView.tsx
    │   ├── BalanceSummaryHeader.tsx
    │   ├── BankAccountCard.tsx
    │   ├── PayoutRequestModal.tsx
    │   └── TransactionLedgerTable.tsx
    ├── accounts/
    │   ├── CreatorAccountsView.tsx
    │   └── SocialAccountCard.tsx
    └── settings/
        └── CreatorSettingsView.tsx
```

---

## 6. Summary of Execution Plan

1. **Phase 1: Service Layer & Actions Foundation**
   - Create `lib/supabase/creator.ts` with complete type definitions and database queries.
   - Implement `app/actions/creator.ts` server actions.
2. **Phase 2: Route Pages & Layout Shell**
   - Set up route files (`/campaigns`, `/campaigns/[id]`, `/earnings`, `/accounts`, `/settings`).
3. **Phase 3: Modular UI Components**
   - Build components in `components/creator/` following design guidelines.
4. **Phase 4: Verification & Integration Testing**
   - Verify Server Actions, Paystack bank resolution, video submission flow, and balance calculation.
