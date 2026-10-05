# Facebook Scraper Pipeline Design (Apify + Bright Data + Built-in Fallbacks)

**Date:** 2026-10-05  
**Status:** Approved  
**Author:** Pair Programming (Antigravity & User)

---

## 1. Overview & Objective

Kpugi creators join campaigns and submit Facebook posts (reels, videos, photo posts, and status updates) to earn payouts based on verified views (CPM). Currently, Instagram, YouTube, X, and TikTok have dedicated high-fidelity scrapers, while Facebook relies on limited local browser/OpenGraph parsers that often get blocked by Meta's bot defenses.

The objective of this project is to build a resilient, multi-layer Facebook scraping and view-auditing pipeline:
1. **Tier 1 (Apify - Primary):** Use Apify's maintained Facebook post actors (`apify/facebook-posts-scraper`) leveraging Kpugi's existing token pooling (`APIFY_API_TOKENS`) for verified views/play counts, engagement, author handle, and post text.
2. **Tier 2 (Bright Data - Secondary Fallback):** If Apify fails, times out, or runs out of credits, query Bright Data's real-time dataset scrape endpoint (`https://api.brightdata.com/datasets/v3/scrape`) using `BRIGHT_DATA_API_KEY`.
3. **Tier 3 (Local Built-in Fallback):** If both external APIs fail or are unconfigured, fall back to our existing internal `.scraper/extractors/facebook.py` engine (`yt-dlp` for public videos/reels, mobile HTML, and Schema.org JSON-LD).

---

## 2. Architecture & Data Flow

```
                     ┌──────────────────────────────────┐
                     │ Creator Post Submission          │
                     │ or Scheduled Scraper Audit       │
                     └─────────────────┬────────────────┘
                                       │
                                       ▼
                     ┌──────────────────────────────────┐
                     │ Canonicalize & Sanitize FB URL   │
                     │ (Validate host, strip tracking)  │
                     └─────────────────┬────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │   Tier 1: Apify Facebook    │
                        │   Actor (Token Pooling)     │
                        └──────────────┬──────────────┘
                                       │
                         Success? ─────┴─────► Return Metrics (views, likes, comments, author)
                                       │ No
                                       ▼
                        ┌─────────────────────────────┐
                        │   Tier 2: Bright Data       │
                        │   Datasets Scraper API      │
                        └──────────────┬──────────────┘
                                       │
                         Success? ─────┴─────► Return Metrics (views, likes, comments, author)
                                       │ No
                                       ▼
                        ┌─────────────────────────────┐
                        │   Tier 3: Local Engine      │
                        │   (yt-dlp + Mobile HTML/LD) │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │ Final Metrics Resolution &  │
                        │ Anti-Fraud Handle Validation│
                        └─────────────────────────────┘
```

---

## 3. Components & Implementation Details

### 3.1 Apify Facebook Extractor (`.scraper/extractors/apify_facebook.js`)
- **Actor:** `apify/facebook-posts-scraper` (or overridden by `APIFY_FACEBOOK_ACTOR`).
- **Input:**
  ```json
  {
    "startUrls": [{ "url": "<target_fb_url>" }],
    "resultsLimit": 1
  }
  ```
- **Token Rotation:** Inherits the round-robin pool from `APIFY_API_TOKENS` and `APIFY_API_TOKEN`.
- **Output Normalization:**
  - `view_count`: `videoPlayCount`, `videoViewCount`, or fallback to organic engagement formula if photo/status.
  - `like_count`: `likesCount` / `reactionCount`.
  - `comment_count`: `commentsCount`.
  - `share_count`: `sharesCount`.
  - `uploader`: Page/profile username or author handle.
  - `caption`: Post description / caption.

### 3.2 Bright Data Facebook Extractor (`.scraper/extractors/brightdata_facebook.js`)
- **Endpoint:** `POST https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lkaxegm826bjpoo9m5` (or reels dataset `gd_lyclm3ey2q6rww027t` when URL contains `/reel/`).
- **Headers:**
  - `Authorization: Bearer <BRIGHT_DATA_API_KEY>`
  - `Content-Type: application/json`
- **Body:** `[{"url": "<target_fb_url>"}]`
- **Timeout:** 25 seconds synchronous lookup; graceful abort on network failure.
- **Output Normalization:**
  - Normalizes Bright Data's JSON schema (e.g. `video_views`, `play_count`, `likes`, `num_comments`, `shares`, `page_name`, `profile_name`) into standard Kpugi metric format.

### 3.3 Post Verifier Integration (`lib/verification/post-verifier.ts`)
- Updates `extractPostForVerification(url)` when `platform === 'facebook'`:
  - 1. Calls Apify Facebook extractor via Node/`apify-client`.
  - 2. If unconfigured or failed, calls Bright Data REST endpoint.
  - 3. If both fail, falls back to existing desktop/mobile OpenGraph fetcher.
  - Extracts `authorHandle`, `title`, `postText`, and confirms `reachable: true`.

### 3.4 Python Scraper Runner Integration (`.scraper/extractors/facebook.py`)
- Modifies `extract_facebook_post(url)`:
  - Step 1: Execute `node apify_facebook.js <url>` via subprocess. If reachable and metrics found, return `ScrapeResult`.
  - Step 2: If Apify fails/unconfigured, execute `node brightdata_facebook.js <url>`. If reachable, return `ScrapeResult`.
  - Step 3: If both cloud providers fail, proceed to existing `yt-dlp` and `m.facebook.com` mobile HTML parsers.

### 3.5 Admin Scraper Dashboard Health (`app/actions/admin-scraper.ts` & `ScraperDashboardManager.tsx`)
- Add `getBrightDataStatusAction()` checking if `BRIGHT_DATA_API_KEY` is present and validating account balance / connectivity.
- Display Bright Data status badge alongside Apify and GitHub Actions in the Admin Scraper Dashboard.

---

## 4. Anti-Fraud & Data Normalization

1. **Author Handle Matching:**
   - Facebook URLs can point to pages (e.g., `facebook.com/brandname/posts/123`), personal profiles (e.g., `facebook.com/profile.php?id=123`), or reels (`facebook.com/reel/123`).
   - The extractors extract both username handles and page display names to match against the creator's connected Facebook social account handle stored in `creator_social_accounts`.
2. **View Metric Resolution for Non-Video Posts:**
   - For Facebook Reels and Videos, actual video play counts (`videoPlayCount` or `views`) are strictly recorded.
   - For non-video static photo/carousel posts where direct view counters are omitted by Facebook's public UI, the engagement-to-impressions benchmark (`likes + comments*2 + shares*3`) is utilized with `metric_basis: "photo_engagement_benchmark"`.

---

## 5. Error Handling & Edge Cases

| Scenario | Behavior |
| :--- | :--- |
| **Private Post or Deleted Post** | Scraper marks `reachable: false`, runner transitions submission to `verified_fail` with informative error message without throwing exceptions. |
| **Apify Rate Limit / Credit Depletion** | Automatic failover to Bright Data API within 3-5 seconds. |
| **No API Keys Configured (Local/Offline Dev)** | Automatic failover to Tier 3 local `yt-dlp` and mobile HTML parser. |
| **Transient Network Errors** | Retries across round-robin token pool before cascading to Tier 2. |

---

## 6. Testing & Verification Plan

1. **Unit Testing:**
   - Test `apify_facebook.js` standalone with a sample public Facebook video/reel URL.
   - Test `brightdata_facebook.js` standalone with mock and live API key.
2. **Post Verifier Testing:**
   - Call `extractPostForVerification("https://www.facebook.com/...")` and verify it returns correct author handle and reachability.
3. **Scraper Runner End-to-End:**
   - Run `python .scraper/runner.py --force` against a Facebook submission to confirm `final_view_count`, `likes_count`, `comments_count`, and `status: verified_pass` are updated properly in Supabase.
4. **Build & Typecheck:**
   - Run `npx tsc --noEmit` to verify 100% type safety.
