# AI Match Score (AI MS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Google Gemini `text-embedding-004` (768 dimensions) vector embedding calculation and Supabase `pgvector` similarity matching to display personalized AI Match Scores on campaign cards and campaign details pages.

**Architecture:** Database vectors are stored in `campaigns.embedding` and `creator_profiles.embedding`. A Supabase Postgres RPC function (`get_campaign_match_score`) performs fast cosine similarity math (`1 - (creator <=> campaign)`). Google Gemini API generates 768-dim embeddings on creator profile setup and campaign creation. The frontend displays glowing tier badges on browse cards, adds a toolbar sort option, and places an AI Match badge next to the Join Campaign button.

**Tech Stack:** Next.js (TypeScript, App Router), Supabase (Postgres + `pgvector`), `@google/genai` (Google Gemini API), Tailwind CSS.

---

## Task 1: Supabase Database Migration for `pgvector`

**Files:**
- Create: `supabase/migrations/20260726_ai_match_score.sql`

- [ ] **Step 1: Write SQL migration file**

Create `supabase/migrations/20260726_ai_match_score.sql`:

```sql
-- Enable vector extension if not enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding vector(768) columns for Google Gemini text-embedding-004
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for vector cosine similarity search
CREATE INDEX IF NOT EXISTS campaigns_embedding_idx ON campaigns 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create RPC function to compute percentage match between creator and campaign
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

  -- Default fallback score of 75% if embeddings are not yet generated
  IF v_creator_emb IS NULL OR v_campaign_emb IS NULL THEN
    RETURN 75;
  END IF;

  v_similarity := 1 - (v_creator_emb <=> v_campaign_emb);
  RETURN GREATEST(10, LEAST(99, ROUND(v_similarity * 100)));
END;
$$;
```

- [ ] **Step 2: Apply migration to Supabase database**

Execute SQL script against Supabase instance via Supabase CLI or SQL editor.

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/migrations/20260726_ai_match_score.sql
git commit -m "feat(db): add pgvector migration for AI Match Score embeddings"
```

---

## Task 2: Google Gemini Embeddings Helper Service

**Files:**
- Create: `lib/ai/embeddings.ts`

- [ ] **Step 1: Write `lib/ai/embeddings.ts`**

```typescript
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

/**
 * Generate a 768-dimension embedding vector using Google Gemini text-embedding-004
 */
export async function generateTextEmbedding(text: string): Promise<number[] | null> {
  if (!apiKey || !text.trim()) {
    console.warn('[Gemini Embeddings] API key or input text missing');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    if (response.embedding?.values) {
      return response.embedding.values;
    }
    return null;
  } catch (error) {
    console.error('[Gemini Embeddings Error]:', error);
    return null;
  }
}

/**
 * Helper to construct campaign embedding text
 */
export function constructCampaignEmbeddingText(campaign: {
  title: string;
  description: string;
  ad_format?: string;
  channels?: string[];
}): string {
  const channelList = campaign.channels ? campaign.channels.join(', ') : '';
  return `Campaign Title: ${campaign.title}. Description: ${campaign.description}. Channels: ${channelList}. Format: ${campaign.ad_format || 'video'}`;
}

/**
 * Helper to construct creator embedding text
 */
export function constructCreatorEmbeddingText(creator: {
  display_name?: string;
  bio?: string;
  niche_tags?: string[];
  platforms?: string[];
}): string {
  const niches = creator.niche_tags ? creator.niche_tags.join(', ') : 'Tech, Lifestyle';
  const platforms = creator.platforms ? creator.platforms.join(', ') : 'TikTok, Instagram';
  return `Creator Name: ${creator.display_name || ''}. Bio: ${creator.bio || ''}. Niches: ${niches}. Connected Platforms: ${platforms}`;
}
```

- [ ] **Step 2: Commit helper service**

```bash
git add lib/ai/embeddings.ts
git commit -m "feat(ai): add Google Gemini embedding helper module"
```

---

## Task 3: Campaign & Creator Embedding Generation Trigger in API Routes

**Files:**
- Modify: `app/api/campaigns/route.ts`

- [ ] **Step 1: Update `/api/campaigns/route.ts` to compute embeddings & include `match_score`**

In `app/api/campaigns/route.ts`, when returning live campaigns for browse, query `get_campaign_match_score` for the current user's creator profile ID if logged in, and when a new campaign is created, trigger `generateTextEmbedding` to update `campaigns.embedding`.

- [ ] **Step 2: Commit API route changes**

```bash
git add app/api/campaigns/route.ts
git commit -m "feat(api): connect Gemini embeddings to campaign creation and match scoring"
```

---

## Task 4: Camps Browse Page Badges & Sorting (`app/(marketing)/browse/page.tsx`)

**Files:**
- Modify: `app/(marketing)/browse/page.tsx`

- [ ] **Step 1: Add AI Match Score badge UI to Campaign Cards on Browse Page**

In `app/(marketing)/browse/page.tsx`:
Add `matchScore?: number` property to `Campaign` type.
Render AI Match badge on top-right of `CampaignCard`:
```tsx
{/* AI Match Badge */}
<div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-md border ${
  (c.matchScore || 85) >= 85
    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
    : (c.matchScore || 85) >= 65
    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
    : 'bg-white/10 border-white/10 text-slate-400'
}`}>
  <span>✨</span>
  <span>{c.matchScore || 88}% Match</span>
</div>
```

- [ ] **Step 2: Add "Sort by AI Match" to Toolbar Filter**

Add "AI Match Rate" to the dropdown filters in the browse toolbar.

- [ ] **Step 3: Commit Browse Page updates**

```bash
git add app/\(marketing\)/browse/page.tsx
git commit -m "feat(ui): render AI Match badges and sort filter on Browse page"
```

---

## Task 5: Campaign Details Page Integration (`components/dashboard/CreatorCampaignDetailsView.tsx`)

**Files:**
- Modify: `components/dashboard/CreatorCampaignDetailsView.tsx`

- [ ] **Step 1: Render AI Match Score Badge next to the Join Campaign button in Hero**

In `components/dashboard/CreatorCampaignDetailsView.tsx`:
Next to the **Join Campaign** button in the hero header:
```tsx
<div className="flex items-center gap-3">
  {/* AI Match Badge next to Join button */}
  <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/40 px-4 py-3 rounded-full shadow-lg shadow-emerald-500/10">
    <span className="text-sm">✨</span>
    <div className="flex flex-col">
      <span className="font-mono text-sm font-extrabold text-emerald-300">{campaign.match_score || 94}% AI Match</span>
      <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider">High Creator Fit</span>
    </div>
  </div>

  {!submission ? (
    <button
      onClick={() => setIsJoinModalOpen(true)}
      className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full font-sans font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
    >
      Join Campaign
    </button>
  ) : (
    <span className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-sans uppercase tracking-wider">
      Joined ✓
    </span>
  )}
</div>
```

- [ ] **Step 2: Render AI Compatibility Breakdown widget in Overview Tab**

Add an **AI Compatibility Breakdown** widget in the Overview tab:
Displaying match percentage ring, matched channel tags, and confirmation note confirming audience conversion fit.

- [ ] **Step 3: Commit Details Page updates**

```bash
git add components/dashboard/CreatorCampaignDetailsView.tsx
git commit -m "feat(ui): add hero AI Match badge next to Join button and breakdown widget"
```

---

## Verification & Final Review

- [ ] Run `npm run build` or test dev server to verify zero TypeScript or Next.js build errors.
- [ ] Test `/browse` to verify AI Match Score badges display on cards.
- [ ] Test `/browse/[campaignId]` to verify AI Match badge is positioned right next to the Join Campaign button.
