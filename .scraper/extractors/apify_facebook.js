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

function parseNumberWithSuffix(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : Math.round(val);
  if (typeof val === 'object') {
    if (typeof val.count === 'number') return val.count;
    if (typeof val.total_count === 'number') return val.total_count;
    if (typeof val.value === 'number') return val.value;
    return null;
  }
  if (typeof val !== 'string') return null;

  const trimmed = val.trim();
  if (!trimmed) return null;

  // Check for suffixes like 1.2M, 350K, 2.5B
  const m = trimmed.match(/^([\d,]+(?:\.\d+)?)\s*([kmbKMB])?$/i);
  if (m) {
    const numPart = parseFloat(m[1].replace(/,/g, ''));
    if (isNaN(numPart)) return null;
    const suffix = (m[2] || '').toUpperCase();
    if (suffix === 'K') return Math.round(numPart * 1000);
    if (suffix === 'M') return Math.round(numPart * 1000000);
    if (suffix === 'B') return Math.round(numPart * 1000000000);
    return Math.round(numPart);
  }

  const digitsOnly = trimmed.replace(/[^0-9]/g, '');
  if (digitsOnly) {
    const parsed = parseInt(digitsOnly, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

function extractViewsFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/([\d,]+(?:\.\d+)?\s*[kmbKMB]?)\s+(?:views|plays|reels?\s+plays)/i);
  if (match) {
    return parseNumberWithSuffix(match[1]);
  }
  return null;
}

function resolveViewCount(item) {
  // 1. Direct GraphQL Comet Video feedback renderers (Standard FB GraphQL structure)
  const rf = item.video_view_count_renderer?.feedback;
  if (rf) {
    const cand = parseNumberWithSuffix(rf.video_view_count)
      ?? parseNumberWithSuffix(rf.play_count)
      ?? parseNumberWithSuffix(rf.video_post_view_count)
      ?? parseNumberWithSuffix(rf.video_view_count_reduced)
      ?? parseNumberWithSuffix(rf.play_count_reduced);
    if (cand !== null && cand > 0) return cand;
  }

  // 2. Direct top-level fields (videos and reels short_form_video_context)
  const directCandidates = [
    item.videoViewCount,
    item.videoPlayCount,
    item.views,
    item.plays,
    item.viewCount,
    item.playCount,
    item.video_view_count,
    item.viewsCount,
    item.short_form_video_context?.playback_video?.views,
    item.short_form_video_context?.video?.play_count,
    item.short_form_video_context?.playback_video?.play_count,
    item.short_form_video_context?.playback_video?.loop_count,
    item.loop_count,
  ];
  for (const c of directCandidates) {
    const val = parseNumberWithSuffix(c);
    if (val !== null && val > 0) return val;
  }

  // 3. Regex on titles, descriptions, and metadata strings
  const textCandidates = [
    item.previewTitle,
    item.previewDescription,
    item.title,
    item.name,
    item.description,
    item.postText,
    item.caption,
    item.text,
    typeof item.message === 'string' ? item.message : item.message?.text,
  ];
  for (const t of textCandidates) {
    const fromText = extractViewsFromText(t);
    if (fromText !== null && fromText > 0) return fromText;
  }

  return null;
}

async function fetchReelPlayCount(client, targetUrl) {
  try {
    const run = await client.actor('social_developer/facebook-playcount-scraper').call({
      startUrls: [{ url: targetUrl }],
    });
    if (run && run.defaultDatasetId) {
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      if (items && items.length > 0) {
        const exact = parseNumberWithSuffix(items[0].play_count)
          ?? parseNumberWithSuffix(items[0].views)
          ?? parseNumberWithSuffix(items[0].view_count);
        if (exact !== null && exact > 0) {
          return exact;
        }
      }
    }
  } catch (err) {
    // Fall through to other layers
  }
  return null;
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
  const isReelUrl = Boolean(
    targetUrl.includes('/reel/') || targetUrl.includes('/reels/') || targetUrl.includes('/share/r/')
  );
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

      const uploader = item.pageName
        || item.short_form_video_context?.video_owner?.name
        || item.user?.name
        || item.user?.username
        || item.author
        || null;

      const uploaderName = item.short_form_video_context?.video_owner?.name
        || item.pageName
        || item.user?.name
        || null;

      const uploaderId = item.short_form_video_context?.video_owner?.id
        || item.owner?.id
        || item.user?.id
        || item.pageId
        || null;

      const likes = parseNumberWithSuffix(item.likes)
        ?? parseNumberWithSuffix(item.reaction_count?.count)
        ?? parseNumberWithSuffix(item.reaction_count)
        ?? parseNumberWithSuffix(item.i18n_reaction_count)
        ?? parseNumberWithSuffix(item.reactionLikeCount)
        ?? parseNumberWithSuffix(item.likers?.count)
        ?? parseNumberWithSuffix(item.unified_reactors?.count)
        ?? parseNumberWithSuffix(item.likesCount)
        ?? parseNumberWithSuffix(item.reactionCount)
        ?? parseNumberWithSuffix(item.reactions);

      const comments = parseNumberWithSuffix(item.comments)
        ?? parseNumberWithSuffix(item.total_comment_count)
        ?? parseNumberWithSuffix(item.comment_rendering_instance?.comments?.total_count)
        ?? parseNumberWithSuffix(item.commentsCount);

      const shares = parseNumberWithSuffix(item.share_count_reduced)
        ?? parseNumberWithSuffix(item.sharesCount)
        ?? parseNumberWithSuffix(item.shares);

      let views = resolveViewCount(item);

      // If views not found explicitly in item (common on Reels) or is a Reel URL, query the dedicated playcount actor
      if (views === null || isReelUrl || item.short_form_video_context) {
        const exactPlays = await fetchReelPlayCount(client, targetUrl);
        if (exactPlays !== null && exactPlays > 0) {
          views = exactPlays;
        }
      }

      // If still null, calculate organic engagement estimate
      if (views === null) {
        const l = likes || 0;
        const c = comments || 0;
        const s = shares || 0;
        const totalEngagement = l + (c * 2) + (s * 3);
        if (totalEngagement > 0) {
          views = Math.round(totalEngagement * 25);
        }
      }

      const text = item.previewDescription
        || (typeof item.message === 'string' ? item.message : item.message?.text)
        || item.text
        || item.caption
        || item.postText
        || null;

      const title = item.previewTitle
        || item.title
        || item.name
        || (text ? text.slice(0, 80) : `Facebook post by ${uploader || 'creator'}`);

      const thumbnail = item.preferred_thumbnail?.image?.uri
        || item.short_form_video_context?.playback_video?.thumbnailImage?.uri
        || item.short_form_video_context?.video?.first_frame_thumbnail
        || null;

      const durationMs = parseNumberWithSuffix(item.playable_duration_in_ms)
        ?? parseNumberWithSuffix(item.short_form_video_context?.video?.playable_duration_in_ms)
        ?? (item.short_form_video_context?.playback_video?.length_in_second ? Math.round(item.short_form_video_context.playback_video.length_in_second * 1000) : null);

      const timestamp = item.publish_time || item.creation_time || item.timestamp || null;

      return {
        reachable: true,
        platform: 'facebook',
        extractor: 'apify_facebook',
        view_count: views,
        like_count: likes,
        comment_count: comments,
        share_count: shares,
        uploader: uploader,
        uploader_name: uploaderName,
        uploader_id: uploaderId,
        title: title,
        description: text,
        post_url: item.facebookUrl || item.url || targetUrl,
        timestamp: timestamp,
        thumbnail_url: thumbnail,
        duration_ms: durationMs,
        reactions_breakdown: (item.reactionLikeCount || item.reactionHahaCount || item.reactionLoveCount) ? {
          like: item.reactionLikeCount ?? 0,
          haha: item.reactionHahaCount ?? 0,
          love: item.reactionLoveCount ?? 0,
          care: item.reactionCareCount ?? 0,
          angry: item.reactionAngryCount ?? 0,
          wow: item.reactionWowCount ?? 0,
          sad: item.reactionSadCount ?? 0,
        } : null,
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
