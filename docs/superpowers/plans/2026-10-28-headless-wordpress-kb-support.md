# Headless WordPress Knowledge Base & Support Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy Freshdesk integration with a fast, SEO-optimized native Knowledge Base and Help Center in Kpugi powered by Headless WordPress via REST API with Incremental Static Regeneration (ISR).

**Architecture:** A decoupled headless CMS architecture where WordPress serves as the editorial content management system for guides, compliance rules, FAQs, and articles. The Next.js frontend fetches content via the WordPress REST API (`/wp-json/wp/v2/`), caches it at the edge using Next.js tag-based ISR (`revalidateTag`), and provides native, fast search, article viewing, and support ticketing without sending users to a third-party paid portal.

**Tech Stack:** Next.js 15 (App Router, Server Components, ISR), WordPress REST API (v2), TypeScript, Tailwind CSS, Lucide Icons, Clerk (authenticated support context).

---

## File Structure & Responsibilities

```
lib/
├── wordpress/
│   ├── types.ts                # TypeScript interfaces for WP posts, categories, tags, search
│   ├── client.ts               # Core WP REST API client with caching, error handling & fallbacks
│   └── mock-data.ts            # Offline seed fallback content for rules and core guides
app/
├── (marketing)/
│   ├── help/
│   │   ├── page.tsx            # Help Center / KB Home (Hero search, category grid, top guides)
│   │   ├── [category]/
│   │   │   └── page.tsx        # Category article listing & breadcrumbs
│   │   └── [category]/[slug]/
│   │       └── page.tsx        # Individual article view with TOC, feedback & related guides
│   ├── rules/
│   │   └── page.tsx            # Compliance & platform rules (rendered natively from WP)
│   └── contact/
│       └── page.tsx            # Updated contact page with ticket routing
├── api/
│   ├── support/
│   │   └── ticket/
│   │       └── route.ts        # Server endpoint to submit support inquiries/tickets
│   └── webhooks/
│       └── wordpress/
│           └── route.ts        # On-demand ISR revalidation webhook for instant WP edits
components/
├── support/
│   ├── HelpSearchBar.tsx       # Live search input with debounced results dropdown
│   ├── ArticleTableOfContents.tsx # Auto-generated sticky TOC from headings
│   ├── ArticleFeedback.tsx     # "Was this helpful?" rating widget
│   ├── SupportContactModal.tsx # In-app ticket submission dialog
│   └── NativeSupportLauncher.tsx # Replaces Freshdesk floating widget with native helper
```

---

## Task 1: WordPress REST API Client & Types

**Files:**
- Create: `lib/wordpress/types.ts`
- Create: `lib/wordpress/mock-data.ts`
- Create: `lib/wordpress/client.ts`
- Modify: `.env.example`
- Modify: `.env.local`

- [ ] **Step 1: Define TypeScript schemas for Headless WordPress**
  Define types for `WPPost`, `WPCategory`, `WPTag`, `WPSearchResult`, `WPMedia`, `SupportTicketPayload`, and UI view shapes in `lib/wordpress/types.ts`.

- [ ] **Step 2: Create offline mock fallback data**
  Create `lib/wordpress/mock-data.ts` containing default articles (Platform Compliance Rules, Advertiser Escrow & Billing, Creator Verification & Submissions, Payment FAQs) so the app builds and works even before or during WordPress connectivity.

- [ ] **Step 3: Implement `lib/wordpress/client.ts`**
  Implement helper functions:
  - `getWPCategories()`: Fetches list of categories with article counts.
  - `getWPPosts(params)`: Fetches paginated posts with category filtering.
  - `getWPPostBySlug(slug)`: Fetches post content, rendered HTML, excerpt, and author.
  - `getWPRulesPost()`: Specific fetcher for platform rules with fallback to mock data.
  - `searchWPPosts(query)`: Uses `/wp-json/wp/v2/posts?search=...`.
  - Next.js ISR integration with `{ next: { tags: ['wordpress', 'kb'], revalidate: 300 } }`.

- [ ] **Step 4: Update environment configurations**
  Add to `.env.example` and `.env.local`:
  - `NEXT_PUBLIC_WORDPRESS_URL=https://support.kpugi.com` (or user's WP domain)
  - `WORDPRESS_REVALIDATE_SECRET=wp_sec_...`
  - `WORDPRESS_APP_PASSWORD=` (optional for authenticated admin draft preview)

- [ ] **Step 5: Test client and verification**
  Run `npx tsc --noEmit` to confirm complete type safety.

---

## Task 2: Native Help Center & Knowledge Base Routes

**Files:**
- Create: `app/(marketing)/help/page.tsx`
- Create: `app/(marketing)/help/[category]/page.tsx`
- Create: `app/(marketing)/help/[category]/[slug]/page.tsx`
- Modify: `app/(marketing)/rules/page.tsx`

- [ ] **Step 1: Build the Help Center Home (`/help`)**
  - Hero section with live search bar.
  - Grid of Knowledge Base categories (e.g. "Getting Started", "Advertiser & Escrow", "Creator Payouts", "Rules & Compliance", "Troubleshooting").
  - "Popular Articles" and "Recent Updates" sections.
  - "Need more help?" card pointing to the support contact form.

- [ ] **Step 2: Build the Category Listing Page (`/help/[category]`)**
  - Displays category title, description, and list of articles.
  - Breadcrumbs navigation (`Home > Help Center > Category`).
  - Read-time estimation and last-updated timestamp.

- [ ] **Step 3: Build the Individual Article View (`/help/[category]/[slug]`)**
  - Semantic article markup with SEO meta tags (OpenGraph, Article JSON-LD).
  - Sticky table of contents generated from `<h2>` and `<h3>` tags.
  - Prose styled content with responsive typography and styled code/quotes.
  - "Was this article helpful?" interactive thumbs up/down widget.
  - "Related articles" section at the bottom.

- [ ] **Step 4: Update `/rules` page to render natively**
  - Modify `app/(marketing)/rules/page.tsx` from an external redirect into a native, beautifully formatted server-rendered compliance page powered by the WordPress rules post (with fallback to local rules).

- [ ] **Step 5: Verify route generation**
  Run `npm run build` and ensure `/help`, `/help/[category]`, `/help/[category]/[slug]`, and `/rules` generate cleanly.

---

## Task 3: Support Inquiries & Ticket Submission

**Files:**
- Create: `app/api/support/ticket/route.ts`
- Create: `components/support/SupportContactModal.tsx`
- Modify: `app/(marketing)/contact/page.tsx`

- [ ] **Step 1: Build Support Ticket API Endpoint**
  - Create `app/api/support/ticket/route.ts`.
  - Accepts user email, name, role (creator / advertiser / guest), category, subject, and message.
  - Stores ticket record in database or forwards to WordPress / support notification email.
  - Returns structured response with ticket reference ID (`KPG-SUP-XXXXXX`).

- [ ] **Step 2: Create in-app `SupportContactModal`**
  - Accessible from dashboard navigation, user menu, and KB article footers.
  - Auto-fills user name and email from Clerk session if signed in.
  - Provides instant confirmation with ticket ID and estimated response time.

- [ ] **Step 3: Update `/contact` marketing page**
  - Hook the contact form directly to `/api/support/ticket`.
  - Provide quick links to the most common help center topics before submission to reduce support volume.

---

## Task 4: On-Demand ISR Cache Invalidation Webhook

**Files:**
- Create: `app/api/webhooks/wordpress/route.ts`

- [ ] **Step 1: Create the WordPress webhook handler**
  - Create `app/api/webhooks/wordpress/route.ts`.
  - Validates `secret` parameter against `WORDPRESS_REVALIDATE_SECRET`.
  - Calls `revalidateTag('wordpress')` and `revalidatePath('/help')`, `revalidatePath('/rules')`.
  - Returns `{ revalidated: true, timestamp: Date.now() }`.

- [ ] **Step 2: Test revalidation endpoint**
  - Verify webhook returns `401 Unauthorized` without secret, and `200 OK` with valid secret.

---

## Task 5: Deprecate Freshdesk & Clean Up Global Navigation

**Files:**
- Modify: `lib/support/freshdesk-constants.ts` (alias to native `/help` & `/rules`)
- Modify: `lib/support/freshdesk.ts`
- Modify: `components/support/FreshdeskSupportProvider.tsx` -> convert to `NativeSupportLauncher.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/layout/Footer.tsx`
- Modify: `components/dashboard/DashboardFooter.tsx`
- Modify: `components/dashboard/DashboardLayoutShell.tsx`
- Modify: `components/onboarding/TourHelpMenu.tsx`
- Modify: `components/marketing/ContactBlock.tsx`

- [ ] **Step 1: Point all support links to native paths**
  Update `FRESHDESK_LINKS` object to point to internal routes:
  - `home`: `/help`
  - `knowledgeBase`: `/help`
  - `rules`: `/rules`
  - `brandRules`: `/rules`
  - `submitTicket`: `/contact`
  - `statusPage`: `/status`

- [ ] **Step 2: Replace `FreshdeskSupportProvider` with native support helper**
  - Remove external Freshdesk widget script injection (`widgetId`, `fcWidgetMessengerConfig`, Freshworks script tags).
  - Provide lightweight native launcher triggering `SupportContactModal` or linking directly to `/help`.

- [ ] **Step 3: Remove obsolete Freshdesk environment variables**
  - Deprecate `NEXT_PUBLIC_FRESHDESK_PORTAL_URL`, `NEXT_PUBLIC_FRESHDESK_TOKEN`, `NEXT_PUBLIC_FRESHDESK_WIDGET_ID`.

---

## Task 6: Verification & End-to-End Readiness

- [ ] **Step 1: Full TypeScript check**
  Run: `npx tsc --noEmit`
  Expected: 0 errors.

- [ ] **Step 2: Production Build check**
  Run: `npm run build`
  Expected: Clean build with all 77+ routes static/dynamic without errors.

- [ ] **Step 3: WordPress Live Connection Checklist**
  Provide user with:
  1. WordPress domain URL (e.g. `https://support.kpugi.com` or custom WP install).
  2. Recommended WP setup (Categories, Tags, Post format).
  3. Webhook URL configuration in WordPress (`https://kpugi.com/api/webhooks/wordpress?secret=...`).

