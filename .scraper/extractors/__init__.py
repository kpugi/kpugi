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

logger = logging.getLogger(__name__)

def detect_platform(url: str) -> str:
    """Identifies the social platform from a post URL."""
    url_lower = url.lower()
    if any(domain in url_lower for domain in ['youtube.com', 'youtu.be']):
        return 'youtube'
    if 'tiktok.com' in url_lower:
        return 'tiktok'
    if any(domain in url_lower for domain in ['twitter.com', 'x.com']):
        return 'x'
    if 'instagram.com' in url_lower:
        return 'instagram'
    if any(domain in url_lower for domain in ['facebook.com', 'fb.watch', 'fb.com']):
        return 'facebook'
    if 'threads.net' in url_lower:
        return 'threads'
    if 'linkedin.com' in url_lower:
        return 'linkedin'
    return 'generic'


def extract_post_metrics(url: str) -> ScrapeResult:
    """
    Extracts metrics from any supported social URL using dedicated high-fidelity extractors
    with multi-layer fallbacks.
    """
    if not url or not url.startswith(('http://', 'https://')):
        return ScrapeResult(
            reachable=False,
            error_message="Invalid URL format."
        )

    platform = detect_platform(url)

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
