# Skeleton Loading & Streaming Boundaries — Technical Design Document

**Date:** 2026-07-26  
**Status:** Approved by User  
**Target:** Instant 0ms Shimmer Skeletons + Next.js 15 Suspense Streaming Boundaries

---

## 1. Problem Statement & Objectives

Currently, when loading `/browse` or `/browse/[campaignId]`, the page renders a dark empty void with a single tiny blue spinner, creating visual pop-in and layout instability on mobile web connections.

### Goals
* Eliminate the black void and spinner during page loads.
* Render instant, full-structure **Shimmer Pulse Skeletons** in 0ms using Next.js 15 Suspense streaming boundaries (`loading.tsx`).
* Maintain smooth visual continuity across `/browse` (hero carousel, toolbar, card grid) and `/browse/[campaignId]` (hero banner, tab bar, AI Live Intelligence sync card, right sidebar budget card).

---

## 2. Component Structure & Architecture

### A. Modular Skeleton Component Suite (`components/ui/Skeletons.tsx`)

1. **`FeaturedHeroSkeleton`:**
   * Full-bleed banner matching the `420px` height of `FeaturedHero`.
   * Shimmering pulse placeholders (`animate-pulse bg-white/5 border border-white/5`) for the brand badge, title headline (2 lines), category stats, and CTA button.

2. **`CampaignCardSkeleton`:**
   * Matches exact dimensions and rounded corners (`rounded-2xl bg-[#12141A]`) of `CampaignCard`.
   * `180px` thumbnail placeholder block.
   * Brand avatar circle (`w-5 h-5`), brand name bar, and platform icon circles.
   * 2-line title placeholder & bottom budget progress bar.

3. **`CampaignGridSkeleton`:**
   * Renders an 8-card responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`) of `CampaignCardSkeleton`.

4. **`CampaignDetailsSkeleton`:**
   * Full-bleed hero banner skeleton with avatar, title, and CTA button placeholders.
   * Tab navigation bar skeleton.
   * **AI-Powered Sync Card skeleton:** 3-column layout matching the new `AI-Powered Sync` Live Intelligence widget (left text blocks, center radial gauge circle, right metric tiles).
   * Right sidebar budget card skeleton.

---

## 3. Streaming Fallback Routes (`loading.tsx`)

1. **`app/(marketing)/browse/loading.tsx`**:
   * Executed automatically by Next.js in 0ms when loading `/browse`.
   * Renders `FeaturedHeroSkeleton` + search toolbar placeholder + `CampaignGridSkeleton`.

2. **`app/browse/[campaignId]/loading.tsx`**:
   * Executed automatically when clicking into any campaign details page.
   * Renders `CampaignDetailsSkeleton`.

---

## 4. Client State Refetch Polish (`app/(marketing)/browse/page.tsx`)

* Replaces client-side loading spinner `<span className="loading loading-spinner">` with `<CampaignGridSkeleton count={8} />` for smooth client-side filtering transitions.

---

## 5. Verification Plan

1. **Build Validation:** Run `npm run build` to verify Next.js Suspense streaming boundaries compile without errors.
2. **Mobile Browser Testing:** Open `/browse` and `/browse/[campaignId]` to verify instant shimmer presentation without layout shifts.
