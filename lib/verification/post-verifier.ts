import { parseSocialPostUrl } from '@/lib/utils/social-url';

export interface VerifiedPostDetails {
  reachable: boolean;
  platform: string;
  authorHandle: string | null;
  authorName?: string | null;
  authorId?: string | null;
  postText: string | null;
  title: string | null;
  avatarUrl?: string | null;
  followerCount?: number | null;
  errorMessage?: string | null;
}

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 6_000): Promise<Response> {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  });
}

/**
 * High-speed, zero-auth public post extractor for creator account verification.
 * Verifies post existence, extracts author handle, and reads post caption for verification codes.
 */
export async function extractPostForVerification(rawUrl: string): Promise<VerifiedPostDetails> {
  const urlParsed = parseSocialPostUrl(rawUrl);
  if (!urlParsed.isValidFormat || urlParsed.platform === 'unknown') {
    return {
      reachable: false,
      platform: 'unknown',
      authorHandle: null,
      postText: null,
      title: null,
      errorMessage: urlParsed.error || 'Invalid or unsupported social post URL.',
    };
  }

  const platform = urlParsed.platform;
  const targetUrl = urlParsed.normalizedUrl;

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // 1. X / Twitter (FixTweet Public API)
    // ─────────────────────────────────────────────────────────────────────────
    if (platform === 'x') {
      const tweetIdMatch = targetUrl.match(/(?:status|statuses)\/(\d+)/i);
      if (!tweetIdMatch) {
        return { reachable: false, platform: 'x', authorHandle: null, postText: null, title: null, errorMessage: 'Invalid tweet URL format.' };
      }
      const tweetId = tweetIdMatch[1];
      const fxRes = await fetchWithTimeout(`https://api.fxtwitter.com/status/${tweetId}`, {
        headers: { Accept: 'application/json' },
      });

      if (fxRes.ok) {
        const fxData = await fxRes.json();
        const tweet = fxData?.tweet;
        if (tweet) {
          return {
            reachable: true,
            platform: 'x',
            authorHandle: tweet.author?.screen_name || null,
            postText: tweet.text || null,
            title: `Tweet by @${tweet.author?.screen_name}`,
            avatarUrl: tweet.author?.avatar_url || null,
            followerCount: tweet.author?.followers || null,
          };
        }
      }

      return { reachable: false, platform: 'x', authorHandle: null, postText: null, title: null, errorMessage: 'Could not fetch tweet details. Make sure the post is public.' };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Instagram (Captioned Embed & Web)
    // ─────────────────────────────────────────────────────────────────────────
    if (platform === 'instagram') {
      const codeMatch = targetUrl.match(/\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
      if (!codeMatch) {
        return { reachable: false, platform: 'instagram', authorHandle: null, postText: null, title: null, errorMessage: 'Invalid Instagram post format.' };
      }

      // 1. Primary: Apify Instagram Actor for 100% accurate author handle & post caption
      const apifyTokens = (process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (apifyTokens.length > 0) {
        try {
          const { ApifyClient } = await import('apify-client');
          const actorId = process.env.APIFY_INSTAGRAM_ACTOR || 'nH2AHrwxeTRJoN5hX';

          for (const token of apifyTokens) {
            try {
              const client = new ApifyClient({ token });
              const run = await client.actor(actorId).call({
                username: [targetUrl],
                resultsLimit: 1,
                skipPinnedPosts: false,
                dataDetailLevel: 'detailedData',
              });
              if (run?.defaultDatasetId) {
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                if (items && items.length > 0) {
                  const item = items[0] as any;
                  return {
                    reachable: true,
                    platform: 'instagram',
                    authorHandle: item.ownerUsername || null,
                    authorName: item.ownerFullName || null,
                    postText: item.caption || null,
                    title: item.caption || `Instagram post by @${item.ownerUsername || 'creator'}`,
                    avatarUrl: item.displayUrl || null,
                  };
                }
              }
            } catch {
              // Try next token in pool
              continue;
            }
          }
        } catch {
          // Fall through to captioned embed fallback
        }
      }

      // 2. Fallback: Captioned Embed & Web
      const shortcode = codeMatch[1];
      const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
      const res = await fetchWithTimeout(embedUrl, { headers: HEADERS });

      if (res.ok) {
        const html = await res.text();
        const lower = html.toLowerCase();
        if (lower.includes('page not found') || lower.includes("this content isn't available")) {
          return { reachable: false, platform: 'instagram', authorHandle: null, postText: null, title: null, errorMessage: 'Instagram post is private or removed.' };
        }

        const authorMatch =
          html.match(/class="CaptionUsername"[^>]*href="\/([^"\/]+)\/?"/i) ||
          html.match(/class="CaptionUsername"[^>]*>([^<]+)<\/a>/i) ||
          html.match(/"username":"([^"]+)"/i);
        const author = authorMatch ? authorMatch[1].trim().replace(/^@/, '') : null;

        const captionMatch = html.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
        const caption = captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '').trim() : null;

        return {
          reachable: true,
          platform: 'instagram',
          authorHandle: author,
          postText: caption,
          title: `Instagram post by @${author || 'creator'}`,
        };
      }

      return { reachable: false, platform: 'instagram', authorHandle: null, postText: null, title: null, errorMessage: 'Could not load Instagram post embed.' };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. TikTok (TikTok oEmbed)
    // ─────────────────────────────────────────────────────────────────────────
    if (platform === 'tiktok') {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetchWithTimeout(oembedUrl, { headers: { 'User-Agent': HEADERS['User-Agent'] } });

      if (res.ok) {
        const data = await res.json();
        const author = data.author_unique_id || data.author_name || null;
        return {
          reachable: true,
          platform: 'tiktok',
          authorHandle: author ? author.replace(/^@/, '') : null,
          postText: data.title || null,
          title: data.title || 'TikTok Video',
        };
      }

      return { reachable: false, platform: 'tiktok', authorHandle: null, postText: null, title: null, errorMessage: 'Could not load TikTok video details.' };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. YouTube (YouTube oEmbed & HTML)
    // ─────────────────────────────────────────────────────────────────────────
    if (platform === 'youtube') {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;
      const res = await fetchWithTimeout(oembedUrl, { headers: HEADERS });

      if (res.ok) {
        const data = await res.json();
        return {
          reachable: true,
          platform: 'youtube',
          authorHandle: data.author_name || null,
          postText: data.title || null,
          title: data.title || 'YouTube Video',
        };
      }

      return { reachable: false, platform: 'youtube', authorHandle: null, postText: null, title: null, errorMessage: 'Could not reach YouTube video.' };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Facebook (Headless Browser & OpenGraph Extractor)
    // ─────────────────────────────────────────────────────────────────────────
    if (platform === 'facebook') {
      try {
        const cp = await import('child_process');
        const { promisify } = await import('util');
        const path = await import('path');
        const execRunner = promisify(cp['execFile']);

        const scriptPath = path.resolve(process.cwd(), '.scraper', 'extractors', 'meta_browser_extractor.js');
        const { stdout } = await execRunner(process.execPath, [scriptPath, 'facebook', targetUrl], { timeout: 35000 });
        const data = JSON.parse(stdout.trim());

        if (data && data.reachable) {
          return {
            reachable: true,
            platform: 'facebook',
            authorHandle: data.author_name || data.uploader || urlParsed.extractedHandle,
            authorName: data.author_name || data.uploader || null,
            authorId: data.author_id || null,
            postText: data.description || null,
            title: data.title || 'Facebook Post',
            avatarUrl: data.avatarUrl || null,
          };
        }
      } catch (fbErr) {
        // Fall through to desktop OpenGraph fetch
      }

      // Fallback: fetch with Facebook crawler User-Agent
      try {
        const res = await fetchWithTimeout(targetUrl, {
          headers: {
            'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            Accept: 'text/html,application/xhtml+xml',
          },
        });

        if (res.ok) {
          const html = await res.text();
          const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
          const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
          return {
            reachable: true,
            platform: 'facebook',
            authorHandle: titleMatch ? titleMatch[1] : urlParsed.extractedHandle,
            postText: descMatch ? descMatch[1] : null,
            title: titleMatch ? titleMatch[1] : 'Facebook Post',
          };
        }
      } catch (fallbackErr) {}

      return {
        reachable: false,
        platform: 'facebook',
        authorHandle: urlParsed.extractedHandle,
        postText: null,
        title: null,
        errorMessage: 'Could not reach Facebook post. Make sure your post and profile are set to Public.',
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. LinkedIn (Public Embed & OpenGraph)
    // ─────────────────────────────────────────────────────────────────────────
    if (platform === 'linkedin') {
      const urnMatch = targetUrl.match(/activity[:-](\d+)/i) || targetUrl.match(/urn:li:(?:activity|share):(\d+)/i);
      const vanityMatch = targetUrl.match(/\/posts\/([a-zA-Z0-9_-]+?)_/i);
      const vanityHandle = vanityMatch ? vanityMatch[1].toLowerCase() : null;

      let postText: string | null = null;
      let authorName: string | null = vanityHandle;

      if (urnMatch) {
        const embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${urnMatch[1]}`;
        const embedRes = await fetchWithTimeout(embedUrl, { headers: HEADERS });
        if (embedRes.ok) {
          const embedHtml = await embedRes.text();
          const authMatch =
            embedHtml.match(/data-test-author-name="([^"]+)"/i) ||
            embedHtml.match(/<span class="attributed-text__author"[^>]*>([^<]+)<\/span>/i);
          if (authMatch) authorName = authMatch[1].trim();

          const contentMatch = embedHtml.match(/<div class="content"[^>]*>([\s\S]*?)<\/div>/i);
          if (contentMatch) postText = contentMatch[1].replace(/<[^>]+>/g, '').trim();
        }
      }

      return {
        reachable: true,
        platform: 'linkedin',
        authorHandle: vanityHandle || authorName,
        postText: postText,
        title: 'LinkedIn Post',
      };
    }

    return { reachable: false, platform, authorHandle: null, postText: null, title: null, errorMessage: 'Unsupported platform.' };
  } catch (err: any) {
    return {
      reachable: false,
      platform,
      authorHandle: null,
      postText: null,
      title: null,
      errorMessage: err?.message || 'Failed to inspect post.',
    };
  }
}
