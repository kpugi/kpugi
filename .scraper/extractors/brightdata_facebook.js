/**
 * Bright Data Facebook Post Extractor
 * Uses Bright Data Datasets API v3 to fetch post metrics, plays/views, likes, comments, and author.
 */

const path = require('path');
const fs = require('fs');

function loadEnv() {
  if (process.env.BRIGHT_DATA_API_KEY) return;
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

async function scrapeFacebookWithBrightData(targetUrl) {
  if (!targetUrl) {
    return { reachable: false, error: 'No URL provided' };
  }

  loadEnv();
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  if (!apiKey) {
    return {
      reachable: false,
      error: 'BRIGHT_DATA_API_KEY is not configured in environment variables.',
    };
  }

  const isReel = targetUrl.includes('/reel/') || targetUrl.includes('/reels/');
  const datasetId = isReel
    ? (process.env.BRIGHT_DATA_FB_REELS_DATASET || 'gd_lyclm3ey2q6rww027t')
    : (process.env.BRIGHT_DATA_FB_POSTS_DATASET || 'gd_lkaxegm826bjpoo9m5');

  const endpoint = `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${datasetId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ url: targetUrl }]),
      signal: AbortSignal.timeout(28000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        reachable: false,
        platform: 'facebook',
        extractor: 'brightdata_facebook',
        error: `Bright Data HTTP ${response.status}: ${errorText.slice(0, 150)}`,
      };
    }

    const data = await response.json();
    const item = Array.isArray(data) ? data[0] : data;

    if (!item) {
      return {
        reachable: false,
        platform: 'facebook',
        extractor: 'brightdata_facebook',
        error: 'No post data returned from Bright Data',
      };
    }

    const uploader = item.page_name || item.profile_name || item.author_name || item.user_username || null;
    const views = typeof item.video_views === 'number'
      ? item.video_views
      : (typeof item.play_count === 'number' ? item.play_count : (typeof item.views === 'number' ? item.views : null));
    const likes = typeof item.likes === 'number' ? item.likes : (typeof item.reactions === 'number' ? item.reactions : null);
    const comments = typeof item.num_comments === 'number' ? item.num_comments : (typeof item.comments === 'number' ? item.comments : null);
    const shares = typeof item.num_shares === 'number' ? item.num_shares : (typeof item.shares === 'number' ? item.shares : null);
    const text = item.post_text || item.caption || item.text || item.description || null;

    return {
      reachable: true,
      platform: 'facebook',
      extractor: 'brightdata_facebook',
      view_count: views,
      like_count: likes,
      comment_count: comments,
      share_count: shares,
      uploader: uploader,
      uploader_name: uploader,
      title: text ? text.slice(0, 80) : `Facebook post by ${uploader || 'creator'}`,
      description: text,
      post_url: item.url || targetUrl,
    };
  } catch (err) {
    return {
      reachable: false,
      platform: 'facebook',
      extractor: 'brightdata_facebook',
      error: err.message || String(err),
    };
  }
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error(JSON.stringify({ reachable: false, error: 'Usage: node brightdata_facebook.js <url>' }));
    process.exit(1);
  }

  scrapeFacebookWithBrightData(target)
    .then((res) => {
      console.log(JSON.stringify(res));
      process.exit(res.reachable ? 0 : 1);
    })
    .catch((err) => {
      console.error(JSON.stringify({ reachable: false, error: err.message }));
      process.exit(1);
    });
}

module.exports = { scrapeFacebookWithBrightData };
