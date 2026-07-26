# Skeleton Loading & Streaming Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create instant 0ms shimmer pulse loading skeletons and Next.js 15 Suspense streaming boundaries for the Camps Browse and Campaign Details pages.

**Architecture:** A reusable component suite `components/ui/Skeletons.tsx` containing `FeaturedHeroSkeleton`, `CampaignCardSkeleton`, `CampaignGridSkeleton`, and `CampaignDetailsSkeleton`. Next.js 15 streaming route fallbacks `app/(marketing)/browse/loading.tsx` and `app/browse/[campaignId]/loading.tsx` display these skeletons instantly on page load/navigation.

**Tech Stack:** Next.js 15 (React Suspense, App Router), Tailwind CSS (`animate-pulse`).

---

## Task 1: Create Reusable Skeleton Component Suite (`components/ui/Skeletons.tsx`)

**Files:**
- Create: `components/ui/Skeletons.tsx`

- [ ] **Step 1: Write `components/ui/Skeletons.tsx`**

```tsx
import React from 'react';

export function FeaturedHeroSkeleton() {
  return (
    <div className="relative w-full h-[420px] sm:h-[500px] overflow-hidden mb-10 bg-[#090A0F] border-b border-white/5 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/80 to-transparent z-10" />
      <div className="max-w-7xl mx-auto w-full h-full px-6 sm:px-12 pb-10 sm:pb-14 flex items-end justify-between relative z-20">
        <div className="space-y-4 max-w-xl w-full">
          <div className="h-6 w-36 bg-white/10 rounded-full" />
          <div className="h-12 w-3/4 bg-white/10 rounded-2xl" />
          <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
          <div className="h-12 w-40 bg-white/10 rounded-full pt-4" />
        </div>
      </div>
    </div>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col bg-[#12141A] rounded-2xl overflow-hidden border border-white/5 animate-pulse h-[360px]">
      <div className="h-[180px] w-full bg-white/5 relative" />
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/10" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-white/10" />
            <div className="w-5 h-5 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-6 w-16 bg-white/10 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function CampaignGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CampaignDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B1026] text-white flex flex-col font-sans animate-pulse">
      {/* Header */}
      <div className="h-16 border-b border-white/5 bg-[#0B1026] px-6 flex items-center justify-between">
        <div className="h-6 w-24 bg-white/10 rounded" />
        <div className="h-8 w-28 bg-white/10 rounded-full" />
      </div>

      {/* Hero Banner */}
      <div className="w-full h-[320px] bg-white/5 px-6 py-12 flex flex-col justify-end">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-end">
          <div className="space-y-4 max-w-xl w-full">
            <div className="h-8 w-44 bg-white/10 rounded-full" />
            <div className="h-10 w-3/4 bg-white/10 rounded-2xl" />
            <div className="h-4 w-1/3 bg-white/5 rounded" />
          </div>
          <div className="h-12 w-36 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
        <div className="flex gap-6 border-b border-white/5 pb-3">
          <div className="h-4 w-20 bg-white/10 rounded" />
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-[#0B1021] border border-white/5 rounded-3xl p-6" />
            <div className="h-32 bg-white/5 rounded-2xl" />
          </div>
          <div className="h-64 bg-white/5 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit skeleton component suite**

```bash
git add components/ui/Skeletons.tsx
git commit -m "feat(ui): add Skeletons suite for Hero, Campaign Cards, Grid, and Details page"
```

---

## Task 2: Create Next.js Streaming Route Fallbacks (`loading.tsx`)

**Files:**
- Create: `app/(marketing)/browse/loading.tsx`
- Create: `app/browse/[campaignId]/loading.tsx`

- [ ] **Step 1: Write `app/(marketing)/browse/loading.tsx`**

```tsx
import React from 'react';
import { FeaturedHeroSkeleton, CampaignGridSkeleton } from '@/components/ui/Skeletons';

export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-[#090A0F] font-sans pb-16">
      <FeaturedHeroSkeleton />
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-12 w-full md:w-[320px] bg-white/5 rounded-full animate-pulse" />
          <div className="h-12 w-64 bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
        <CampaignGridSkeleton count={8} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/browse/[campaignId]/loading.tsx`**

```tsx
import React from 'react';
import { CampaignDetailsSkeleton } from '@/components/ui/Skeletons';

export default function CampaignDetailsLoading() {
  return <CampaignDetailsSkeleton />;
}
```

- [ ] **Step 3: Commit streaming route fallbacks**

```bash
git add "app/(marketing)/browse/loading.tsx" "app/browse/[campaignId]/loading.tsx"
git commit -m "feat(routing): add Next.js Suspense streaming loading.tsx boundaries"
```

---

## Task 3: Update Browse Page Client State Loading (`app/(marketing)/browse/page.tsx`)

**Files:**
- Modify: `app/(marketing)/browse/page.tsx`

- [ ] **Step 1: Replace spinner with `CampaignGridSkeleton` in `app/(marketing)/browse/page.tsx`**

```tsx
import { CampaignGridSkeleton } from '@/components/ui/Skeletons';

{/* Replace spinner with CampaignGridSkeleton */}
{isLoading ? (
  <CampaignGridSkeleton count={8} />
) : filtered.length > 0 ? (
...
```

- [ ] **Step 2: Commit Browse page update**

```bash
git add "app/(marketing)/browse/page.tsx"
git commit -m "feat(ui): replace loading spinner with CampaignGridSkeleton in browse page"
```

---

## Verification & Final Review

- [ ] Run `npm run build` to verify clean build without typescript or routing errors.
- [ ] Test navigating to `/browse` and `/browse/[campaignId]` to verify 0ms instant shimmer presentation.
