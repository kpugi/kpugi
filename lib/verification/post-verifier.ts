import { parseSocialPostUrl } from '@/lib/utils/social-url';

export interface VerifiedPostDetails {
  reachable: boolean;
  platform: string;
  authorHandle: string | null;
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
    // 5. Facebook (Mobile HTML & OpenGraph)
    // ─────────────────────────────────────────────────────────────────────────
    if (platform === 'facebook') {
      const mobileUrl = targetUrl.replace(/https?:\/\/(www\.|web\.)?facebook\.com/, 'https://m.facebook.com');
      const res = await fetchWithTimeout(mobileUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
          Accept: 'text/html',
        },
      });

      if (res.ok) {
        const html = await res.text();
        const authorMatch =
          html.match(/<header[\s\S]*?<a[^>]*href="\/([a-zA-Z0-9_.-]+)[^"]*"[^>]*>([^<]+)<\/a>/i) ||
          html.match(/<strong[^>]*><a[^>]*href="\/([a-zA-Z0-9_.-]+)[^"]*"[^>]*>([^<]+)<\/a>/i);
        const author = authorMatch ? authorMatch[1].trim() : urlParsed.extractedHandle;

        const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
        const postText = descMatch ? descMatch[1] : null;

        return {
          reachable: true,
          platform: 'facebook',
          authorHandle: author,
          postText: postText,
          title: 'Facebook Post',
        };
      }

      return { reachable: false, platform: 'facebook', authorHandle: urlParsed.extractedHandle, postText: null, title: null, errorMessage: 'Could not reach Facebook post.' };
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
