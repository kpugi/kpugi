# Design Specification: AI & Search Engine Optimization (ai.txt, llms.txt & Dynamic Campaign Sitemap)

- **Date:** 2026-11-20
- **Author:** Antigravity & User Collaboration
- **Status:** Draft / Ready for Implementation

---

## 1. Overview & Objectives

As the search landscape evolves with AI engines (ChatGPT Search, Perplexity, Claude, Google AI Overviews) and traditional crawlers (Googlebot, Bingbot), Kpugi needs dedicated discoverability infrastructure.

This specification details three complementary components:
1. **`llms.txt`**: A markdown index for AI models, providing concise summaries of Kpugi's value proposition, CPM model, platform architecture, and canonical links.
2. **`ai.txt`**: An explicit policy declaration for AI web crawlers establishing permissions for indexing public campaigns while protecting authenticated user data.
3. **Dynamic Campaign Sitemap (`/sitemap-campaigns.xml`)**: A live XML sitemap route that automatically exposes all active/live campaigns under `/browse/[campaignId]` to search engines.
4. **Sitemap Indexing in `robots.ts`**: Declaring both the static core sitemap and the dynamic campaign sitemap to search engines.

---

## 2. Architecture & File Structure

```
Kpugi
├── public/
│   ├── llms.txt                  # Structured context for LLM agents & search
│   └── ai.txt                    # AI crawler permissions & RAG indexing policy
├── app/
│   ├── sitemap.ts                # Existing static routes (/brands, /creators, etc.)
│   ├── sitemap-campaigns.xml/
│   │   └── route.ts              # Real-time dynamic XML feed of /browse/[campaignId]
│   └── robots.ts                 # References both sitemap.xml and sitemap-campaigns.xml
```

---

## 3. Detailed Component Specifications

### 3.1 `public/llms.txt`
- **Location:** `public/llms.txt` (served at `https://kpugi.com/llms.txt`)
- **Format:** Clean GitHub-flavored Markdown following the `llms.txt` standard.
- **Key Sections:**
  - **Site Overview:** Purpose of Kpugi (Nigeria's leading performance-based creator ad network).
  - **Core Mechanism:** CPM compensation model, escrow guarantees, automated view auditing.
  - **Primary Links:** Direct markdown links to `/browse`, `/brands`, `/creators`, `/how-it-works`, `/pricing`, and `/faq`.
  - **Sitemaps:** References to `sitemap.xml` and `sitemap-campaigns.xml`.

### 3.2 `public/ai.txt`
- **Location:** `public/ai.txt` (served at `https://kpugi.com/ai.txt`)
- **Format:** Plain text policy directive.
- **Permissions:**
  - Allows search indexing, citation, and RAG retrieval for `/`, `/browse/*`, `/brands`, `/creators`, and core informational pages.
  - Disallows scraping of authenticated and sensitive routes (`/dashboard/`, `/wallet/`, `/api/`, `/admin/`, etc.).
  - Specifies preferred citation formatting back to `https://kpugi.com/browse/[campaignId]`.

### 3.3 Dynamic Campaign Sitemap (`/sitemap-campaigns.xml`)
- **Location:** `app/sitemap-campaigns.xml/route.ts`
- **HTTP Method:** `GET`
- **Data Source:** Supabase `campaigns` table using `createAdminClient()` from `@/lib/supabase/server`.
- **Query Filter:**
  - `status IN ('live', 'completed')`
  - `deleted = false`
  - Ordered by `updated_at DESC`
- **URL Schema:**
  - Target URL: `${baseUrl}/browse/${campaign.id}`
  - `<lastmod>`: Formatted ISO-8601 string of `campaign.updated_at` (falling back to `campaign.created_at`).
  - `<changefreq>`: `daily`
  - `<priority>`: `0.9`
- **Caching & Performance:**
  - Response headers include `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
  - Content-Type: `application/xml; charset=utf-8`.

### 3.4 Search Engine Robots Update (`app/robots.ts`)
- **Update:** Return an array of sitemaps pointing to both:
  1. `${baseUrl}/sitemap.xml` (Static marketing pages)
  2. `${baseUrl}/sitemap-campaigns.xml` (Dynamic creator campaigns)

---

## 4. Verification & Testing Plan

1. **Syntax & Type Checking:**
   - Run `npx tsc --noEmit` to ensure zero compilation or type errors.
2. **Local Route Verification:**
   - Test `GET /sitemap-campaigns.xml` to verify proper XML format, headers, and correct `/browse/[campaignId]` URLs.
   - Verify `GET /robots.txt` includes both sitemap references.
   - Verify `GET /llms.txt` and `GET /ai.txt` are served with correct headers.
3. **Validation Check:**
   - Ensure campaign URLs match the canonical structure used in `app/(marketing)/browse/[campaignId]/page.tsx`.
