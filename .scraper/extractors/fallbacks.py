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

def _http_get_json(url: str, headers: Optional[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
    req_headers = dict(HEADERS)
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers)
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
    High-fidelity extractor for X / Twitter using FixTweet API (primary)
    and Twitter Syndication + oEmbed (secondary fallbacks).
    Zero API keys required.
    """
    tweet_id_match = re.search(r'(?:status|statuses)/(\d+)', url)
    if not tweet_id_match:
        return None

    tweet_id = tweet_id_match.group(1)

    # 1. FixTweet Public API (Returns exact views, likes, retweets, replies, video duration)
    fx_url = f"https://api.fxtwitter.com/status/{tweet_id}"
    fx_data = _http_get_json(fx_url)
    if fx_data and fx_data.get('code') == 200 and 'tweet' in fx_data:
        tweet = fx_data['tweet']
        author = tweet.get('author', {})
        views = tweet.get('views')
        likes = tweet.get('likes')
        retweets = tweet.get('retweets')
        replies = tweet.get('replies')
        bookmarks = tweet.get('bookmarks')

        return ScrapeResult(
            reachable=True,
            view_count=int(views) if views is not None else None,
            like_count=int(likes) if likes is not None else None,
            comment_count=int(replies) if replies is not None else None,
            share_count=int(retweets) if retweets is not None else None,
            uploader=author.get('screen_name'),
            title=f"Tweet by @{author.get('screen_name')}",
            description=tweet.get('text'),
            platform="x",
            extractor="twitter_fxtweet_api",
            raw=tweet
        )

    # 2. Twitter Syndication API Fallback
    token = ((int(tweet_id) / 1e15) * 3.141592653589793 * 1.5).hex() if hasattr(float, 'hex') else "x"
    api_url = f"https://cdn.syndication.twimg.com/tweet-result?id={tweet_id}&lang=en&token={token}"

    data = _http_get_json(api_url)
    if data and data.get('__typename') != 'TweetTombstone':
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

    # 3. Twitter oEmbed Fallback
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


def _parse_compact_number(raw: Any) -> Optional[int]:
    """Parses raw number or compact string representation (e.g. 13, '1.2K', '3.5M') into an integer."""
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return int(raw)
    s = str(raw).strip().upper().replace(',', '')
    if not s:
        return None
    try:
        if s.endswith('K'):
            return int(float(s[:-1]) * 1000)
        elif s.endswith('M'):
            return int(float(s[:-1]) * 1000000)
        elif s.endswith('B'):
            return int(float(s[:-1]) * 1000000000)
        elif s.isdigit():
            return int(s)
        else:
            m = re.search(r'([\d.]+)\s*([KMB]?)', s)
            if m:
                val = float(m.group(1))
                mult = {'K': 1000, 'M': 1000000, 'B': 1000000000}.get(m.group(2), 1)
                return int(val * mult)
    except (ValueError, TypeError):
        pass
    return None


def extract_youtube_fallback(url: str) -> Optional[ScrapeResult]:
    """
    High-fidelity extractor for YouTube videos & shorts with zero external dependencies.
    Combines YouTube Innertube Web Player API with public HTML regex parser
    to extract: views, likes, comments, author/channel handle, subscribers, duration, title, description.
    """
    video_id_match = re.search(r'(?:v=|/v/|youtu\.be/|/embed/|/shorts/)([a-zA-Z0-9_-]{11})', url)
    if not video_id_match:
        return None
    video_id = video_id_match.group(1)

    view_count = None
    like_count = None
    comment_count = None
    title = None
    uploader = None
    duration = None
    channel_id = None
    channel_url = None
    subscribers = None
    description = None

    # 1. Innertube Web Player API (Fast, Reliable, Zero-Auth)
    player_url = 'https://www.youtube.com/youtubei/v1/player'
    payload = {
        'context': {
            'client': {
                'hl': 'en',
                'gl': 'US',
                'clientName': 'WEB',
                'clientVersion': '2.20230501.00.00'
            }
        },
        'videoId': video_id
    }
    
    player_data = _http_get_json(
        player_url,
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    if not player_data:
        # Retry with direct post request if _http_get_json didn't send body
        try:
            req = urllib.request.Request(
                player_url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json', 'User-Agent': DEFAULT_USER_AGENT}
            )
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                player_data = json.loads(resp.read().decode('utf-8', errors='ignore'))
        except Exception as e:
            logger.debug(f"Innertube player request failed: {e}")

    if player_data:
        vdetails = player_data.get('videoDetails', {})
        if vdetails:
            view_count = _parse_compact_number(vdetails.get('viewCount'))
            title = vdetails.get('title')
            uploader = vdetails.get('author')
            duration = float(vdetails.get('lengthSeconds', 0)) if vdetails.get('lengthSeconds') else None
            channel_id = vdetails.get('channelId')
            description = vdetails.get('shortDescription')
            if channel_id:
                channel_url = f"https://www.youtube.com/channel/{channel_id}"

    # 2. Public YouTube Watch HTML (for Likes, Comments, Channel Handle, Subscribers)
    watch_url = f"https://www.youtube.com/watch?v={video_id}"
    html = _http_get_text(watch_url) or _http_get_text(url)

    if html:
        # View count fallback
        if view_count is None:
            view_match = re.search(r'"viewCount":"(\d+)"', html) or re.search(r'([\d,]+(?:\.\d+)?[KMBkmb]?)\s+views', html, re.I)
            if view_match:
                view_count = _parse_compact_number(view_match.group(1))

        # Likes extraction (multiple schema representations)
        m_likes = (
            re.search(r'"likeCount":"(\d+)"', html) or
            re.search(r'itemprop="userInteractionCount"\s+content="(\d+)"', html) or
            re.search(r'"iconName":"LIKE","title":"([\d,]+(?:\.\d+)?[KMBkmb]?)"', html) or
            re.search(r'"factoidRenderer":\{"value":\{"simpleText":"([\d,]+(?:\.\d+)?[KMBkmb]?)"\},"label":\{"simpleText":"Likes"\}', html) or
            re.search(r'accessibilityText":"(?:like this video along with )?([\d,]+(?:\.\d+)?[KMBkmb]?)\s+other people', html) or
            re.search(r'([\d,]+(?:\.\d+)?[KMBkmb]?)\s+likes', html, re.I)
        )
        if m_likes:
            like_count = _parse_compact_number(m_likes.group(1))

        # Comments extraction
        m_comments = (
            re.search(r'"title":\{"runs":\[\{"text":"Comments"\}\]\},"contextualInfo":\{"runs":\[\{"text":"([\d,]+(?:\.\d+)?[KMBkmb]?)"\}\]', html) or
            re.search(r'"totalComments":"(\d+)"', html) or
            re.search(r'"commentCount":\s*\{\s*"simpleText":\s*"([\d,]+)"', html) or
            re.search(r'"commentsCount":\s*\{\s*"text":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([\d,]+)"', html) or
            re.search(r'([\d,]+(?:\.\d+)?[KMBkmb]?)\s+Comments?', html, re.I)
        )
        if m_comments:
            comment_count = _parse_compact_number(m_comments.group(1))

        # Subscribers extraction
        m_subs = (
            re.search(r'"subscriberCountText":\s*\{\s*"simpleText":\s*"([^"]+)"', html) or
            re.search(r'([\d,]+(?:\.\d+)?[KMBkmb]?)\s+subscribers?', html, re.I)
        )
        if m_subs:
            subscribers = _parse_compact_number(m_subs.group(1))

        # Canonical Channel Handle (e.g. /@tuazorcyberkeed)
        m_handle = re.search(r'"canonicalBaseUrl":"(/@[^"]+)"', html)
        if m_handle:
            channel_url = f"https://www.youtube.com{m_handle.group(1)}"

        # Title & Uploader fallback
        if not title:
            t_match = re.search(r'<meta\s+name="title"\s+content="([^"]+)"', html, re.I) or re.search(r'<meta\s+property="og:title"\s+content="([^"]+)"', html, re.I)
            if t_match:
                title = t_match.group(1)

        if not uploader:
            u_match = re.search(r'"owner":\s*\{\s*"videoOwnerRenderer":\s*\{\s*"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"', html) or re.search(r'<link\s+itemprop="name"\s+content="([^"]+)"', html)
            if u_match:
                uploader = u_match.group(1)

    if view_count is not None or title:
        return ScrapeResult(
            reachable=True,
            view_count=view_count,
            like_count=like_count,
            comment_count=comment_count,
            share_count=None,
            duration=duration,
            uploader=uploader,
            channel=uploader,
            channel_url=channel_url,
            title=title,
            description=description,
            platform="youtube",
            extractor="youtube_innertube_parser",
            raw={
                'video_id': video_id,
                'subscribers': subscribers,
                'view_count': view_count,
                'like_count': like_count,
                'comment_count': comment_count,
            }
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
