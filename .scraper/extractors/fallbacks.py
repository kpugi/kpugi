import re
import json
import logging
import urllib.request
import urllib.parse
import urllib.error
from typing import Optional, Dict, Any

try:
    from .base import ScrapeResult
    from ..config import REQUEST_TIMEOUT, DEFAULT_USER_AGENT
except (ImportError, ValueError):
    from extractors.base import ScrapeResult
    from config import REQUEST_TIMEOUT, DEFAULT_USER_AGENT

logger = logging.getLogger(__name__)

HEADERS = {
    'User-Agent': DEFAULT_USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

def _http_get_json(url: str) -> Optional[Dict[str, Any]]:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
            if response.getcode() == 200:
                body = response.read().decode('utf-8', errors='ignore')
                return json.loads(body)
    except Exception as e:
        logger.debug(f"HTTP GET JSON failed for {url}: {e}")
    return None

def _http_get_text(url: str) -> Optional[str]:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
            if response.getcode() == 200:
                return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        logger.debug(f"HTTP GET text failed for {url}: {e}")
    return None


def extract_twitter_syndication(url: str) -> Optional[ScrapeResult]:
    """
    Fallback for X / Twitter using the Twitter Syndication API.
    Does not require Twitter API keys or authentication.
    """
    tweet_id_match = re.search(r'(?:status|statuses)/(\d+)', url)
    if not tweet_id_match:
        return None

    tweet_id = tweet_id_match.group(1)
    token = ((int(tweet_id) / 1e15) * 3.141592653589793 * 1.5).hex() if hasattr(float, 'hex') else "x"
    api_url = f"https://cdn.syndication.twimg.com/tweet-result?id={tweet_id}&lang=en&token={token}"

    data = _http_get_json(api_url)
    if data:
        user_data = data.get('user', {})
        views = None
        if 'views' in data and isinstance(data['views'], dict):
            views = int(data['views'].get('count', 0))

        return ScrapeResult(
            reachable=True,
            view_count=views,
            like_count=data.get('favorite_count'),
            comment_count=data.get('reply_count'),
            share_count=data.get('retweet_count'),
            uploader=user_data.get('screen_name'),
            title=f"Tweet by @{user_data.get('screen_name')}",
            description=data.get('text'),
            platform="x",
            extractor="twitter_syndication",
            raw=data
        )

    # Fallback to Twitter oEmbed
    oembed_url = f"https://publish.twitter.com/oembed?url={urllib.parse.quote(url)}&omit_script=true"
    oembed_data = _http_get_json(oembed_url)
    if oembed_data:
        return ScrapeResult(
            reachable=True,
            title=oembed_data.get('author_name'),
            uploader=oembed_data.get('author_name'),
            platform="x",
            extractor="twitter_oembed",
            raw=oembed_data
        )

    return None


def extract_tiktok_fallback(url: str) -> Optional[ScrapeResult]:
    """
    Fallback for TikTok using TikTok oEmbed.
    """
    oembed_url = f"https://www.tiktok.com/oembed?url={urllib.parse.quote(url)}"
    data = _http_get_json(oembed_url)
    if data:
        return ScrapeResult(
            reachable=True,
            title=data.get('title'),
            uploader=data.get('author_unique_id') or data.get('author_name'),
            platform="tiktok",
            extractor="tiktok_oembed",
            raw=data
        )

    return None


def extract_youtube_fallback(url: str) -> Optional[ScrapeResult]:
    """
    Fallback for YouTube using YouTube oEmbed and public HTML regex.
    """
    oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
    data = _http_get_json(oembed_url)
    if data:
        view_count = None
        html = _http_get_text(url)
        if html:
            view_match = re.search(r'"viewCount":"(\d+)"', html)
            if view_match:
                view_count = int(view_match.group(1))

        return ScrapeResult(
            reachable=True,
            view_count=view_count,
            title=data.get('title'),
            uploader=data.get('author_name'),
            platform="youtube",
            extractor="youtube_oembed",
            raw=data
        )

    return None


def extract_opengraph_fallback(url: str, platform: str = "generic") -> ScrapeResult:
    """
    Generic OpenGraph / Meta tag parser for Threads, Instagram, LinkedIn, and Facebook.
    """
    html = _http_get_text(url)
    if html:
        title_match = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\'](.*?)["\']', html, re.I)
        desc_match = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\'](.*?)["\']', html, re.I)
        
        title = title_match.group(1) if title_match else None
        desc = desc_match.group(1) if desc_match else None

        view_count = None
        if desc:
            v_match = re.search(r'([\d,]+(?:\.\d+)?[KMBkmb]?)\s+(?:views|plays)', desc, re.I)
            if v_match:
                raw_val = v_match.group(1).upper().replace(',', '')
                if 'K' in raw_val:
                    view_count = int(float(raw_val.replace('K', '')) * 1000)
                elif 'M' in raw_val:
                    view_count = int(float(raw_val.replace('M', '')) * 1000000)
                elif 'B' in raw_val:
                    view_count = int(float(raw_val.replace('B', '')) * 1000000000)
                elif raw_val.isdigit():
                    view_count = int(raw_val)

        return ScrapeResult(
            reachable=True,
            view_count=view_count,
            title=title,
            description=desc,
            platform=platform,
            extractor="opengraph_fallback",
            raw={"url": url}
        )

    return ScrapeResult(
        reachable=False,
        platform=platform,
        extractor="opengraph_fallback",
        error_message="Could not reach post or fetch OpenGraph tags."
    )
