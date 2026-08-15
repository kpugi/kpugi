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
    Extracts metrics from any supported social URL using yt-dlp with multi-layer fallback.
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
    
    # 2. Primary Extraction: Universal yt-dlp Engine for YouTube, TikTok, X, Instagram, Facebook
    result = extract_with_ytdlp(url, platform)

    # If yt-dlp succeeded with view count, return immediately
    if result.reachable and result.view_count is not None:
        return result

    # 3. Secondary Platform-Specific Fallbacks
    if platform == 'x':
        fb_result = extract_twitter_syndication(url)
        if fb_result and fb_result.reachable:
            if fb_result.view_count is not None or not result.reachable:
                return fb_result
            if result.reachable:
                result.view_count = fb_result.view_count or result.view_count
                result.like_count = fb_result.like_count or result.like_count
                result.comment_count = fb_result.comment_count or result.comment_count
                result.share_count = fb_result.share_count or result.share_count
                result.extractor = f"{result.extractor}+{fb_result.extractor}"
                return result
            return fb_result

    elif platform == 'tiktok':
        fb_result = extract_tiktok_fallback(url)
        if fb_result and fb_result.reachable:
            if result.reachable:
                result.title = result.title or fb_result.title
                result.uploader = result.uploader or fb_result.uploader
                return result
            return fb_result

    elif platform == 'youtube':
        fb_result = extract_youtube_fallback(url)
        if fb_result and fb_result.reachable:
            if result.reachable:
                result.view_count = fb_result.view_count or result.view_count
                return result
            return fb_result

    # 4. Tertiary Generic OpenGraph / Meta Tag Scraper
    if not result.reachable:
        og_result = extract_opengraph_fallback(url, platform)
        if og_result.reachable:
            return og_result

    return result
