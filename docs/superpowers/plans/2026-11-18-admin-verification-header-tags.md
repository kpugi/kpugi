# Dynamic Admin Site Verification & Header Tags Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dynamic, database-backed, and admin-manageable Site Verification & Header Tags system that renders `<meta>` tags and custom header snippets server-side into `kpugi.com`'s static HTML without requiring code changes or Vercel redeployments.

**Architecture:** Extend `PlatformSettings` in `lib/admin/platform-settings-service.ts` with a `siteVerification` configuration section. In `app/layout.tsx`, implement dynamic Next.js `generateMetadata()` that loads active verification meta tags from platform settings (backed by Supabase, local JSON, and Redis) and outputs them to `metadata.other`. In the Admin Settings Cockpit (`components/admin/settings/`), provide a dedicated "Verification & Tags" tab where admins can paste raw `<meta>` snippets (with auto-extraction) or custom scripts, toggle them on/off, and publish instantly with cache revalidation.

**Tech Stack:** Next.js 15 (App Router Server Components & `generateMetadata`), Supabase, Upstash Redis, React 19, Tailwind CSS, Lucide Icons, TailAdmin UI components.

---

### File Structure Map

- **Data Models & Service:**
  - Modify: `lib/admin/platform-settings-types.ts` — Add `SiteVerificationSettings`, `VerificationMetaTag`, `CustomHeaderScript`, and update `DEFAULT_SETTINGS` (including Profiton).
  - Modify: `lib/admin/platform-settings-service.ts` — Add helper functions `getSiteVerificationTags()` and ensure `siteVerification` key is handled in tiered fallback.
  - Modify: `app/actions/admin-settings.ts` — Add validation for `siteVerification` updates, path revalidation (`revalidatePath('/', 'layout')`), and Redis invalidation.

- **Server-Side Injection:**
  - Modify: `app/layout.tsx` — Switch from static `export const metadata: Metadata` to `export async function generateMetadata(): Promise<Metadata>`, loading active verification tags into `metadata.other`. Add `<DynamicHeaderScripts />` component for any custom raw header/body scripts.
  - Create: `components/common/DynamicHeaderScripts.tsx` — Server component rendering enabled custom scripts safely.

- **Admin UI & Management:**
  - Create: `components/admin/settings/tabs/SiteVerificationTab.tsx` — Cockpit tab with verification tags list, quick paste parser, status toggles, and custom header script editor.
  - Create: `components/admin/settings/modals/AddVerificationTagModal.tsx` — Modal for adding/editing meta tags with raw tag auto-parsing.
  - Modify: `components/admin/settings/SettingsCockpitManager.tsx` — Add "verification" tab to the cockpit navigation and wire dirty state / save action.

- **Testing & Verification:**
  - Create: `scratch/test-verification-tags.ts` — Test script that verifies settings persistence, metadata mapping, and raw HTML tag parsing.

---

### Task 1: Extend Platform Settings Types & Service for Site Verification

**Files:**
- Modify: `lib/admin/platform-settings-types.ts`
- Modify: `lib/admin/platform-settings-service.ts`
- Modify: `app/actions/admin-settings.ts`

- [ ] **Step 1: Add Site Verification interfaces to `lib/admin/platform-settings-types.ts`**

Add the following interfaces and update `PlatformSettings` and `DEFAULT_SETTINGS`:

```typescript
export interface VerificationMetaTag {
  id: string;
  name: string;
  content: string;
  serviceLabel: string;
  enabled: boolean;
  createdAt: string;
}

export interface CustomHeaderScript {
  id: string;
  label: string;
  code: string;
  placement: 'head' | 'body_start' | 'body_end';
  enabled: boolean;
  createdAt: string;
}

export interface SiteVerificationSettings {
  metaTags: VerificationMetaTag[];
  customScripts: CustomHeaderScript[];
}
```

Update `PlatformSettings`:
```typescript
export interface PlatformSettings {
  marketplace: MarketplaceSettings;
  browse: BrowseDiscoverySettings;
  campaigns: CampaignGovernanceSettings;
  users: CreatorUserPolicySettings;
  siteVerification: SiteVerificationSettings;
}
```

Add default entry in `DEFAULT_SETTINGS`:
```typescript
  siteVerification: {
    metaTags: [
      {
        id: 'profiton',
        name: 'profiton-domain-verification',
        content: 'c5f35696abf43999a5d813c1cba8b4fc6de687f7f9a3bd5942b315c54007cdfb',
        serviceLabel: 'Profiton',
        enabled: true,
        createdAt: new Date().toISOString(),
      },
    ],
    customScripts: [],
  },
```

- [ ] **Step 2: Update `lib/admin/platform-settings-service.ts` to include `siteVerification`**

In `getPlatformSettings()` merge logic:
```typescript
    siteVerification: {
      ...DEFAULT_SETTINGS.siteVerification,
      ...(localSettings.siteVerification || {}),
      ...(dbSettings.siteVerification || {}),
    },
```

- [ ] **Step 3: Update `app/actions/admin-settings.ts` to handle `siteVerification` revalidation**

In `updatePlatformSettingsAction`, when `category === 'siteVerification'`:
- Revalidate both `/admin/settings` and root `'/'` layout:
```typescript
  if (category === 'siteVerification') {
    revalidatePath('/', 'layout');
  }
```

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected output: Exited with code 0.

- [ ] **Step 5: Commit changes**

```bash
git add lib/admin/platform-settings-types.ts lib/admin/platform-settings-service.ts app/actions/admin-settings.ts
git commit -m "feat(settings): add siteVerification settings types and service handlers"
```

---

### Task 2: Server-Side Dynamic Metadata & Script Injection in `app/layout.tsx`

**Files:**
- Create: `components/common/DynamicHeaderScripts.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `components/common/DynamicHeaderScripts.tsx`**

Create a server component that safely outputs custom scripts based on placement:

```tsx
import React from 'react';
import { CustomHeaderScript } from '@/lib/admin/platform-settings-types';

interface DynamicHeaderScriptsProps {
  scripts?: CustomHeaderScript[];
  placement: 'head' | 'body_start' | 'body_end';
}

export function DynamicHeaderScripts({ scripts, placement }: DynamicHeaderScriptsProps) {
  if (!scripts || scripts.length === 0) return null;

  const active = scripts.filter((s) => s.enabled && s.placement === placement && s.code?.trim());
  if (active.length === 0) return null;

  return (
    <>
      {active.map((item) => (
        <div
          key={item.id}
          id={`custom-script-${item.id}`}
          dangerouslySetInnerHTML={{ __html: item.code }}
          style={{ display: 'contents' }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 2: Update `app/layout.tsx` to generate dynamic metadata with `metadata.other`**

Replace static `export const metadata: Metadata = { ... }` with `export async function generateMetadata(): Promise<Metadata>`:

```tsx
import { getPlatformSettings } from '@/lib/admin/platform-settings-service';
import { DynamicHeaderScripts } from '@/components/common/DynamicHeaderScripts';

export async function generateMetadata(): Promise<Metadata> {
  let otherMeta: Record<string, string> = {
    'profiton-domain-verification': 'c5f35696abf43999a5d813c1cba8b4fc6de687f7f9a3bd5942b315c54007cdfb',
  };

  try {
    const settings = await getPlatformSettings();
    if (settings.siteVerification?.metaTags) {
      for (const tag of settings.siteVerification.metaTags) {
        if (tag.enabled && tag.name && tag.content) {
          otherMeta[tag.name] = tag.content;
        }
      }
    }
  } catch (err) {
    console.warn('[RootLayout] Error fetching site verification settings:', err);
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Kpugi — Where a Post Turns into a Payout',
      template: '%s | Kpugi',
    },
    description: "Kpugi connects Nigerian brands with creators for paid ad placements on Instagram, TikTok, Facebook & more. Launch a campaign or get paid to post.",
    keywords: [
      'Kpugi',
      'Creator Marketplace Nigeria',
      'Influencer Marketplace Nigeria',
      'Nigeria Creators',
      'Paid Ad Placements',
      'WhatsApp Status Monetization',
      'TikTok Influencer Marketing Nigeria',
      'Instagram Creators Nigeria',
      'Find Influencers Nigeria',
      'Get Paid to Post',
      'Brand Creator Collaboration Nigeria',
      'Micro Influencer Marketing Nigeria',
    ],
    authors: [{ name: 'Kpugi' }],
    creator: 'Kpugi',
    openGraph: {
      type: 'website',
      locale: 'en_NG',
      url: siteUrl,
      title: 'Kpugi — Where a Post Turns into a Payout',
      description: 'Nigeria-first marketplace connecting advertisers with creators for paid ad placements.',
      siteName: 'Kpugi',
      images: [
        {
          url: '/kpugi_logo.png',
          width: 1200,
          height: 630,
          alt: 'Kpugi Marketplace',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kpugi — Where a Post Turns into a Payout',
      description: 'Nigeria-first marketplace connecting advertisers with creators for paid ad placements.',
      images: ['/kpugi_logo.png'],
      creator: '@kpugi_hq',
    },
    icons: {
      icon: '/kpugi_favicon.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Kpugi',
    },
    other: otherMeta,
  };
}
```

In `RootLayout`, fetch settings to render `<DynamicHeaderScripts>` in `<head>` and `<body>`:
```tsx
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPlatformSettings();
  const customScripts = settings.siteVerification?.customScripts || [];

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <DynamicHeaderScripts scripts={customScripts} placement="head" />
          {/* Google Tag Manager */}
...
        <body ...>
          <DynamicHeaderScripts scripts={customScripts} placement="body_start" />
          ...
          <DynamicHeaderScripts scripts={customScripts} placement="body_end" />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Run TypeScript verification**

Run: `npx tsc --noEmit`
Expected output: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add components/common/DynamicHeaderScripts.tsx app/layout.tsx
git commit -m "feat(layout): implement dynamic server-rendered verification meta tags and custom scripts"
```

---

### Task 3: Build Admin Verification & Header Tags UI

**Files:**
- Create: `components/admin/settings/modals/AddVerificationTagModal.tsx`
- Create: `components/admin/settings/tabs/SiteVerificationTab.tsx`
- Modify: `components/admin/settings/SettingsCockpitManager.tsx`

- [ ] **Step 1: Create `AddVerificationTagModal.tsx` with intelligent tag parsing**

Allow admins to either fill fields manually OR simply paste a full tag like:
`<meta name="profiton-domain-verification" content="abc123xyz" />`
The modal automatically parses `name` and `content` attributes using regex!

```tsx
// Auto parse helper
function parseMetaSnippet(raw: string): { name?: string; content?: string } {
  const nameMatch = raw.match(/name=["']([^"']+)["']/i);
  const contentMatch = raw.match(/content=["']([^"']+)["']/i);
  return {
    name: nameMatch ? nameMatch[1] : undefined,
    content: contentMatch ? contentMatch[1] : undefined,
  };
}
```

- [ ] **Step 2: Create `SiteVerificationTab.tsx`**

Provides:
- Header overview explaining that tags are injected server-side directly into the static HTML for crawlers and verification bots.
- "Add Verification Tag" button opening the modal.
- Table of Active Verification Meta Tags:
  - Columns: Service / Provider, Tag Name (`meta name`), Content (`content`), Status (Toggle enabled/disabled), Actions (Edit, Delete).
- Popular Presets: 1-click templates for Profiton, Google Search Console, Meta Domain Verification, Pinterest, Ahrefs, Bing.
- Custom Raw Header Scripts section (collapsible) for advanced `<script>` / `<link>` tags with placement selector (`<head>`, `<body> top`, `<body> bottom`).

- [ ] **Step 3: Wire `SiteVerificationTab` into `SettingsCockpitManager.tsx`**

- Add `"verification"` to `TabKey` type.
- Add tab button in navigation sidebar/header with `ShieldCheck` icon: `"Site Verification & Tags"`.
- Manage dirty state `isVerificationDirty`.
- Connect to `updatePlatformSettingsAction('siteVerification', currentVerificationSettings)`.
- Show success notification banner upon saving.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected output: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add components/admin/settings/
git commit -m "feat(admin): add Site Verification & Header Tags management tab to settings cockpit"
```

---

### Task 4: Automated Verification & Crawler Simulation Test

**Files:**
- Create: `scratch/test-site-verification.ts`

- [ ] **Step 1: Write test script to verify server metadata generation**

In `scratch/test-site-verification.ts`:
1. Call `getPlatformSettings()` and verify `siteVerification.metaTags` contains the default Profiton verification tag.
2. Call `generateMetadata()` (imported or simulated) and assert that `other['profiton-domain-verification'] === 'c5f35696abf43999a5d813c1cba8b4fc6de687f7f9a3bd5942b315c54007cdfb'`.
3. Add a mock Google verification tag (`google-site-verification: 'test-google-code'`), save to settings, re-fetch, and verify both tags are returned.
4. Clean up mock tag, preserving the Profiton tag.

- [ ] **Step 2: Run the test script**

Run: `npx tsx scratch/test-site-verification.ts`
Expected output: All assertions PASS.

- [ ] **Step 3: Run full type check**

Run: `npx tsc --noEmit`
Expected output: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add scratch/test-site-verification.ts
git commit -m "test: add verification test suite for dynamic metadata injection"
```
