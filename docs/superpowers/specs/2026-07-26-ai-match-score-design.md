# AI Match Score (AI MS) Engine — Technical Design Document

**Date:** 2026-07-26  
**Status:** Approved by User  
**Target Engine:** Google Gemini Embeddings (`text-embedding-004`, 768 dimensions) + Supabase `pgvector`

---

## 1. Overview & Core Business Context

Kpugi is a viral creator marketing platform powered by performance-based CPM escrow payouts.

### Base Platform Business Rules
* **Base CPM Rate:** ₦2,000 / 1K views.
* **Creative Asset Ownership:** Brands provide 100% of creative assets (ready-to-use video/media files, copy, and caption suggestions). Creators download/access the brand's creative asset, upload it onto their connected social handles (TikTok, Instagram, X), and drive views.
* **AI Match Score Purpose:** Calculate semantic alignment between a creator's profile/niche/history and a brand's campaign requirements, surfacing a personalized `% Match` score to help creators instantly discover high-converting brand campaigns.

---

## 2. System Architecture & Data Flow

```
┌───────────────────────────────────────┐         ┌───────────────────────────────────────┐
│        Advertiser Campaign            │         │            Creator Profile            │
│ (Title, Description, Channels, Format)│         │   (Display Name, Bio, Niche Tags)    │
└──────────────────┬────────────────────┘         └──────────────────┬────────────────────┘
                   │                                                 │
                   ▼                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    Google Gemini Embeddings (`text-embedding-004`)                       │
│                                (768 Dimensions)                                         │
└──────────────────┬─────────────────────────────────────────────────┬────────────────────┘
                   │                                                 │
                   ▼                                                 ▼
┌───────────────────────────────────────┐         ┌───────────────────────────────────────┐
│     campaigns.embedding vector(768)   │         │ creator_profiles.embedding vector(768)│
└──────────────────┬────────────────────┘         └──────────────────┬────────────────────┘
                   │                                                 │
                   └─────────────────────────┬───────────────────────┘
                                             │
                                             ▼
                         ┌───────────────────────────────────────┐
                         │   Supabase `pgvector` Cosine Math     │
                         │   1 - (creator <=> campaign) * 100    │
                         └──────────────────┬────────────────────┘
                                             │
                                             ▼
                         ┌───────────────────────────────────────┐
                         │         AI Match Score (e.g. 94%)       │
                         └───────────────────────────────────────┘
```

---

## 3. Database Schema & Migration Specs

### Migration (`supabase/migrations/20260726_ai_match_score.sql`)

```sql
-- 1. Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column (768-dim for Google Gemini text-embedding-004)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create index for fast vector search
CREATE INDEX IF NOT EXISTS campaigns_embedding_idx ON campaigns 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 4. RPC Function for Creator Campaign Matching
CREATE OR REPLACE FUNCTION get_campaign_match_score(
  p_creator_id UUID,
  p_campaign_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_emb vector(768);
  v_campaign_emb vector(768);
  v_similarity FLOAT;
BEGIN
  SELECT embedding INTO v_creator_emb FROM creator_profiles WHERE profile_id = p_creator_id;
  SELECT embedding INTO v_campaign_emb FROM campaigns WHERE id = p_campaign_id;

  IF v_creator_emb IS NULL OR v_campaign_emb IS NULL THEN
    RETURN 75; -- Fallback default score if embeddings not yet calculated
  END IF;

  v_similarity := 1 - (v_creator_emb <=> v_campaign_emb);
  RETURN GREATEST(10, LEAST(99, ROUND(v_similarity * 100)));
END;
$$;
$$;
```

---

## 4. API & Integration Layer

1. **`lib/ai/embeddings.ts`**:
   * Uses `@google/genai` or Google Gemini REST API (`text-embedding-004`).
   * Utility functions: `generateCampaignEmbedding(campaignData)` and `generateCreatorEmbedding(creatorData)`.

2. **`/api/campaigns/route.ts` Update**:
   * Accepts optional logged-in `creatorId`.
   * Attaches `match_score` calculated via `get_campaign_match_score` for each campaign returned.

3. **Environment Setup**:
   * `GEMINI_API_KEY`: Required in `.env.local` for embedding generation.

---

## 5. UI/UX Implementation Details

### A. Camps Browse Page (`app/(marketing)/browse/page.tsx` & `CampaignCard.tsx`)
* **Match Badges on Cards:**
  * **High Match (≥ 85%):** Emerald-cyan gradient badge with subtle glow (`✨ 94% AI Match`).
  * **Moderate Match (65–84%):** Slate-blue pill (`⚡ 74% Match`).
  * **Low Match (< 65%):** Muted slate tag (`55% Match`).
* **Toolbar Sort Dropdown:**
  * Option to sort campaigns by **"Highest AI Match"**.

### B. Camps Deets (Details) Page (`components/dashboard/CreatorCampaignDetailsView.tsx`)
* **Hero Placement:**
  * The prominent **AI Match Score Badge** is rendered directly **next to the Join Campaign button** in the hero header.
* **Overview Tab:**
  * **"AI Compatibility Breakdown"** widget displaying:
    * Matching score ring.
    * Matching criteria tags (e.g. `🎯 Niche Fit: Finance & Tech`, `📱 Channels: TikTok & Instagram`).
    * Clear verification note confirming creator audience fit for the brand's ready-to-use creative.

---

## 6. Verification & Test Plan

1. **Database Migration Verification:** Execute SQL script against Supabase instance and verify column creation.
2. **Embedding Generation Test:** Trigger embedding generation with Gemini API key and confirm 768-dimension vectors populate in Supabase.
3. **UI Verification:** Test `/browse` and `/browse/[campaignId]` pages with creator session to verify badge rendering next to the Join Campaign button and toolbar sorting.
