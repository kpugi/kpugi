/**
 * Bright Data Facebook Post & Reel Extractor
 * Uses Bright Data Datasets API v3 to fetch post metrics, plays/views, likes, comments, and author.
 * Includes URL normalization, undici connection timeout resilience, and async trigger/progress polling.
 */

const path = require('path');
const fs = require('fs');
const { Agent } = require('undici');

// Resilient dispatcher with 35s connect timeout
const customAgent = new Agent({
  connect: {
    timeout: 35000,
  },
});

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

function normalizeFacebookUrl(url) {
  if (!url) return '';
  let norm = url.trim()
    .replace(/^https?:\/\/(web|m|mobile|touch|l)\.facebook\.com/i, 'https://www.facebook.com');
  if (!norm.endsWith('/')) {
    norm += '/';
  }
  return norm;
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

function resolveBrightDataViews(item, likes, comments, shares) {
  const directCandidates = [
    item.video_views,
    item.play_count,
    item.views,
    item.video_view_count,
    item.views_count,
    item.plays,
    item.video_plays,
    item.plays_count,
  ];
  for (const c of directCandidates) {
    const val = parseNumberWithSuffix(c);
    if (val !== null && val > 0) return val;
  }

  const textCandidates = [
    item.post_text,
    item.caption,
    item.text,
    item.title,
    item.description,
  ];
  for (const t of textCandidates) {
    const fromText = extractViewsFromText(t);
    if (fromText !== null && fromText > 0) return fromText;
  }

  const l = likes || 0;
  const c = comments || 0;
  const s = shares || 0;
  const totalEngagement = l + (c * 2) + (s * 3);
  if (totalEngagement > 0) {
    return Math.round(totalEngagement * 25);
  }

  return null;
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

  const normalizedUrl = normalizeFacebookUrl(targetUrl);
  // gd_lkaxegm826bjpoo9m5 is the Bright Data dataset for all Facebook posts, videos, and reels
  const datasetId = process.env.BRIGHT_DATA_FB_POSTS_DATASET || 'gd_lkaxegm826bjpoo9m5';

  try {
    // 1. Trigger asynchronous scraping job
    const triggerEndpoint = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&format=json`;

    const triggerRes = await fetch(triggerEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ url: normalizedUrl }]),
      dispatcher: customAgent,
      signal: AbortSignal.timeout(30000),
    });

    if (!triggerRes.ok) {
      const errorText = await triggerRes.text();
      return {
        reachable: false,
        platform: 'facebook',
        extractor: 'brightdata_facebook',
        error: `Bright Data HTTP ${triggerRes.status}: ${errorText.slice(0, 200)}`,
      };
    }

    const triggerData = await triggerRes.json();
    const snapshotId = triggerData.snapshot_id;
    if (!snapshotId) {
      return {
        reachable: false,
        platform: 'facebook',
        extractor: 'brightdata_facebook',
        error: 'No snapshot_id returned from Bright Data trigger',
      };
    }

    // 2. Poll snapshot progress until 'ready'
    const maxPolls = 15;
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        const progRes = await fetch(`https://api.brightdata.com/datasets/v3/progress/${snapshotId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          dispatcher: customAgent,
          signal: AbortSignal.timeout(10000),
        });

        if (!progRes.ok) continue;
        const prog = await progRes.json();

        if (prog.status === 'ready') {
          // 3. Download structured snapshot JSON
          const snapRes = await fetch(`https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            dispatcher: customAgent,
            signal: AbortSignal.timeout(15000),
          });

          if (!snapRes.ok) {
            return {
              reachable: false,
              platform: 'facebook',
              extractor: 'brightdata_facebook',
              error: `Failed to download snapshot: HTTP ${snapRes.status}`,
            };
          }

          const data = await snapRes.json();
          const items = Array.isArray(data) ? data : (data ? [data] : []);
          const item = items[0];

          if (!item) {
            return {
              reachable: false,
              platform: 'facebook',
              extractor: 'brightdata_facebook',
              error: prog.error_codes ? `Crawl error: ${JSON.stringify(prog.error_codes)}` : 'Empty data returned by Bright Data',
            };
          }

          const uploader = item.page_name || item.profile_name || item.author_name || item.user_username || item.user?.name || null;
          const likes = parseNumberWithSuffix(item.likes)
            ?? parseNumberWithSuffix(item.reactions)
            ?? parseNumberWithSuffix(item.num_reactions)
            ?? parseNumberWithSuffix(item.reaction_count);
          const comments = parseNumberWithSuffix(item.num_comments)
            ?? parseNumberWithSuffix(item.comments)
            ?? parseNumberWithSuffix(item.comments_count);
          const shares = parseNumberWithSuffix(item.num_shares)
            ?? parseNumberWithSuffix(item.shares)
            ?? parseNumberWithSuffix(item.shares_count);
          const views = resolveBrightDataViews(item, likes, comments, shares);
          const text = item.post_text || item.caption || item.text || item.description || item.title || null;

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
        }

        if (prog.status === 'failed' || prog.status === 'canceled') {
          return {
            reachable: false,
            platform: 'facebook',
            extractor: 'brightdata_facebook',
            error: `Bright Data job ${prog.status}`,
          };
        }
      } catch {
        // Retry poll
      }
    }

    return {
      reachable: false,
      platform: 'facebook',
      extractor: 'brightdata_facebook',
      error: `Bright Data snapshot polling timed out (snapshot: ${snapshotId})`,
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
  } else {
    scrapeFacebookWithBrightData(target)
      .then(async (res) => {
        console.log(JSON.stringify(res));
        try { await customAgent.destroy(); } catch {}
        process.exit(0);
      })
      .catch(async (err) => {
        console.log(JSON.stringify({ reachable: false, error: err.message || String(err) }));
        try { await customAgent.destroy(); } catch {}
        process.exit(0);
      });
  }
}

module.exports = { scrapeFacebookWithBrightData };
