# SEO: ai.txt, llms.txt & Dynamic Campaign Sitemap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide AI search engines (ChatGPT, Perplexity, Claude, Gemini) and traditional crawlers with high-quality discoverability by adding `llms.txt`, `ai.txt`, and a real-time dynamic campaign XML sitemap at `/sitemap-campaigns.xml`.

**Architecture:** Create static markdown context in `public/llms.txt` and policy directives in `public/ai.txt`. Implement a Next.js App Router Route Handler at `app/sitemap-campaigns.xml/route.ts` that dynamically queries live/completed campaigns from Supabase via `createAdminClient()`, generating a valid XML `<urlset>` with Edge/CDN caching headers. Update `app/robots.ts` to list both sitemaps.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase SSR client, XML sitemaps protocol.

---

### Task 1: Add `public/llms.txt` and `public/ai.txt`

**Files:**
- Create: `public/llms.txt`
- Create: `public/ai.txt`

- [ ] **Step 1: Create `public/llms.txt`**

Write standard markdown formatted for LLM knowledge consumption, summarizing Kpugi's platform, the CPM escrow model, creator monetization, and direct links to public pages:

```markdown
# Kpugi

> Kpugi is Nigeria's premier performance-based creator advertising network. Brands launch escrow-backed CPM campaigns, and verified creators earn guaranteed payouts per 1,000 verified views on TikTok, Instagram, and YouTube.

## Core Pages
- [Home](https://kpugi.com): Overview of Kpugi's creator monetization platform.
- [Browse Campaigns](https://kpugi.com/browse): Explore live brand campaigns with CPM rates, requirements, and total budgets.
- [For Brands & Advertisers](https://kpugi.com/brands): Launch performance campaigns, set CPM rates, and manage escrow funding.
- [For Creators](https://kpugi.com/creators): Join open campaigns, submit content links, and receive automated Paystack payouts.
- [How It Works](https://kpugi.com/how-it-works): Step-by-step guide to the campaign lifecycle and escrow verification.
- [Pricing & CPM Model](https://kpugi.com/pricing): Transparent pricing structure and CPM calculations.
- [FAQ](https://kpugi.com/faq): Answers to common creator and advertiser questions.

## How Kpugi Works
- **Performance Model:** Creators are compensated on a Cost Per Mille (CPM) model—earning a fixed rate per 1,000 verified post views.
- **Automated Verification:** View counts and post compliance are audited automatically via platform scrapers and APIs.
- **Escrow Protection:** Advertisers fund campaigns upfront into escrow, guaranteeing timely and safe creator payouts via Paystack.
- **Supported Channels:** TikTok, Instagram Reels & Stories, YouTube Shorts & Videos.

## Sitemaps & Feeds
- [Campaign Sitemap](https://kpugi.com/sitemap-campaigns.xml): Real-time XML index of all public creator campaigns.
- [Main Sitemap](https://kpugi.com/sitemap.xml): Index of all static marketing and documentation pages.
```

- [ ] **Step 2: Create `public/ai.txt`**

Write the AI crawler and RAG permissions policy:

```
# ai.txt - AI Crawler & Model Permissions for Kpugi (https://kpugi.com)
# Defines crawling, indexing, and data usage permissions for AI models and search engines.

User-agent: *
Allow: /
Allow: /browse
Allow: /browse/*
Allow: /brands
Allow: /creators
Allow: /how-it-works
Allow: /pricing
Allow: /faq
Allow: /about
Allow: /privacy
Allow: /terms
Allow: /llms.txt
Allow: /sitemap.xml
Allow: /sitemap-campaigns.xml

Disallow: /api/
Disallow: /c/
Disallow: /b/
Disallow: /dashboard/
Disallow: /settings/
Disallow: /wallet/
Disallow: /submissions/
Disallow: /accounts/
Disallow: /earnings/
Disallow: /onboarding/
Disallow: /admin/

# Permissions
Usage: Search, Summarization, Retrieval-Augmented Generation (RAG)
Attribution: Preferred (link to https://kpugi.com or specific /browse/[campaignId] URL)
Contact: support@kpugi.com
```

- [ ] **Step 3: Commit Task 1**

```bash
git add public/llms.txt public/ai.txt
git commit -m "feat(seo): add public/llms.txt and public/ai.txt for AI search indexing"
```

---

### Task 2: Implement Dynamic Campaign Sitemap Route Handler

**Files:**
- Create: `app/sitemap-campaigns.xml/route.ts`

- [ ] **Step 1: Create `app/sitemap-campaigns.xml/route.ts`**

Implement the Route Handler querying Supabase `campaigns` and serializing valid XML:

```typescript
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache on edge/CDN for 1 hour

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  try {
    const supabase = createAdminClient();

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, updated_at, created_at')
      .in('status', ['live', 'completed'])
      .eq('deleted', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[sitemap-campaigns.xml] Database error fetching campaigns:', error);
      throw error;
    }

    const campaignUrls = (campaigns || []).map((c) => {
      const lastModDate = c.updated_at || c.created_at;
      const lastMod = lastModDate ? new Date(lastModDate).toISOString() : new Date().toISOString();
      const loc = escapeXml(`${baseUrl}/browse/${c.id}`);

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${campaignUrls.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('[sitemap-campaigns.xml] Error generating campaign sitemap:', err);

    // Return empty valid XML fallback so crawlers do not crash
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
```

- [ ] **Step 2: Commit Task 2**

```bash
git add app/sitemap-campaigns.xml/route.ts
git commit -m "feat(seo): add dynamic campaign XML sitemap route handler"
```

---

### Task 3: Update `app/robots.ts` to Declare Both Sitemaps

**Files:**
- Modify: `app/robots.ts`

- [ ] **Step 1: Update `app/robots.ts`**

Update `sitemap` in `app/robots.ts` to return an array containing both `${baseUrl}/sitemap.xml` and `${baseUrl}/sitemap-campaigns.xml`:

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/c/',
          '/b/',
          '/dashboard/',
          '/settings/',
          '/wallet/',
          '/submissions/',
          '/accounts/',
          '/earnings/',
          '/onboarding/',
          '/admin/',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-campaigns.xml`,
    ],
  };
}
```

- [ ] **Step 2: Commit Task 3**

```bash
git add app/robots.ts
git commit -m "feat(seo): update robots.ts to declare core and dynamic campaign sitemaps"
```

---

### Task 4: Verification & Test Execution

**Files:**
- Create: `scratch/test-seo-sitemaps.ts`

- [ ] **Step 1: Create verification test script `scratch/test-seo-sitemaps.ts`**

Test query against Supabase to verify live/completed campaigns exist and serialize properly into XML:

```typescript
import { createAdminClient } from '../lib/supabase/server';

async function testSeoSitemaps() {
  console.log('Testing Campaign Sitemap query...');
  const supabase = createAdminClient();
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, title, updated_at, created_at, status')
    .in('status', ['live', 'completed'])
    .eq('deleted', false)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('FAILED to fetch campaigns:', error);
    process.exit(1);
  }

  console.log(`Found ${campaigns?.length || 0} eligible campaigns for sitemap.`);
  if (campaigns && campaigns.length > 0) {
    console.log('Sample entry:', {
      url: `https://kpugi.com/browse/${campaigns[0].id}`,
      status: campaigns[0].status,
      updated_at: campaigns[0].updated_at || campaigns[0].created_at,
    });
  }

  console.log('Test completed successfully.');
}

testSeoSitemaps().catch(console.error);
```

- [ ] **Step 2: Run verification script and TypeScript compile check**

Run:
```bash
npx tsx scratch/test-seo-sitemaps.ts
npx tsc --noEmit
```
Expected:
- Query successfully returns campaigns with 0 errors.
- `npx tsc --noEmit` exits with code 0.

- [ ] **Step 3: Cleanup scratch file and commit**
