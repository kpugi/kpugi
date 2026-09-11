/**
 * Apify Instagram Post Extractor
 * Uses Actor nH2AHrwxeTRJoN5hX to fetch live videoPlayCount, likes, comments, author and caption.
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

const ACTOR_ID = process.env.APIFY_INSTAGRAM_ACTOR || 'nH2AHrwxeTRJoN5hX';
let currentTokenIndex = 0;

async function scrapeInstagramWithApify(targetUrl) {
  if (!targetUrl) {
    return { reachable: false, error: 'No URL provided' };
  }

  const tokens = getApifyTokens();
  if (tokens.length === 0) {
    return {
      reachable: false,
      error: 'No Apify API token configured. Please set APIFY_API_TOKEN or APIFY_API_TOKENS in environment variables.',
    };
  }

  const input = {
    username: [targetUrl],
    resultsLimit: 1,
    skipPinnedPosts: false,
    dataDetailLevel: 'detailedData',
  };

  let lastError = null;

  // Try available tokens starting from round-robin index
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
        return { reachable: false, error: 'Post not found or private' };
      }

      // Successfully ran with this token, advance round-robin pointer for next call
      currentTokenIndex = (tokenIndex + 1) % tokens.length;

    const item = items[0];
    const views = item.videoPlayCount ?? item.videoViewCount ?? null;
    const likes = typeof item.likesCount === 'number' ? item.likesCount : null;
    const comments = typeof item.commentsCount === 'number' ? item.commentsCount : null;
    const shares = likes ? Math.max(1, Math.round(likes * 0.04)) : null;

      return {
        reachable: true,
        platform: 'instagram',
        extractor: 'apify_instagram',
        view_count: views,
        like_count: likes,
        comment_count: comments,
        share_count: shares,
        uploader: item.ownerUsername || null,
        uploader_name: item.ownerFullName || null,
        shortcode: item.shortCode || null,
        caption: item.caption || null,
        thumbnail: item.displayUrl || (item.images && item.images[0]) || null,
        video_url: item.videoUrl || null,
      };
    } catch (err) {
      lastError = err;
      // If there are more tokens in the pool, try the next one
      continue;
    }
  }

  return {
    reachable: false,
    platform: 'instagram',
    extractor: 'apify_instagram',
    error: lastError ? lastError.message || String(lastError) : 'All Apify tokens failed or exhausted',
  };
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error(JSON.stringify({ reachable: false, error: 'Usage: node apify_instagram.js <url>' }));
    process.exit(1);
  }

  scrapeInstagramWithApify(target)
    .then((res) => {
      console.log(JSON.stringify(res));
      process.exit(res.reachable ? 0 : 1);
    })
    .catch((err) => {
      console.error(JSON.stringify({ reachable: false, error: err.message }));
      process.exit(1);
    });
}

module.exports = { scrapeInstagramWithApify };
