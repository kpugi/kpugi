# Findings: Scraping & Auditing Engine Technical & Security Sweep

## 1. Architectural Map of the Scraping Ecosystem
The repository currently contains **three disjointed and conflicting scraping implementations**:

1. **Python Universal Engine (`.scraper/`)**:
   - Primary runner: `.scraper/runner.py` invoking `extract_post_metrics(post_url)`.
   - Engine: Universal `yt-dlp` metadata-only extractor + fallback suite in `.scraper/extractors/`.
   - Target platforms: TikTok, Instagram, YouTube, X (Twitter), Facebook, Threads, LinkedIn.
   - Automation: GitHub Actions workflow (`.github/workflows/scraper-cron.yml`), triggered via hourly cron (`0 * * * *`), manual dispatch, or `repository_dispatch` webhooks (`trigger-scraper`, `new-submission`).
   - Database layer: `DatabaseClient` in `.scraper/db.py` interacting with Supabase via urllib REST calls with `SUPABASE_SERVICE_ROLE_KEY`.

2. **Next.js TypeScript Stubs (`lib/scraper/`)**:
   - `lib/scraper/index.ts`: Hardcoded mock returning `{ postReachable: true, viewCount: 1500 }`.
   - `lib/scraper/tiktok.ts`: Hardcoded mock returning `viewCount: 3500`.
   - `lib/scraper/instagram.ts`: Hardcoded mock returning `viewCount: 2000`.
   - `lib/scraper/x.ts`: Hardcoded mock returning `viewCount: 1200`.
   - `lib/scraper/trigger.ts`: Dispatches GitHub Action via GitHub API, or falls back to internal cron route.

3. **Next.js Rogue Cron Route (`app/api/cron/verify-submissions/route.ts`)**:
   - Does NOT actually scrape any social platform!
   - Artificially inflates views on every run: `Math.max(currentPaidViews + 5000, Number(sub.final_view_count || 0))`.
   - Calculates incremental payouts and decrements campaign advertiser budgets based on this fake view inflation!
   - Violates PostgreSQL check constraints by attempting to write `status = 'auditing'` and `status = 'completed'`, which crash on the database constraint `submissions_status_check`.

4. **Next.js Social Profile Verifier (`lib/verification/scraper.ts`)**:
   - Used for "Code-in-Bio" creator verification via `/api/verify/social/check`.
   - Scrapes profile bio, follower count, and avatars across Twitter/X (HTML meta), TikTok (rehydration JSON/meta), YouTube (Data API/watch HTML), and Instagram (Picuki / Web profile info API / embed HTML).

---

## 2. High-Severity Security & Financial Vulnerabilities

1. **Author Handle Substring Matching Exploit (CRITICAL)**:
   - In `.scraper/runner.py` (lines 115-120):
     `norm_handle in clean_handle(c) or clean_handle(c) in norm_handle` with `len >= 3`.
   - Any creator with a short handle (e.g. `bob`, `dan`, `ada`) can submit viral posts by famous creators (e.g. `@bobby`, `@daniel`, `@adakora`), pass verification, and steal the advertiser's payout pool.
2. **Read-Modify-Write Budget Race Condition (CRITICAL)**:
   - In `.scraper/db.py` (`update_campaign_budget`), `spent_budget` and `reserved_budget` are fetched via REST GET, altered in memory, and patched via REST PATCH.
   - Concurrent runs cause lost updates, campaign budget leakage, and negative reserved budgets.
3. **Ghost / Suspended Account Retention Bypass (HIGH)**:
   - If an account is suspended or deleted on X (as observed with `@baddieshq_`), `extract_opengraph_fallback` returns `reachable=True` with `description: "This post is from a suspended account."`.
   - `runner.py` retains `final_views = max(scraped_views, current_max_views)`. Suspended or deleted posts stay marked `verified_pass` and continue to accrue pending payouts, violating the 72-Hour Public Retention rule.
4. **SSRF & Malicious URL Injection (HIGH)**:
   - Neither the Python scraper nor the TypeScript profile scraper validates URL protocols, domain whitelists, or resolves DNS to prevent targeting internal IP ranges (`127.0.0.1`, `169.254.169.254`, private VPC subnets).
5. **No Canonical URL Normalization (MEDIUM-HIGH)**:
   - URLs with tracking tokens (`?utm_source=...`, `?s=20`, `&feature=share`) or varying protocols (`http://` vs `https://`) bypass the database unique constraint on `submissions.post_url`.

---

## 3. Performance & Scalability Bottlenecks

1. **O(N) Sequential Execution Blocking (HIGH)**:
   - In `.scraper/runner.py`, submissions are processed strictly sequentially in a single thread.
   - With 50 submissions per batch, each taking 5–15 seconds, runtime easily exceeds 10–15 minutes, risking GitHub Actions 15-minute runner timeout.
2. **N+1 PostgREST HTTP Request Storm (HIGH)**:
   - 50 submissions trigger up to 250 individual HTTP round-trips over the public internet to Supabase PostgREST.
3. **Datacenter IP Rate Limiting & Blacklisting (HIGH)**:
   - GitHub Actions runs from known Microsoft Azure datacenter IP CIDRs.
   - Instagram, TikTok, and YouTube heavily restrict or block Azure IPs without residential proxies. Instagram returns 0 views on 100% of runs in the database.
4. **Third-Party Service Point of Failure (MEDIUM)**:
   - Twitter scraping relies on `api.fxtwitter.com` (a free Cloudflare worker service).
   - Instagram profile scraping relies on `picuki.com` (third-party web viewer frequently down or Cloudflare-protected).
