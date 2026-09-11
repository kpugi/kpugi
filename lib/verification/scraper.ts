/**
 * Social Profile Public Scraper
 *
 * Modular profile scrapers across all 6 supported networks:
 *   - scrapeTwitterProfile(handle)   -> Twitter / X (via FixTweet + fallback)
 *   - scrapeTikTokProfile(handle)    -> TikTok (via HTML + universal data hydration)
 *   - scrapeYouTubeProfile(handle)   -> YouTube (via YouTube Data API + HTML parser)
 *   - scrapeInstagramProfile(handle) -> Instagram (via Web API + Embed + Picuki)
 *   - scrapeFacebookProfile(handle)  -> Facebook (via mobile HTML + OpenGraph)
 *   - scrapeLinkedInProfile(handle)  -> LinkedIn (via public profile HTML + OpenGraph)
 *
 * Scraped fields per platform:
 *   - displayName
 *   - bio
 *   - followerCount
 *   - avatarUrl
 *   - handle
 */

export interface ScrapedProfile {
  displayName: string | null;
  bio: string | null;
  followerCount: number | null;
  avatarUrl: string | null;
  handle: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractMeta(html: string, property: string): string | null {
  const match =
    html.match(new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]*)"`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${property}"`, 'i'));
  return match ? decodeHtmlEntities(match[1]) : null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function parseFollowerCount(text: string | null): number | null {
  if (!text) return null;
  const cleaned = text.replace(/,/g, '').trim();
  const match = cleaned.match(/([\d.]+)\s*([KMBkmb]?)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const suffix = match[2].toUpperCase();
  if (suffix === 'K') return Math.round(num * 1_000);
  if (suffix === 'M') return Math.round(num * 1_000_000);
  if (suffix === 'B') return Math.round(num * 1_000_000_000);
  return Math.round(num);
}

async function fetchHtml(
  url: string,
  timeoutMs: number = 6_000,
  customHeaders?: Record<string, string>
): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      ...customHeaders,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

// ─── 1. Twitter / X Scraper ───────────────────────────────────────────────────

export async function scrapeTwitterProfile(handle: string): Promise<ScrapedProfile> {
  const username = handle.replace(/^@/, '').trim();

  // Method 1: FixTweet Open User API (Zero login wall, exact bio & followers)
  try {
    const res = await fetch(`https://api.fxtwitter.com/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4_000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.user) {
        const u = data.user;
        return {
          displayName: u.name || username,
          bio: u.description || null,
          followerCount: typeof u.followers === 'number' ? u.followers : parseFollowerCount(String(u.followers_count || 0)),
          avatarUrl: u.avatar_url || null,
          handle: username,
        };
      }
    }
  } catch {
    // fall through to HTML fallback
  }

  // Method 2: Public HTML meta fallback
  try {
    const html = await fetchHtml(`https://x.com/${username}`);
    const description = extractMeta(html, 'og:description') || '';
    const title = extractMeta(html, 'og:title') || '';
    const image = extractMeta(html, 'og:image');

    const followerMatch = description.match(/([\d.,]+[KMBkmb]?)\s*Follower/i);
    const followerCount = followerMatch ? parseFollowerCount(followerMatch[1]) : 0;
    const bio = description.replace(/[\d.,]+[KMBkmb]?\s*(Post|Follower|Following)[s]?,?\s*/gi, '').trim() || null;
    const displayName = title.replace(/\s*\(@[^)]+\)\s*/, '').replace(/\s*on X$/, '').trim() || null;

    return { displayName, bio, followerCount, avatarUrl: image, handle: username };
  } catch {
    return { displayName: username, bio: null, followerCount: null, avatarUrl: null, handle: username };
  }
}

// ─── 2. TikTok Scraper ────────────────────────────────────────────────────────

export async function scrapeTikTokProfile(handle: string): Promise<ScrapedProfile> {
  const username = handle.replace(/^@/, '').trim();

  // Method 1: Mobile iOS Safari UA — bypasses desktop bot wall, returns full universal hydration JSON
  try {
    const res = await fetch(`https://www.tiktok.com/@${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(6_000),
    });

    if (res.ok) {
      const html = await res.text();
      const jsonMatch = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          const scope = data?.__DEFAULT_SCOPE__ || {};
          const userDetail =
            scope['webapp.user-detail']?.userInfo ||
            scope['seo.user']?.userInfo;

          const user = userDetail?.user;
          const stats = userDetail?.stats;

          if (user || stats) {
            return {
              displayName: user?.nickname || user?.uniqueId || username,
              bio: user?.signature || null,
              followerCount: typeof stats?.followerCount === 'number' ? stats.followerCount : null,
              avatarUrl: user?.avatarMedium || user?.avatarLarger || user?.avatarThumb || null,
              handle: username,
            };
          }
        } catch {
          // fall through
        }
      }
    }
  } catch {
    // fall through
  }

  // Method 2: Twitterbot / Social crawler UA fallback (gets OpenGraph + follower count without challenge)
  try {
    const html = await fetchHtml(`https://www.tiktok.com/@${encodeURIComponent(username)}`, 5_000, {
      'User-Agent': 'Twitterbot/1.0',
    });

    const description = extractMeta(html, 'og:description') || '';
    const title = extractMeta(html, 'og:title') || '';
    const image = extractMeta(html, 'og:image');
    const followerMatch = description.match(/([\d.,]+[KMBkmb]?)\s*Follower/i);

    return {
      displayName: title.replace(/\s*\|.*$/, '').trim() || username,
      bio: description || null,
      followerCount: followerMatch ? parseFollowerCount(followerMatch[1]) : null,
      avatarUrl: image || null,
      handle: username,
    };
  } catch {
    return {
      displayName: username,
      bio: null,
      followerCount: null,
      avatarUrl: null,
      handle: username,
    };
  }
}

// ─── 3. YouTube Scraper ───────────────────────────────────────────────────────

export async function scrapeYouTubeProfile(handle: string): Promise<ScrapedProfile> {
  const username = handle.replace(/^@/, '').trim();

  // Try YouTube Data API if key available in environment
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (apiKey) {
    try {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent(username)}&key=${apiKey}`
      );
      const searchData = await searchRes.json();
      const channel = searchData?.items?.[0];
      if (channel) {
        return {
          displayName: channel.snippet?.title || null,
          bio: channel.snippet?.description || null,
          followerCount: parseInt(channel.statistics?.subscriberCount || '0', 10) || 0,
          avatarUrl: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || null,
          handle: username,
        };
      }
    } catch {
      // fall through
    }
  }

  // Public HTML parsing for YouTube channel page (@handle)
  const html = await fetchHtml(`https://www.youtube.com/@${username}`);
  const description = extractMeta(html, 'og:description') || '';
  const title = extractMeta(html, 'og:title') || '';
  let avatarUrl = extractMeta(html, 'og:image');

  let subscriberCount: number | null = null;
  const match1 = html.match(/"subscriberCountText":[\s\S]*?"simpleText":"([^"]+)"/);
  if (match1) subscriberCount = parseFollowerCount(match1[1]);

  if (subscriberCount === null) {
    const match2 = html.match(/"subscriberCountText":[\s\S]*?"label":"([^"]+)"/);
    if (match2) subscriberCount = parseFollowerCount(match2[1]);
  }

  if (subscriberCount === null) {
    const match3 = html.match(/([\d.,]+[KMBkmb]?)\s*subscriber[s]?/i);
    if (match3) subscriberCount = parseFollowerCount(match3[1]);
  }

  const avatarMatch = html.match(/"avatar":\s*\{\s*"thumbnails":\s*\[\{\s*"url":\s*"([^"]+)"/);
  if (avatarMatch && avatarMatch[1]) {
    avatarUrl = avatarMatch[1];
  }

  return {
    displayName: title.replace(/\s*-\s*YouTube$/, '').trim() || username,
    bio: description || null,
    followerCount: subscriberCount ?? 0,
    avatarUrl,
    handle: username,
  };
}

// ─── 4. Instagram Scraper ─────────────────────────────────────────────────────

export async function scrapeInstagramProfile(handle: string): Promise<ScrapedProfile> {
  const username = handle.replace(/^@/, '').trim();

  // ─── Phase 0: Self-Hosted Playwright Browser Extractor (Fetches exact live hydrated follower count, bio & avatar)
  try {
    const cp = await import('child_process');
    const path = await import('path');
    const fs = await import('fs');
    const scriptPath = path.resolve(process.cwd(), '.scraper', 'extractors', 'meta_browser_extractor.js');
    if (fs.existsSync(scriptPath)) {
      const runExecFile = cp['execFile'];
      const pwResult = await new Promise<any>((resolve) => {
        runExecFile(process.execPath, [scriptPath, 'instagram_profile', username], { timeout: 25_000 }, (err, stdout) => {
          if (err || !stdout) return resolve(null);
          try {
            const data = JSON.parse(stdout.trim());
            resolve(data);
          } catch {
            resolve(null);
          }
        });
      });

      if (pwResult && pwResult.reachable && typeof pwResult.followerCount === 'number' && pwResult.followerCount > 0) {
        return {
          displayName: pwResult.displayName || username,
          bio: pwResult.bio || null,
          followerCount: pwResult.followerCount,
          avatarUrl: pwResult.avatarUrl || null,
          handle: username,
        };
      }
    }
  } catch {
    // Fall through to HTTP SSR and API fallbacks
  }

  // ─── Phase 1: Real Mobile Safari & Chrome SSR endpoint
  // Instagram serves server-side rendered HTML with the full bio in <meta name="description"> and <meta property="og:description">
  const crawlerUserAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  ];

  for (const ua of crawlerUserAgents) {
    try {
      const res = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
        headers: {
          'User-Agent': ua,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(4_000),
      });

      if (res.ok) {
        const html = await res.text();

        const rawDesc = extractMeta(html, 'description') || extractMeta(html, 'og:description') || '';
        if (!rawDesc) continue;

        const decodedDesc = decodeHtmlEntities(rawDesc);

        // Strictly match followers: e.g. "940 Followers, 1 Following, 9 Posts"
        const followerMatch = decodedDesc.match(/([\d.,]+[KMBkmb]?)\s*Followers?/i);
        const followerCount = followerMatch ? parseFollowerCount(followerMatch[1]) : null;

        // Bio in quotes
        const bioQuotesMatch = decodedDesc.match(/on Instagram:\s*(?:&quot;|"|“)([\s\S]*?)(?:&quot;|"|”)/i);
        const cleanBio = bioQuotesMatch ? bioQuotesMatch[1].replace(/\\n/g, '\n').trim() : null;

        const combinedBio = cleanBio || decodedDesc;

        const rawTitle = extractMeta(html, 'og:title') || username;
        const displayName = rawTitle.replace(/\s*\(@[^)]+\).*$/, '').replace(/•\s*Instagram.*$/, '').trim() || username;
        const avatarUrl = extractMeta(html, 'og:image');

        if (cleanBio || (followerCount !== null && followerCount > 0)) {
          return {
            displayName,
            bio: combinedBio || null,
            followerCount,
            avatarUrl,
            handle: username,
          };
        }
      }
    } catch {
      // try next crawler UA
    }
  }

  // Method 2: Instagram Web profile info API with public Web App ID
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
          'X-IG-App-ID': '936619743392459',
          Accept: '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(4_000),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const user = data?.data?.user;
      if (user) {
        return {
          displayName: user.full_name || user.username || null,
          bio: user.biography || null,
          followerCount: user.edge_followed_by?.count ?? 0,
          avatarUrl: user.profile_pic_url_hd || user.profile_pic_url || null,
          handle: username,
        };
      }
    }
  } catch {
    // fall through
  }

  // Method 3: Instagram Embed Profile Page
  try {
    const html = await fetchHtml(`https://www.instagram.com/${username}/embed/`, 4_000);
    const description = extractMeta(html, 'og:description') || '';
    const title = extractMeta(html, 'og:title') || '';
    const image = extractMeta(html, 'og:image');

    const bioMatch = html.match(/"biography":"([^"]+)"/) || html.match(/class="[^"]*caption[^"]*"[^>]*>([^<]+)</);
    const bio = bioMatch ? decodeHtmlEntities(bioMatch[1].replace(/\\n/g, ' ')) : description;
    const followerMatch = description.match(/([\d.,]+[KMBkmb]?)\s*Follower/i);

    if (bio || title) {
      return {
        displayName: title.replace(/\s*\(@[^)]+\).*$/, '').replace(/•\s*Instagram.*$/, '').trim() || username,
        bio: bio || null,
        followerCount: followerMatch ? parseFollowerCount(followerMatch[1]) : 0,
        avatarUrl: image,
        handle: username,
      };
    }
  } catch {
    // fall through
  }

  // Fallback ScrapedProfile so verification process does not break
  return {
    displayName: username,
    bio: null,
    followerCount: null,
    avatarUrl: null,
    handle: username,
  };
}

// ─── 5. Facebook Scraper ──────────────────────────────────────────────────────

export async function scrapeFacebookProfile(handle: string): Promise<ScrapedProfile> {
  const username = handle.replace(/^@/, '').trim();
  const idMatch = username.match(/id=(\d+)/i) || username.match(/^(\d+)$/);
  const targetUrl = idMatch
    ? `https://www.facebook.com/profile.php?id=${idMatch[1]}`
    : username.startsWith('http')
    ? username
    : `https://www.facebook.com/${encodeURIComponent(username)}`;

  // Mobile Facebook HTML fetch
  try {
    const html = await fetchHtml(targetUrl, 5_000, {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    });

    const ogTitle = extractMeta(html, 'og:title') || '';
    const ogDesc = extractMeta(html, 'og:description') || '';
    const ogImage = extractMeta(html, 'og:image');

    // Bio extraction from intro or og:description
    const bioMatch =
      html.match(/data-sigil="m-profile-bio"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/class="[^"]*profile_intro[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const cleanBio = bioMatch ? decodeHtmlEntities(bioMatch[1].replace(/<[^>]+>/g, '').trim()) : ogDesc;

    // Followers extraction
    const followerMatch = html.match(/([\d.,]+[KMBkmb]?)\s*followers/i) || ogDesc.match(/([\d.,]+[KMBkmb]?)\s*followers/i);
    const followerCount = followerMatch ? parseFollowerCount(followerMatch[1]) : null;

    const displayName = ogTitle.replace(/\s*\|\s*Facebook.*$/i, '').trim() || username;

    return {
      displayName,
      bio: cleanBio || null,
      followerCount,
      avatarUrl: ogImage,
      handle: username,
    };
  } catch {
    return {
      displayName: username,
      bio: null,
      followerCount: null,
      avatarUrl: null,
      handle: username,
    };
  }
}

// ─── 6. LinkedIn Scraper ──────────────────────────────────────────────────────

export async function scrapeLinkedInProfile(handle: string): Promise<ScrapedProfile> {
  const username = handle.replace(/^@/, '').trim();

  try {
    const html = await fetchHtml(`https://www.linkedin.com/in/${encodeURIComponent(username)}/`, 5_000);

    const ogTitle = extractMeta(html, 'og:title') || '';
    const ogDesc = extractMeta(html, 'og:description') || '';
    const ogImage = extractMeta(html, 'og:image');

    // Title format: "FirstName LastName - Headline | LinkedIn"
    const displayName = ogTitle.replace(/\s*[-|–|—].*$/, '').replace(/\s*\|\s*LinkedIn.*$/i, '').trim() || username;
    const headline = ogDesc || null;

    return {
      displayName,
      bio: headline,
      followerCount: null,
      avatarUrl: ogImage,
      handle: username,
    };
  } catch {
    return {
      displayName: username,
      bio: null,
      followerCount: null,
      avatarUrl: null,
      handle: username,
    };
  }
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

export async function scrapeProfile(platform: string, handle: string): Promise<ScrapedProfile> {
  const p = platform.toLowerCase();
  if (p === 'x' || p === 'twitter') return scrapeTwitterProfile(handle);
  if (p === 'tiktok') return scrapeTikTokProfile(handle);
  if (p === 'youtube') return scrapeYouTubeProfile(handle);
  if (p === 'instagram') return scrapeInstagramProfile(handle);
  if (p === 'facebook') return scrapeFacebookProfile(handle);
  if (p === 'linkedin') return scrapeLinkedInProfile(handle);
  throw new Error(`Verification not supported for platform: ${platform}`);
}
