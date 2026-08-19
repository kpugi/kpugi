/**
 * Social Media Post URL Parser & Ownership Verification Engine
 * 
 * Extracts social platform and author username/handle from post URLs,
 * and enforces strict ownership validation against the creator's connected social account.
 */

export interface ParsedSocialUrl {
  platform: 'x' | 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'unknown';
  extractedHandle: string | null;
  isValidFormat: boolean;
  normalizedUrl: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  platform: string;
  extractedHandle: string | null;
  error?: string;
}

/**
 * Normalizes a social handle by trimming whitespace and removing leading '@'.
 */
export function normalizeHandle(handle?: string | null): string {
  if (!handle) return '';
  return handle.trim().replace(/^@+/, '').replace(/[\s\-_.]+/g, '').toLowerCase();
}

/**
 * Parses any social media post URL and extracts the platform and author handle.
 */
export function parseSocialPostUrl(rawUrl: string): ParsedSocialUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      platform: 'unknown',
      extractedHandle: null,
      isValidFormat: false,
      normalizedUrl: '',
      error: 'Please enter a valid URL.',
    };
  }

  const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
  let parsed: URL;
  try {
    parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        platform: 'unknown',
        extractedHandle: null,
        isValidFormat: false,
        normalizedUrl: cleanUrl,
        error: 'URL must start with https://',
      };
    }
  } catch {
    return {
      platform: 'unknown',
      extractedHandle: null,
      isValidFormat: false,
      normalizedUrl: cleanUrl,
      error: 'Please enter a valid, complete URL (e.g. https://x.com/username/status/...)',
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;

  // ─── 1. X (Twitter) ──────────────────────────────────────────────────────────
  if (hostname === 'x.com' || hostname.endsWith('.x.com') || hostname === 'twitter.com' || hostname.endsWith('.twitter.com')) {
    // Pattern: /username/status/1234567890 or /username/statuses/1234567890
    const match = pathname.match(/^\/([a-zA-Z0-9_]{1,30})\/status(?:es)?\/(\d+)/i);
    if (match) {
      const handle = match[1].toLowerCase();
      // Ignore system paths like 'i', 'intent', 'share'
      if (!['i', 'intent', 'share', 'home', 'explore', 'notifications', 'messages'].includes(handle)) {
        return {
          platform: 'x',
          extractedHandle: handle,
          isValidFormat: true,
          normalizedUrl: cleanUrl,
        };
      }
    }

    // Secondary pattern: /i/web/status/123
    const directMatch = pathname.match(/\/status(?:es)?\/(\d+)/i);
    if (directMatch) {
      return {
        platform: 'x',
        extractedHandle: null,
        isValidFormat: true,
        normalizedUrl: cleanUrl,
      };
    }

    return {
      platform: 'x',
      extractedHandle: null,
      isValidFormat: false,
      normalizedUrl: cleanUrl,
      error: 'Invalid X (Twitter) post link. Expected format: https://x.com/your_handle/status/123456789',
    };
  }

  // ─── 2. TikTok ───────────────────────────────────────────────────────────────
  if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) {
    // Pattern: /@username/video/123456789 or /@username/photo/123456789 or /@username/v/123456789
    const match = pathname.match(/^\/@?([a-zA-Z0-9_.-]{1,30})\/(?:video|v|photo)\/(\d+)/i);
    if (match) {
      return {
        platform: 'tiktok',
        extractedHandle: match[1].replace(/^@/, '').toLowerCase(),
        isValidFormat: true,
        normalizedUrl: cleanUrl,
      };
    }

    // Short URLs (vm.tiktok.com / vt.tiktok.com)
    if (hostname.includes('vm.tiktok.com') || hostname.includes('vt.tiktok.com')) {
      return {
        platform: 'tiktok',
        extractedHandle: null,
        isValidFormat: true,
        normalizedUrl: cleanUrl,
      };
    }

    return {
      platform: 'tiktok',
      extractedHandle: null,
      isValidFormat: false,
      normalizedUrl: cleanUrl,
      error: 'Invalid TikTok post link. Expected format: https://www.tiktok.com/@your_handle/video/123456789',
    };
  }

  // ─── 3. Instagram ────────────────────────────────────────────────────────────
  if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) {
    // Pattern: /username/p/C_abc123/ or /username/reel/C_abc123/
    const userMatch = pathname.match(/^\/([a-zA-Z0-9_.-]{1,30})\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
    if (userMatch) {
      const handle = userMatch[1].toLowerCase();
      if (!['p', 'reel', 'reels', 'tv', 'stories', 'explore', 'direct'].includes(handle)) {
        return {
          platform: 'instagram',
          extractedHandle: handle,
          isValidFormat: true,
          normalizedUrl: cleanUrl,
        };
      }
    }

    // Pattern: /p/C_abc123/ or /reel/C_abc123/
    const directMatch = pathname.match(/^\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/i);
    if (directMatch) {
      return {
        platform: 'instagram',
        extractedHandle: null,
        isValidFormat: true,
        normalizedUrl: cleanUrl,
      };
    }

    return {
      platform: 'instagram',
      extractedHandle: null,
      isValidFormat: false,
      normalizedUrl: cleanUrl,
      error: 'Invalid Instagram link. Expected format: https://www.instagram.com/reel/... or /p/...',
    };
  }

  // ─── 4. YouTube ──────────────────────────────────────────────────────────────
  if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be') {
    if (hostname === 'youtu.be') {
      const match = pathname.match(/^\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return {
          platform: 'youtube',
          extractedHandle: null,
          isValidFormat: true,
          normalizedUrl: cleanUrl,
        };
      }
    }

    // Pattern with handle: /@handle/shorts/123 or /@handle/videos
    const handleMatch = pathname.match(/^\/@([a-zA-Z0-9_.-]{1,50})\/(?:shorts|watch)?/i);
    const extractedHandle = handleMatch ? handleMatch[1].toLowerCase() : null;

    // Pattern /shorts/123 or /watch?v=123
    const shortsMatch = pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/i);
    const watchParam = parsed.searchParams.get('v');

    if (shortsMatch || watchParam || handleMatch) {
      return {
        platform: 'youtube',
        extractedHandle,
        isValidFormat: true,
        normalizedUrl: cleanUrl,
      };
    }

    return {
      platform: 'youtube',
      extractedHandle: null,
      isValidFormat: false,
      normalizedUrl: cleanUrl,
      error: 'Invalid YouTube link. Expected format: https://www.youtube.com/watch?v=... or /shorts/...',
    };
  }

  // ─── 5. Facebook ─────────────────────────────────────────────────────────────
  if (hostname === 'facebook.com' || hostname.endsWith('.facebook.com') || hostname === 'fb.watch' || hostname === 'fb.com') {
    // Pattern: /username/posts/123 or /username/videos/123
    const userMatch = pathname.match(/^\/([a-zA-Z0-9_.-]{1,50})\/(?:posts|videos|reel)\/(\d+)/i);
    if (userMatch) {
      const handle = userMatch[1].toLowerCase();
      if (!['watch', 'reel', 'share', 'story', 'groups', 'events'].includes(handle)) {
        return {
          platform: 'facebook',
          extractedHandle: handle,
          isValidFormat: true,
          normalizedUrl: cleanUrl,
        };
      }
    }

    return {
      platform: 'facebook',
      extractedHandle: null,
      isValidFormat: true,
      normalizedUrl: cleanUrl,
    };
  }

  // ─── 6. LinkedIn ─────────────────────────────────────────────────────────────
  if (hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')) {
    return {
      platform: 'linkedin',
      extractedHandle: null,
      isValidFormat: true,
      normalizedUrl: cleanUrl,
    };
  }

  return {
    platform: 'unknown',
    extractedHandle: null,
    isValidFormat: false,
    normalizedUrl: cleanUrl,
    error: 'Unsupported platform. URL must be from X (Twitter), TikTok, Instagram, YouTube, Facebook, or LinkedIn.',
  };
}

/**
 * Validates a submitted post URL against the creator's connected social account.
 * 
 * Enforces:
 * 1. Valid URL syntax & domain
 * 2. Platform match (e.g. connected TikTok vs. pasted TikTok URL)
 * 3. Author handle ownership match (e.g. connected @tunde vs. URL authored by @tunde)
 */
export function validatePostUrlOwnership(
  rawUrl: string,
  connectedHandle?: string | null,
  connectedPlatform?: string | null
): ValidationResult {
  const parsed = parseSocialPostUrl(rawUrl);

  if (!parsed.isValidFormat || parsed.platform === 'unknown') {
    return {
      isValid: false,
      platform: parsed.platform,
      extractedHandle: parsed.extractedHandle,
      error: parsed.error || 'Please enter a valid post URL.',
    };
  }

  const normConnectedHandle = normalizeHandle(connectedHandle);
  const normConnectedPlatform = (connectedPlatform || '').toLowerCase().trim();

  // 1. Platform Match Enforcement (if connected platform is known)
  if (normConnectedPlatform) {
    const isPlatformMatch =
      (normConnectedPlatform.includes('twitter') || normConnectedPlatform === 'x') && parsed.platform === 'x' ||
      normConnectedPlatform.includes('tiktok') && parsed.platform === 'tiktok' ||
      (normConnectedPlatform.includes('instagram') || normConnectedPlatform === 'ig') && parsed.platform === 'instagram' ||
      (normConnectedPlatform.includes('youtube') || normConnectedPlatform === 'yt') && parsed.platform === 'youtube' ||
      (normConnectedPlatform.includes('facebook') || normConnectedPlatform === 'fb') && parsed.platform === 'facebook' ||
      normConnectedPlatform.includes('linkedin') && parsed.platform === 'linkedin';

    if (!isPlatformMatch) {
      const platformNames: Record<string, string> = {
        x: 'X (Twitter)',
        tiktok: 'TikTok',
        instagram: 'Instagram',
        youtube: 'YouTube',
        facebook: 'Facebook',
        linkedin: 'LinkedIn',
      };
      const expectedName = platformNames[normConnectedPlatform] || normConnectedPlatform;
      const actualName = platformNames[parsed.platform] || parsed.platform;

      return {
        isValid: false,
        platform: parsed.platform,
        extractedHandle: parsed.extractedHandle,
        error: `Platform mismatch: Your connected account is for ${expectedName}, but this link is from ${actualName}.`,
      };
    }
  }

  // 2. Author Handle Ownership Enforcement
  if (normConnectedHandle && parsed.extractedHandle) {
    const normExtracted = normalizeHandle(parsed.extractedHandle);
    if (normExtracted !== normConnectedHandle && !normConnectedHandle.includes(normExtracted) && !normExtracted.includes(normConnectedHandle)) {
      const platformDisplay = parsed.platform === 'x' ? 'X (Twitter)' : parsed.platform.toUpperCase();
      return {
        isValid: false,
        platform: parsed.platform,
        extractedHandle: parsed.extractedHandle,
        error: `Handle ownership mismatch: This ${platformDisplay} post belongs to @${parsed.extractedHandle}, but your connected account is @${normConnectedHandle}. You may only submit posts from your own account.`,
      };
    }
  }

  return {
    isValid: true,
    platform: parsed.platform,
    extractedHandle: parsed.extractedHandle,
  };
}
