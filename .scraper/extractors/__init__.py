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
except (ImportError, ValueError):
    from extractors.base import ScrapeResult
    from extractors.ytdlp_extractor import extract_with_ytdlp
    from extractors.fallbacks import (
        extract_twitter_syndication,
        extract_tiktok_fallback,
        extract_youtube_fallback,
        extract_opengraph_fallback,
    )

import urllib.parse
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

ALLOWED_DOMAINS = {
    'youtube': ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
    'tiktok': ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com', 'vm.tiktok.com'],
    'x': ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com', 'mobile.twitter.com'],
    'instagram': ['instagram.com', 'www.instagram.com', 'm.instagram.com'],
    'facebook': ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch', 'fb.com'],
    'threads': ['threads.net', 'www.threads.net'],
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

    # 1. Non-video platforms go straight to lightweight OpenGraph extraction
    if platform in ('threads', 'linkedin', 'generic'):
        return extract_opengraph_fallback(url, platform)
    
    # 2. YouTube High-Fidelity Dedicated Extractor (Innertube Player API + Web HTML Parser)
    if platform == 'youtube':
        yt_res = extract_youtube_fallback(url)
        if yt_res and yt_res.reachable and yt_res.view_count is not None:
            return yt_res

    # 3. X / Twitter High-Fidelity Dedicated Extractor (FixTweet API + Syndication)
    if platform == 'x':
        x_res = extract_twitter_syndication(url)
        if x_res and x_res.reachable:
            return x_res

    # 4. Universal yt-dlp Engine for TikTok, Instagram, Facebook
    result = extract_with_ytdlp(url, platform)

    if result.reachable and result.view_count is not None:
        return result

    # 5. Secondary Platform Fallbacks
    if platform == 'tiktok':
        fb_result = extract_tiktok_fallback(url)
        if fb_result and fb_result.reachable:
            if result.reachable:
                result.title = result.title or fb_result.title
                result.uploader = result.uploader or fb_result.uploader
                return result
            return fb_result

    # 6. Tertiary Generic OpenGraph / Meta Tag Scraper
    if not result.reachable:
        og_result = extract_opengraph_fallback(url, platform)
        if og_result.reachable:
            return og_result

    return result
