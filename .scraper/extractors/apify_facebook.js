/**
 * Apify Facebook Post & Reel Extractor
 * Uses Actor apify/facebook-posts-scraper to fetch post metrics, plays/views, likes, comments, and author.
 */

const path = require('path');
const fs = require('fs');
const { ApifyClient } = require('apify-client');

function loadEnv() {
  if (process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN) return;
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [k, ...v] = trimmed.split('=');
      const key = k.trim();
      const val = v.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

function getApifyTokens() {
  loadEnv();
  const raw = process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN || '';
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function normalizeFacebookUrl(url) {
  if (!url) return '';
  return url.trim()
    .replace(/^https?:\/\/(web|m|mobile|touch|l)\.facebook\.com/i, 'https://www.facebook.com');
}

const ACTOR_ID = process.env.APIFY_FACEBOOK_ACTOR || 'apify/facebook-posts-scraper';
let currentTokenIndex = 0;

async function scrapeFacebookWithApify(targetUrl) {
  if (!targetUrl) {
    return { reachable: false, error: 'No URL provided' };
  }

  const tokens = getApifyTokens();
  if (tokens.length === 0) {
    return {
      reachable: false,
      error: 'No Apify API token configured. Please set APIFY_API_TOKEN or APIFY_API_TOKENS.',
    };
  }

  const normalizedUrl = normalizeFacebookUrl(targetUrl);
  const input = {
    startUrls: [{ url: normalizedUrl }],
    resultsLimit: 1,
  };

  let lastError = null;

  for (let attempt = 0; attempt < tokens.length; attempt++) {
    const tokenIndex = (currentTokenIndex + attempt) % tokens.length;
    const token = tokens[tokenIndex];
    const client = new ApifyClient({ token });

    try {
      const run = await client.actor(ACTOR_ID).call(input);
      if (!run || !run.defaultDatasetId) {
        throw new Error('Apify run failed to initialize');
      }

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      if (!items || items.length === 0) {
        return { reachable: false, error: 'Facebook post not found or private' };
      }

      currentTokenIndex = (tokenIndex + 1) % tokens.length;
      const item = items[0];

      const uploader = item.short_form_video_context?.video_owner?.name
        || item.user?.name
        || item.user?.username
        || item.pageName
        || item.author
        || null;

      const views = typeof item.videoViewCount === 'number'
        ? item.videoViewCount
        : (typeof item.videoPlayCount === 'number'
          ? item.videoPlayCount
          : (typeof item.views === 'number'
            ? item.views
            : (typeof item.short_form_video_context?.playback_video?.views === 'number'
              ? item.short_form_video_context.playback_video.views
              : null)));

      const likes = typeof item.likes === 'number'
        ? item.likes
        : (typeof item.likers?.count === 'number'
          ? item.likers.count
          : (typeof item.likesCount === 'number'
            ? item.likesCount
            : (typeof item.reactionCount === 'number' ? item.reactionCount : null)));

      const comments = typeof item.comments === 'number'
        ? item.comments
        : (typeof item.total_comment_count === 'number'
          ? item.total_comment_count
          : (typeof item.commentsCount === 'number' ? item.commentsCount : null));

      let shares = null;
      if (typeof item.share_count_reduced === 'string') {
        shares = parseInt(item.share_count_reduced.replace(/[^0-9]/g, ''), 10) || null;
      } else if (typeof item.sharesCount === 'number') {
        shares = item.sharesCount;
      } else if (typeof item.shares === 'number') {
        shares = item.shares;
      }

      const text = typeof item.message === 'string'
        ? item.message
        : (item.message?.text || item.text || item.caption || item.postText || null);

      return {
        reachable: true,
        platform: 'facebook',
        extractor: 'apify_facebook',
        view_count: views,
        like_count: likes,
        comment_count: comments,
        share_count: shares,
        uploader: uploader,
        uploader_name: item.short_form_video_context?.video_owner?.name || item.user?.name || item.pageName || null,
        uploader_id: item.short_form_video_context?.video_owner?.id || item.user?.id || item.pageId || null,
        title: text ? text.slice(0, 80) : `Facebook post by ${uploader || 'creator'}`,
        description: text,
        post_url: item.facebookUrl || item.url || targetUrl,
        timestamp: item.creation_time || item.timestamp || item.time || null,
      };
    } catch (err) {
      lastError = err;
      // Only continue to next token if it's an API rate limit or token error
      const msg = (err && err.message) || String(err);
      if (msg.includes('rate limit') || msg.includes('401') || msg.includes('403') || msg.includes('token') || msg.includes('credits')) {
        continue;
      }
      break;
    }
  }

  return {
    reachable: false,
    platform: 'facebook',
    extractor: 'apify_facebook',
    error: lastError ? lastError.message || String(lastError) : 'All Apify tokens failed or exhausted',
  };
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error(JSON.stringify({ reachable: false, error: 'Usage: node apify_facebook.js <url>' }));
    process.exit(1);
  } else {
    scrapeFacebookWithApify(target)
      .then((res) => {
        console.log(JSON.stringify(res));
        process.exit(0);
      })
      .catch((err) => {
        console.log(JSON.stringify({ reachable: false, error: err.message || String(err) }));
        process.exit(0);
      });
  }
}

module.exports = { scrapeFacebookWithApify };
