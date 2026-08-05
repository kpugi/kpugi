/**
 * Social Profile Public Scraper
 *
 * Separate, modular scrapers per network:
 *   - scrapeTwitterProfile(handle)   -> Twitter / X
 *   - scrapeTikTokProfile(handle)    -> TikTok
 *   - scrapeYouTubeProfile(handle)   -> YouTube
 *   - scrapeInstagramProfile(handle) -> Instagram
 *
 * Scraped fields per platform:
 *   - display_name
 *   - bio
 *   - follower_count
 *   - avatar_url
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

async function fetchHtml(url: string, timeoutMs: number = 6_000): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

// ─── 1. Twitter / X Scraper ───────────────────────────────────────────────────

export async function scrapeTwitterProfile(handle: string): Promise<ScrapedProfile> {
  const username = handle.replace(/^@/, '').trim();
  const html = await fetchHtml(`https://x.com/${username}`);

  const description = extractMeta(html, 'og:description') || '';
  const title = extractMeta(html, 'og:title') || '';
  const image = extractMeta(html, 'og:image');

  const followerMatch = description.match(/([\d.,]+[KMBkmb]?)\s*Follower/i);
  const followerCount = followerMatch ? parseFollowerCount(followerMatch[1]) : 0;

  const bio = description.replace(/[\d.,]+[KMBkmb]?\s*(Post|Follower|Following)[s]?,?\s*/gi, '').trim() || null;
  const displayName = title.replace(/\s*\(@[^)]+\)\s*/, '').replace(/\s*on X$/, '').trim() || null;

  return { displayName, bio, followerCount, avatarUrl: image, handle: username };
}

// ─── 2. TikTok Scraper ────────────────────────────────────────────────────────

export async function scrapeTikTokProfile(handle: string): Promise<ScrapedProfile> {
  const username = handle.replace(/^@/, '').trim();
  const html = await fetchHtml(`https://www.tiktok.com/@${username}`);

  const jsonMatch = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const userDetail =
        data?.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo ||
        data?.__DEFAULT_SCOPE__?.['seo.user']?.userInfo;

      const user = userDetail?.user;
      const stats = userDetail?.stats;

      if (user) {
        return {
          displayName: user.nickname || user.uniqueId || null,
          bio: user.signature || null,
          followerCount: stats?.followerCount ?? 0,
          avatarUrl: user.avatarMedium || user.avatarLarger || null,
          handle: username,
        };
      }
    } catch {
      // fall through
    }
  }

  const description = extractMeta(html, 'og:description') || '';
  const title = extractMeta(html, 'og:title') || '';
  const image = extractMeta(html, 'og:image');
  const followerMatch = description.match(/([\d.,]+[KMBkmb]?)\s*Follower/i);

  return {
    displayName: title.replace(/\s*\|.*$/, '').trim() || null,
    bio: description || null,
    followerCount: followerMatch ? parseFollowerCount(followerMatch[1]) : 0,
    avatarUrl: image,
    handle: username,
  };
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

  // Multi-pattern search for YouTube subscriber count in embedded JSON & HTML
  let subscriberCount: number | null = null;

  // Pattern 1: simpleText inside subscriberCountText e.g. "125 subscribers" or "1.5K subscribers"
  const match1 = html.match(/"subscriberCountText":[\s\S]*?"simpleText":"([^"]+)"/);
  if (match1) {
    subscriberCount = parseFollowerCount(match1[1]);
  }

  // Pattern 2: accessibility label e.g. "125 subscribers"
  if (subscriberCount === null) {
    const match2 = html.match(/"subscriberCountText":[\s\S]*?"label":"([^"]+)"/);
    if (match2) {
      subscriberCount = parseFollowerCount(match2[1]);
    }
  }

  // Pattern 3: Any "X subscribers" in page HTML
  if (subscriberCount === null) {
    const match3 = html.match(/([\d.,]+[KMBkmb]?)\s*subscriber[s]?/i);
    if (match3) {
      subscriberCount = parseFollowerCount(match3[1]);
    }
  }

  // Pattern 4: Extract avatar URL from avatar JSON blob
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

  // Method 1: Public web viewer (Picuki)
  try {
    const html = await fetchHtml(`https://www.picuki.com/profile/${encodeURIComponent(username)}`, 4_000);
    const bioMatch = html.match(/class="profile-description"[^>]*>([\s\S]*?)<\/div>/i);
    const nameMatch = html.match(/class="profile-name"[^>]*>([\s\S]*?)<\/div>/i);
    const avatarMatch = html.match(/class="profile-avatar"[^>]*src="([^"]+)"/i) || html.match(/class="profile-avatar"[\s\S]*?<img[^>]+src="([^"]+)"/i);
    const followersMatch = html.match(/class="followed-by"[^>]*>([\s\S]*?)<\/div>/i) || html.match(/([\d.,]+[KMBkmb]?)\s*followers/i);

    const bio = bioMatch ? decodeHtmlEntities(bioMatch[1].replace(/<[^>]+>/g, '').trim()) : null;
    const displayName = nameMatch ? decodeHtmlEntities(nameMatch[1].replace(/<[^>]+>/g, '').trim()) : username;
    const avatarUrl = avatarMatch ? avatarMatch[1] : null;
    const followerCount = followersMatch ? parseFollowerCount(followersMatch[1].replace(/<[^>]+>/g, '')) : 0;

    if (bio || displayName) {
      return {
        displayName: displayName || username,
        bio,
        followerCount,
        avatarUrl,
        handle: username,
      };
    }
  } catch {
    // fall through
  }

  // Method 2: Instagram Web profile info API
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
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

  // Method 3: Instagram Embed Page
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
        displayName: title.replace(/\s*\(@[^)]+\).*$/, '').replace(/•\s*Instagram.*$/, '').trim() || null,
        bio: bio || null,
        followerCount: followerMatch ? parseFollowerCount(followerMatch[1]) : 0,
        avatarUrl: image,
        handle: username,
      };
    }
  } catch {
    // fall through
  }

  throw new Error(`Instagram profile lookup timed out. Please try again in a few seconds.`);
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

export async function scrapeProfile(platform: string, handle: string): Promise<ScrapedProfile> {
  const p = platform.toLowerCase();
  if (p === 'x' || p === 'twitter') return scrapeTwitterProfile(handle);
  if (p === 'tiktok') return scrapeTikTokProfile(handle);
  if (p === 'youtube') return scrapeYouTubeProfile(handle);
  if (p === 'instagram') return scrapeInstagramProfile(handle);
  throw new Error(`Verification not supported for platform: ${platform}`);
}
