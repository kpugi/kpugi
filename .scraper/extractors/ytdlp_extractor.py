import json
import logging
from typing import Optional

try:
    from .base import ScrapeResult
    from ..config import COOKIES_FILE, REQUEST_TIMEOUT, DEFAULT_USER_AGENT
except (ImportError, ValueError):
    from extractors.base import ScrapeResult
    from config import COOKIES_FILE, REQUEST_TIMEOUT, DEFAULT_USER_AGENT

logger = logging.getLogger(__name__)

def extract_with_ytdlp(url: str, platform: str = "generic") -> ScrapeResult:
    """
    Extracts post and video metrics using yt-dlp in metadata-only mode.
    Does not download audio/video binaries to conserve bandwidth and speed up execution.
    """
    try:
        import yt_dlp
    except ImportError:
        return ScrapeResult(
            reachable=False,
            platform=platform,
            extractor="yt-dlp",
            error_message="yt_dlp package is not installed."
        )

    ydl_opts = {
        'skip_download': True,
        'extract_flat': False,
        'dump_single_json': True,
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': True,
        'socket_timeout': min(REQUEST_TIMEOUT, 12),
        'user_agent': DEFAULT_USER_AGENT,
        'http_headers': {
            'User-Agent': DEFAULT_USER_AGENT,
            'Accept-Language': 'en-US,en;q=0.9',
        },
    }

    if COOKIES_FILE.exists():
        ydl_opts['cookiefile'] = str(COOKIES_FILE)

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if not info:
                return ScrapeResult(
                    reachable=False,
                    platform=platform,
                    extractor="yt-dlp",
                    error_message="yt-dlp could not extract metadata (post may be private, removed, or geo-restricted)."
                )

            # Handle playlists/multi-item containers if returned
            if 'entries' in info and info['entries']:
                entry = info['entries'][0]
                if entry:
                    info = entry

            view_count = info.get('view_count')
            like_count = info.get('like_count')
            comment_count = info.get('comment_count')
            repost_count = info.get('repost_count') or info.get('retweet_count')
            duration = info.get('duration')
            uploader = info.get('uploader')
            uploader_id = info.get('uploader_id')
            channel = info.get('channel')
            channel_url = info.get('channel_url') or info.get('uploader_url')
            title = info.get('title')
            description = info.get('description')

            sanitized_raw = {
                'id': info.get('id'),
                'title': title,
                'uploader': uploader,
                'uploader_id': uploader_id,
                'channel': channel,
                'channel_url': channel_url,
                'view_count': view_count,
                'like_count': like_count,
                'comment_count': comment_count,
                'repost_count': repost_count,
                'duration': duration,
                'upload_date': info.get('upload_date'),
                'tags': info.get('tags', [])[:10] if isinstance(info.get('tags'), list) else [],
                'webpage_url': info.get('webpage_url') or url,
                'extractor': info.get('extractor'),
            }

            return ScrapeResult(
                reachable=True,
                view_count=int(view_count) if view_count is not None else None,
                like_count=int(like_count) if like_count is not None else None,
                comment_count=int(comment_count) if comment_count is not None else None,
                share_count=int(repost_count) if repost_count is not None else None,
                duration=float(duration) if duration is not None else None,
                uploader=str(uploader) if uploader else (str(channel) if channel else (str(uploader_id) if uploader_id else None)),
                uploader_id=str(uploader_id) if uploader_id else None,
                channel=str(channel) if channel else None,
                channel_url=str(channel_url) if channel_url else None,
                title=str(title) if title else None,
                description=str(description)[:500] if description else None,
                platform=platform,
                extractor="yt-dlp",
                raw=sanitized_raw
            )

    except Exception as e:
        logger.warning(f"yt-dlp extraction failed for {url}: {e}")
        return ScrapeResult(
            reachable=False,
            platform=platform,
            extractor="yt-dlp",
            error_message=str(e)
        )
