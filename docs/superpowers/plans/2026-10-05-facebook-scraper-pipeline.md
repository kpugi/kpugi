# Facebook Scraper Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a resilient 3-tier Facebook post scraping and view auditing pipeline (Apify -> Bright Data -> Local fallback) across creator post verification and automated scraper runner.

**Architecture:** Dedicated Node.js helper extractors for Apify (`apify_facebook.js`) and Bright Data (`brightdata_facebook.js`) with token pooling and JSON dataset normalization; integrated into `lib/verification/post-verifier.ts` for creator onboarding and `.scraper/extractors/facebook.py` for scheduled view audits, with live health checks in the Admin Scraper Dashboard.

**Tech Stack:** Node.js, `apify-client`, Bright Data Datasets REST API, TypeScript, Python 3, Next.js Server Actions, Supabase.

---

### Task 1: Apify Facebook Extractor Script

**Files:**
- Create: `.scraper/extractors/apify_facebook.js`
- Test: Terminal execution with node

- [ ] **Step 1: Write `.scraper/extractors/apify_facebook.js`**

Implement the Apify Facebook scraper module using `apify-client`, token rotation from `APIFY_API_TOKENS` / `APIFY_API_TOKEN`, and the `apify/facebook-posts-scraper` actor.

```javascript
/**
 * Apify Facebook Post Extractor
 * Uses Actor apify/facebook-posts-scraper to fetch post metrics, plays/views, likes, comments, and author.
 */

const path = require('path');
const fs = require('fs');
const { ApifyClient } = require('apify-client');

function loadEnv() {
  if (process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN) return;
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [k, ...v] = trimmed.split('=');
      const key = k.trim();
      const val = v.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

function getApifyTokens() {
  loadEnv();
  const raw = process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN || '';
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

const ACTOR_ID = process.env.APIFY_FACEBOOK_ACTOR || 'apify/facebook-posts-scraper';
let currentTokenIndex = 0;

async function scrapeFacebookWithApify(targetUrl) {
  if (!targetUrl) {
    return { reachable: false, error: 'No URL provided' };
  }

  const tokens = getApifyTokens();
  if (tokens.length === 0) {
    return {
      reachable: false,
      error: 'No Apify API token configured. Please set APIFY_API_TOKEN or APIFY_API_TOKENS.',
    };
  }

  const input = {
    startUrls: [{ url: targetUrl }],
    resultsLimit: 1,
  };

  let lastError = null;

  for (let attempt = 0; attempt < tokens.length; attempt++) {
    const tokenIndex = (currentTokenIndex + attempt) % tokens.length;
    const token = tokens[tokenIndex];
    const client = new ApifyClient({ token });

    try {
      const run = await client.actor(ACTOR_ID).call(input, { timeoutSecs: 45 });
      if (!run || !run.defaultDatasetId) {
        throw new Error('Apify run failed to initialize');
      }

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      if (!items || items.length === 0) {
        return { reachable: false, error: 'Facebook post not found or private' };
      }

      currentTokenIndex = (tokenIndex + 1) % tokens.length;
      const item = items[0];

      const uploader = item.user?.username || item.pageName || item.user?.name || item.author || null;
      const views = typeof item.videoViewCount === 'number'
        ? item.videoViewCount
        : (typeof item.videoPlayCount === 'number' ? item.videoPlayCount : null);
      const likes = typeof item.likesCount === 'number' ? item.likesCount : (item.reactionCount || null);
      const comments = typeof item.commentsCount === 'number' ? item.commentsCount : null;
      const shares = typeof item.sharesCount === 'number' ? item.sharesCount : null;
      const text = item.text || item.message || item.caption || item.postText || null;

      return {
        reachable: true,
        platform: 'facebook',
        extractor: 'apify_facebook',
        view_count: views,
        like_count: likes,
        comment_count: comments,
        share_count: shares,
        uploader: uploader,
        uploader_name: item.user?.name || item.pageName || null,
        uploader_id: item.user?.id || item.pageId || null,
        title: text ? text.slice(0, 80) : `Facebook post by ${uploader || 'creator'}`,
        description: text,
        post_url: item.url || targetUrl,
        timestamp: item.timestamp || item.time || null,
      };
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  return {
    reachable: false,
    platform: 'facebook',
    extractor: 'apify_facebook',
    error: lastError ? lastError.message || String(lastError) : 'All Apify tokens failed or exhausted',
  };
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error(JSON.stringify({ reachable: false, error: 'Usage: node apify_facebook.js <url>' }));
    process.exit(1);
  }

  scrapeFacebookWithApify(target)
    .then((res) => {
      console.log(JSON.stringify(res));
      process.exit(res.reachable ? 0 : 1);
    })
    .catch((err) => {
      console.error(JSON.stringify({ reachable: false, error: err.message }));
      process.exit(1);
    });
}

module.exports = { scrapeFacebookWithApify };
```

- [ ] **Step 2: Test `.scraper/extractors/apify_facebook.js` standalone**

Run: `node .scraper/extractors/apify_facebook.js`
Expected: Output usage error JSON `{ reachable: false, error: 'Usage: node apify_facebook.js <url>' }` with exit code 1.

- [ ] **Step 3: Commit**

```bash
git add .scraper/extractors/apify_facebook.js
git commit -m "feat(scraper): add Apify Facebook post extractor with token pooling"
```

---

### Task 2: Bright Data Facebook Extractor Script

**Files:**
- Create: `.scraper/extractors/brightdata_facebook.js`
- Test: Terminal execution with node

- [ ] **Step 1: Write `.scraper/extractors/brightdata_facebook.js`**

Implement the Bright Data real-time dataset scrape endpoint client with graceful fallback and environment variable loading.

```javascript
/**
 * Bright Data Facebook Post Extractor
 * Uses Bright Data Datasets API v3 to fetch post metrics, plays/views, likes, comments, and author.
 */

const path = require('path');
const fs = require('fs');

function loadEnv() {
  if (process.env.BRIGHT_DATA_API_KEY) return;
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [k, ...v] = trimmed.split('=');
      const key = k.trim();
      const val = v.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function scrapeFacebookWithBrightData(targetUrl) {
  if (!targetUrl) {
    return { reachable: false, error: 'No URL provided' };
  }

  loadEnv();
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  if (!apiKey) {
    return {
      reachable: false,
      error: 'BRIGHT_DATA_API_KEY is not configured in environment variables.',
    };
  }

  const isReel = targetUrl.includes('/reel/') || targetUrl.includes('/reels/');
  const datasetId = isReel
    ? (process.env.BRIGHT_DATA_FB_REELS_DATASET || 'gd_lyclm3ey2q6rww027t')
    : (process.env.BRIGHT_DATA_FB_POSTS_DATASET || 'gd_lkaxegm826bjpoo9m5');

  const endpoint = `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${datasetId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ url: targetUrl }]),
      signal: AbortSignal.timeout(28000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        reachable: false,
        platform: 'facebook',
        extractor: 'brightdata_facebook',
        error: `Bright Data HTTP ${response.status}: ${errorText.slice(0, 150)}`,
      };
    }

    const data = await response.json();
    const item = Array.isArray(data) ? data[0] : data;

    if (!item) {
      return {
        reachable: false,
        platform: 'facebook',
        extractor: 'brightdata_facebook',
        error: 'No post data returned from Bright Data',
      };
    }

    const uploader = item.page_name || item.profile_name || item.author_name || item.user_username || null;
    const views = typeof item.video_views === 'number'
      ? item.video_views
      : (typeof item.play_count === 'number' ? item.play_count : (typeof item.views === 'number' ? item.views : null));
    const likes = typeof item.likes === 'number' ? item.likes : (typeof item.reactions === 'number' ? item.reactions : null);
    const comments = typeof item.num_comments === 'number' ? item.num_comments : (typeof item.comments === 'number' ? item.comments : null);
    const shares = typeof item.num_shares === 'number' ? item.num_shares : (typeof item.shares === 'number' ? item.shares : null);
    const text = item.post_text || item.caption || item.text || item.description || null;

    return {
      reachable: true,
      platform: 'facebook',
      extractor: 'brightdata_facebook',
      view_count: views,
      like_count: likes,
      comment_count: comments,
      share_count: shares,
      uploader: uploader,
      uploader_name: uploader,
      title: text ? text.slice(0, 80) : `Facebook post by ${uploader || 'creator'}`,
      description: text,
      post_url: item.url || targetUrl,
    };
  } catch (err) {
    return {
      reachable: false,
      platform: 'facebook',
      extractor: 'brightdata_facebook',
      error: err.message || String(err),
    };
  }
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error(JSON.stringify({ reachable: false, error: 'Usage: node brightdata_facebook.js <url>' }));
    process.exit(1);
  }

  scrapeFacebookWithBrightData(target)
    .then((res) => {
      console.log(JSON.stringify(res));
      process.exit(res.reachable ? 0 : 1);
    })
    .catch((err) => {
      console.error(JSON.stringify({ reachable: false, error: err.message }));
      process.exit(1);
    });
}

module.exports = { scrapeFacebookWithBrightData };
```

- [ ] **Step 2: Test `.scraper/extractors/brightdata_facebook.js` standalone**

Run: `node .scraper/extractors/brightdata_facebook.js`
Expected: Output usage error JSON `{ reachable: false, error: 'Usage: node brightdata_facebook.js <url>' }` with exit code 1.

- [ ] **Step 3: Commit**

```bash
git add .scraper/extractors/brightdata_facebook.js
git commit -m "feat(scraper): add Bright Data Facebook dataset extractor"
```

---

### Task 3: Post Verifier Multi-Tier Integration

**Files:**
- Modify: `lib/verification/post-verifier.ts:213-270`
- Test: Verification logic check

- [ ] **Step 1: Update Facebook section in `lib/verification/post-verifier.ts`**

Update `extractPostForVerification` under `if (platform === 'facebook')` to:
1. Attempt Apify Facebook extraction.
2. Attempt Bright Data extraction if Apify fails/unconfigured.
3. Fallback to existing desktop OpenGraph fetch.

```typescript
    // ─────────────────────────────────────────────────────────────────────────
    // 5. Facebook (Apify -> Bright Data -> OpenGraph Fallback)
    // ─────────────────────────────────────────────────────────────────────────
    if (platform === 'facebook') {
      // 1. Tier 1: Apify Facebook Extractor
      const apifyTokens = (process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (apifyTokens.length > 0) {
        try {
          const path = await import('path');
          const scriptPath = path.resolve(process.cwd(), '.scraper', 'extractors', 'apify_facebook.js');
          const fs = await import('fs');
          if (fs.existsSync(scriptPath)) {
            const cp = await import('child_process');
            const { promisify } = await import('util');
            const execFile = promisify(cp.execFile);
            const { stdout } = await execFile(process.execPath, [scriptPath, targetUrl], { timeout: 35000 });
            if (stdout && stdout.trim()) {
              const data = JSON.parse(stdout.trim());
              if (data && data.reachable) {
                return {
                  reachable: true,
                  platform: 'facebook',
                  authorHandle: data.uploader || urlParsed.extractedHandle,
                  authorName: data.uploader_name || data.uploader || null,
                  authorId: data.uploader_id || null,
                  postText: data.description || null,
                  title: data.title || 'Facebook Post',
                };
              }
            }
          }
        } catch {
          // Fall through to Bright Data
        }
      }

      // 2. Tier 2: Bright Data Fallback
      if (process.env.BRIGHT_DATA_API_KEY) {
        try {
          const path = await import('path');
          const scriptPath = path.resolve(process.cwd(), '.scraper', 'extractors', 'brightdata_facebook.js');
          const fs = await import('fs');
          if (fs.existsSync(scriptPath)) {
            const cp = await import('child_process');
            const { promisify } = await import('util');
            const execFile = promisify(cp.execFile);
            const { stdout } = await execFile(process.execPath, [scriptPath, targetUrl], { timeout: 30000 });
            if (stdout && stdout.trim()) {
              const data = JSON.parse(stdout.trim());
              if (data && data.reachable) {
                return {
                  reachable: true,
                  platform: 'facebook',
                  authorHandle: data.uploader || urlParsed.extractedHandle,
                  authorName: data.uploader_name || data.uploader || null,
                  postText: data.description || null,
                  title: data.title || 'Facebook Post',
                };
              }
            }
          }
        } catch {
          // Fall through to OpenGraph fallback
        }
      }

      // 3. Tier 3: OpenGraph & Facebook Crawler Fallback
      try {
        const res = await fetchWithTimeout(targetUrl, {
          headers: {
            'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            Accept: 'text/html,application/xhtml+xml',
          },
        });

        if (res.ok) {
          const html = await res.text();
          const title = extractMeta(html, 'og:title');
          const description = extractMeta(html, 'og:description');
          const image = extractMeta(html, 'og:image');

          if (title || description) {
            return {
              reachable: true,
              platform: 'facebook',
              authorHandle: urlParsed.extractedHandle,
              postText: description || null,
              title: title || 'Facebook Post',
              avatarUrl: image || null,
            };
          }
        }
      } catch {}

      return {
        reachable: false,
        platform: 'facebook',
        authorHandle: null,
        postText: null,
        title: null,
        errorMessage: 'Could not reach Facebook post. Ensure the post is public and the URL is accessible.',
      };
    }
```

- [ ] **Step 2: Commit**

```bash
git add lib/verification/post-verifier.ts
git commit -m "feat(verifier): integrate multi-tier Apify and Bright Data Facebook verification"
```

---

### Task 4: Python Scraper Runner & Extractor Integration

**Files:**
- Modify: `.scraper/extractors/facebook.py:100-140`
- Test: Run `.scraper/extractors/facebook.py` via Python

- [ ] **Step 1: Update `.scraper/extractors/facebook.py`**

Prepend Tier 1 (Apify) and Tier 2 (Bright Data) subprocess calls in `extract_facebook_post(url: str)` before falling back to `yt-dlp` and `m.facebook.com`.

```python
    # ─────────────────────────────────────────────────────────────────────────────
    # Layer 0.5: Apify Facebook Post Extractor (Primary Managed Cloud)
    # ─────────────────────────────────────────────────────────────────────────────
    try:
        from pathlib import Path
        import subprocess
        apify_script = Path(__file__).resolve().parent / "apify_facebook.js"
        if apify_script.exists():
            cmd = ["node", str(apify_script), url]
            proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=45)
            if proc.stdout.strip():
                lines = [line.strip() for line in proc.stdout.strip().splitlines() if line.strip()]
                for line in reversed(lines):
                    if line.startswith("{") and line.endswith("}"):
                        try:
                            ap_data = json.loads(line)
                            if ap_data.get("reachable"):
                                uploader = ap_data.get("uploader") or candidate_handle
                                view_count = ap_data.get("view_count")
                                like_count = ap_data.get("like_count")
                                if uploader or view_count is not None or like_count is not None:
                                    return ScrapeResult(
                                        reachable=True,
                                        view_count=view_count,
                                        like_count=like_count,
                                        comment_count=ap_data.get("comment_count"),
                                        share_count=ap_data.get("share_count"),
                                        uploader=uploader,
                                        uploader_id=ap_data.get("uploader_id") or uploader,
                                        channel=uploader,
                                        channel_url=f"https://www.facebook.com/{uploader}/" if uploader else None,
                                        title=ap_data.get("title") or "Facebook Post",
                                        description=ap_data.get("description"),
                                        platform="facebook",
                                        extractor="apify_facebook",
                                        raw=ap_data
                                    )
                        except json.JSONDecodeError:
                            continue
    except Exception as ap_err:
        logger.debug(f"Apify Facebook extraction attempt failed: {ap_err}")

    # ─────────────────────────────────────────────────────────────────────────────
    # Layer 0.8: Bright Data Facebook Extractor (Secondary Managed Cloud)
    # ─────────────────────────────────────────────────────────────────────────────
    try:
        from pathlib import Path
        import subprocess
        bd_script = Path(__file__).resolve().parent / "brightdata_facebook.js"
        if bd_script.exists():
            cmd = ["node", str(bd_script), url]
            proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=35)
            if proc.stdout.strip():
                lines = [line.strip() for line in proc.stdout.strip().splitlines() if line.strip()]
                for line in reversed(lines):
                    if line.startswith("{") and line.endswith("}"):
                        try:
                            bd_data = json.loads(line)
                            if bd_data.get("reachable"):
                                uploader = bd_data.get("uploader") or candidate_handle
                                view_count = bd_data.get("view_count")
                                like_count = bd_data.get("like_count")
                                if uploader or view_count is not None or like_count is not None:
                                    return ScrapeResult(
                                        reachable=True,
                                        view_count=view_count,
                                        like_count=like_count,
                                        comment_count=bd_data.get("comment_count"),
                                        share_count=bd_data.get("share_count"),
                                        uploader=uploader,
                                        uploader_id=uploader,
                                        channel=uploader,
                                        channel_url=f"https://www.facebook.com/{uploader}/" if uploader else None,
                                        title=bd_data.get("title") or "Facebook Post",
                                        description=bd_data.get("description"),
                                        platform="facebook",
                                        extractor="brightdata_facebook",
                                        raw=bd_data
                                    )
                        except json.JSONDecodeError:
                            continue
    except Exception as bd_err:
        logger.debug(f"Bright Data Facebook extraction attempt failed: {bd_err}")
```

- [ ] **Step 2: Commit**

```bash
git add .scraper/extractors/facebook.py
git commit -m "feat(scraper): add Apify and Bright Data layers to Python Facebook extractor"
```

---

### Task 5: Admin Dashboard Scraper Health & Credentials

**Files:**
- Modify: `app/actions/admin-scraper.ts`
- Modify: `components/admin/scraper/ScraperDashboardManager.tsx`
- Test: Compile check with `npx tsc --noEmit`

- [ ] **Step 1: Add `getBrightDataStatusAction` to `app/actions/admin-scraper.ts`**

Export interface `BrightDataSystemStatus` and action:
```typescript
export interface BrightDataSystemStatus {
  connected: boolean;
  configured: boolean;
  apiKeyMasked?: string;
  error?: string;
}

export async function getBrightDataStatusAction(): Promise<BrightDataSystemStatus> {
  await requireAdminSession();
  const key = process.env.BRIGHT_DATA_API_KEY;
  if (!key) {
    return {
      connected: false,
      configured: false,
      error: 'BRIGHT_DATA_API_KEY environment variable is not configured.',
    };
  }

  const masked = key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : '••••••••';
  return {
    connected: true,
    configured: true,
    apiKeyMasked: masked,
  };
}
```

- [ ] **Step 2: Display Bright Data status badge in `ScraperDashboardManager.tsx`**

Include Bright Data connection status alongside Apify and GitHub Actions in the scraper engine overview card.

- [ ] **Step 3: Run TypeScript typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add app/actions/admin-scraper.ts components/admin/scraper/ScraperDashboardManager.tsx
git commit -m "feat(admin): add Bright Data health monitoring to Scraper Dashboard"
```
