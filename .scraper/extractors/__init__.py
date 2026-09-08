import re
import logging
from typing import Optional

try:
    from .base import ScrapeResult
    from .ytdlp_extractor import extract_with_ytdlp
    from .fallbacks import (
        extract_twitter_syndication,
        extract_tiktok_fallback,
        extract_youtube_fallback,
        extract_opengraph_fallback,
    )
    from .instagram import extract_instagram_post
    from .facebook import extract_facebook_post
    from .linkedin import extract_linkedin_post
except (ImportError, ValueError):
    from extractors.base import ScrapeResult
    from extractors.ytdlp_extractor import extract_with_ytdlp
    from extractors.fallbacks import (
        extract_twitter_syndication,
        extract_tiktok_fallback,
        extract_youtube_fallback,
        extract_opengraph_fallback,
    )
    from extractors.instagram import extract_instagram_post
    from extractors.facebook import extract_facebook_post
    from extractors.linkedin import extract_linkedin_post

import urllib.parse
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

ALLOWED_DOMAINS = {
    'youtube': ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
    'tiktok': ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com', 'vm.tiktok.com'],
    'x': ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com', 'mobile.twitter.com'],
    'instagram': ['instagram.com', 'www.instagram.com', 'm.instagram.com'],
    'facebook': ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch', 'fb.com'],
    'linkedin': ['linkedin.com', 'www.linkedin.com'],
}

def canonicalize_url(url: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Validates URL protocol and hostname against authorized social networks (blocking SSRF).
    Strips tracking query parameters (utm_*, s, t, ref, feature, fbclid, igsh).
    Returns (canonical_url, platform) or (None, None) if invalid/unauthorized.
    """
    if not url or not isinstance(url, str):
        return None, None

    try:
        parsed = urllib.parse.urlparse(url.strip())
    except Exception:
        return None, None

    # Enforce strictly HTTP/HTTPS
    if parsed.scheme.lower() not in ('http', 'https'):
        return None, None

    hostname = (parsed.hostname or '').lower()
    if not hostname:
        return None, None

    # Block private IP ranges, localhosts, and cloud metadata endpoints (SSRF guard)
    if (
        hostname in ('localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '::1')
        or hostname.startswith('10.')
        or hostname.startswith('192.168.')
        or hostname.startswith('172.')
    ):
        return None, None

    matched_platform = None
    for plat, domains in ALLOWED_DOMAINS.items():
        if any(hostname == d or hostname.endswith('.' + d) for d in domains):
            matched_platform = plat
            break

    if not matched_platform:
        return None, None

    # Strip tracking query parameters
    TRACKING_PARAMS = {'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 's', 't', 'ref', 'ref_src', 'feature', 'fbclid', 'igsh'}
    query_dict = urllib.parse.parse_qs(parsed.query, keep_blank_values=False)
    filtered_query = {k: v for k, v in query_dict.items() if k.lower() not in TRACKING_PARAMS}

    clean_query = urllib.parse.urlencode(filtered_query, doseq=True)
    clean_path = parsed.path.rstrip('/') if len(parsed.path) > 1 else parsed.path
    canonical = urllib.parse.urlunparse((
        parsed.scheme.lower(),
        hostname,
        clean_path,
        '',
        clean_query,
        ''
    ))
    return canonical, matched_platform


def detect_platform(url: str) -> str:
    """Identifies the social platform from a post URL."""
    _, platform = canonicalize_url(url)
    return platform or 'generic'


def extract_post_metrics(url: str) -> ScrapeResult:
    """
    Extracts metrics from any supported social URL using dedicated high-fidelity extractors
    with multi-layer fallbacks. Enforces strict URL sanitization and SSRF blocking.
    """
    canonical_url, platform = canonicalize_url(url)
    if not canonical_url or not platform:
        return ScrapeResult(
            reachable=False,
            error_message="Invalid or unsupported social platform URL."
        )

    # Use canonical URL for extraction
    url = canonical_url

    # 1. YouTube Dedicated Extractor (Innertube Player API + Web HTML Parser)
    if platform == 'youtube':
        yt_res = extract_youtube_fallback(url)
        if yt_res and yt_res.reachable and yt_res.view_count is not None:
            return yt_res

    # 2. X / Twitter Dedicated Extractor (FixTweet API + Syndication)
    if platform == 'x':
        x_res = extract_twitter_syndication(url)
        if x_res and x_res.reachable:
            return x_res

    # 3. Instagram Dedicated Extractor (yt-dlp + Captioned Embed + Web Query)
    if platform == 'instagram':
        ig_res = extract_instagram_post(url)
        if ig_res and ig_res.reachable:
            return ig_res

    # 4. Facebook Dedicated Extractor (yt-dlp + Mobile HTML + Video & Post Embeds)
    if platform == 'facebook':
        fb_res = extract_facebook_post(url)
        if fb_res and fb_res.reachable:
            return fb_res

    # 5. LinkedIn Dedicated Extractor (yt-dlp + Public Embed + OpenGraph)
    if platform == 'linkedin':
        li_res = extract_linkedin_post(url)
        if li_res and li_res.reachable:
            return li_res

    # 6. TikTok Extractor (yt-dlp + oEmbed fallback)
    if platform == 'tiktok':
        result = extract_with_ytdlp(url, platform)
        if result.reachable and result.view_count is not None:
            return result
        tt_res = extract_tiktok_fallback(url)
        if tt_res and tt_res.reachable:
            if result.reachable:
                result.title = result.title or tt_res.title
                result.uploader = result.uploader or tt_res.uploader
                return result
            return tt_res
        if result.reachable:
            return result

    # 7. Generic OpenGraph / Meta Tag Fallback
    og_result = extract_opengraph_fallback(url, platform)
    if og_result and og_result.reachable:
        return og_result

    return ScrapeResult(
        reachable=False,
        platform=platform,
        extractor="router_fallback",
        error_message=f"Could not reach or extract metrics for {platform} post."
    )
