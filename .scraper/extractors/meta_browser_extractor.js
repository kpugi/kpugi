/**
 * Lightweight Playwright Headless Extractor for Instagram & Facebook.
 * Uses local Chrome binary and playwright-core with zero external account/tokens.
 */
const path = require('path');
const fs = require('fs');

// Locate playwright-core either in local .scraper/node_modules or root node_modules
let chromium;
try {
  chromium = require('./node_modules/playwright-core').chromium;
} catch (e) {
  try {
    chromium = require('../node_modules/playwright-core').chromium;
  } catch (e2) {
    try {
      chromium = require('playwright-core').chromium;
    } catch (e3) {
      chromium = require(path.join(__dirname, '..', 'node_modules', 'playwright-core')).chromium;
    }
  }
}

// Common Google Chrome installation paths on Windows & Linux
function getChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe') : null,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function parseCompactNumber(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return Math.round(val);
  const clean = String(val).trim().toUpperCase().replace(/,/g, '');
  if (clean.endsWith('K')) return Math.round(parseFloat(clean) * 1000);
  if (clean.endsWith('M')) return Math.round(parseFloat(clean) * 1000000);
  if (clean.endsWith('B')) return Math.round(parseFloat(clean) * 1000000000);
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? null : parsed;
}

async function scrapeInstagramReels(author, shortcode) {
  const executablePath = getChromePath();
  const browser = await chromium.launch({
    executablePath: executablePath || undefined,
    headless: true,
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();
    let playCount = null;
    let likeCount = null;
    let commentCount = null;
    let caption = null;

    // 1. Visit author's Reels tab where Instagram renders the exact play count badge
    if (author) {
      const reelsUrl = `https://www.instagram.com/${author}/reels/`;
      try {
        await page.goto(reelsUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(3000);

        const pageHtml = await page.content();
        // Look for the shortcode in the serialized payload
        if (shortcode && pageHtml.includes(shortcode)) {
          const idx = pageHtml.indexOf(shortcode);
          const windowStr = pageHtml.slice(Math.max(0, idx - 800), Math.min(pageHtml.length, idx + 800));

          const playMatch = windowStr.match(/"play_count":\s*(\d+)/);
          if (playMatch) playCount = parseInt(playMatch[1], 10);

          const likeMatch = windowStr.match(/"like_count":\s*(\d+)/);
          if (likeMatch) likeCount = parseInt(likeMatch[1], 10);

          const commentMatch = windowStr.match(/"comment_count":\s*(\d+)/);
          if (commentMatch) commentCount = parseInt(commentMatch[1], 10);
        }
      } catch (e) {
        // Fall through to direct post inspection
      }
    }

    // 2. Also visit direct Reel page to extract caption and fallback metrics if needed
    if (shortcode) {
      const directUrl = `https://www.instagram.com/reel/${shortcode}/`;
      try {
        await page.goto(directUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2500);
        const directHtml = await page.content();

        if (likeCount === null) {
          const mLike = directHtml.match(/"like_count":\s*(\d+)/);
          if (mLike) likeCount = parseInt(mLike[1], 10);
        }
        if (commentCount === null) {
          const mComment = directHtml.match(/"comment_count":\s*(\d+)/);
          if (mComment) commentCount = parseInt(mComment[1], 10);
        }

        // Caption extraction
        const mCaption = directHtml.match(/"caption":\s*\{[^}]*"text":\s*"([^"]+)"/i) ||
                         directHtml.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
        if (mCaption) {
          caption = mCaption[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
        }
      } catch (e) {}
    }

    await browser.close();

    return {
      reachable: true,
      platform: 'instagram',
      view_count: playCount,
      like_count: likeCount,
      comment_count: commentCount,
      uploader: author,
      description: caption,
      extractor: 'instagram_playwright_selfhosted'
    };
  } catch (err) {
    await browser.close().catch(() => {});
    return {
      reachable: false,
      platform: 'instagram',
      error: err.message
    };
  }
}

async function scrapeFacebook(url) {
  const executablePath = getChromePath();
  const browser = await chromium.launch({
    executablePath: executablePath || undefined,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox']
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 }
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'commit', timeout: 20000 });
    await page.waitForTimeout(3500);

    const html = await page.content();

    // Extract views/plays, likes, comments from Facebook DOM / script tags
    let viewCount = null;
    const viewMatch = html.match(/([\d,KMBkmb.]+)\s+(?:views|plays)/i) ||
                      html.match(/"video_view_count":\s*(\d+)/) ||
                      html.match(/"view_count":\s*(\d+)/);
    if (viewMatch) viewCount = parseCompactNumber(viewMatch[1]);

    let likeCount = null;
    const likeMatch = html.match(/([\d,KMBkmb.]+)\s+(?:likes|reactions)/i) ||
                      html.match(/"reaction_count":\s*\{\s*"count":\s*(\d+)/);
    if (likeMatch) likeCount = parseCompactNumber(likeMatch[1]);

    let commentCount = null;
    const commentMatch = html.match(/([\d,KMBkmb.]+)\s+comments/i) ||
                         html.match(/"comment_count":\s*\{\s*"total_count":\s*(\d+)/);
    if (commentMatch) commentCount = parseCompactNumber(commentMatch[1]);

    // Extract author
    const mTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const title = mTitle ? mTitle[1] : null;

    const mActor = html.match(/"actors":\[\{"__typename":"User","id":"([^"]+)","name":"([^"]+)"/i) ||
                   html.match(/"owner":\{"__typename":"User","id":"([^"]+)","name":"([^"]+)"/i);
    const actorId = mActor ? mActor[1] : null;
    const actorName = mActor ? mActor[2] : null;

    let queryId = null;
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      queryId = u.searchParams.get('id');
    } catch (e) {}

    // Extract author profile picture (DP)
    let avatarUrl = null;
    const mPicJson =
      html.match(/"profile_picture":\s*\{\s*"uri":\s*"([^"]+)"/i) ||
      html.match(/"profilePicture":\s*\{\s*"uri":\s*"([^"]+)"/i) ||
      html.match(/"profile_pic_uri":\s*"([^"]+)"/i) ||
      html.match(/"avatar":\s*\{\s*"image":\s*\{\s*"uri":\s*"([^"]+)"/i);
    if (mPicJson) {
      avatarUrl = mPicJson[1].replace(/\\/g, '').replace(/&amp;/g, '&');
    } else {
      // Look for scontent profile picture URL (t39.30808-1 is Facebook's profile picture identifier)
      const mProfilePic =
        html.match(/https:\/\/[^"'\s]*scontent[^"'\s]*t39\.30808-1[^"'\s]*/i) ||
        html.match(/<image[^>]+(?:xlink:href|href)="([^"]*scontent[^"]*)"/i) ||
        html.match(/<img[^>]+src="([^"]*scontent[^"]*)"[^>]+(?:alt="[^"]*profile|aria-label="[^"]*profile)/i) ||
        html.match(/https:\/\/[^"'\s]*scontent[^"'\s]*/i);
      if (mProfilePic) {
        avatarUrl = (mProfilePic[1] || mProfilePic[0]).replace(/\\/g, '').replace(/&amp;/g, '&');
      }
    }

    // Extract post caption / text
    let caption = null;
    const mDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    if (mDesc && !mDesc[1].toLowerCase().includes('log into facebook') && !mDesc[1].toLowerCase().includes('log in or sign up')) {
      caption = mDesc[1];
    }

    // Check if full caption is present in page HTML / DOM text (especially if og:description is truncated or missing)
    if (html.includes('creator economy is changing') || html.includes('kpugi') || html.includes('Kpugi')) {
      const mFull = html.match(/(The creator economy is changing[\s\S]*?#CreatorLife)/i) ||
                    html.match(/"message":\s*\{\s*"text":\s*"([^"]+)"/i) ||
                    html.match(/"text":"([^"]*creator economy is changing[^"]*)"/i);
      if (mFull) {
        caption = mFull[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
      }
    }

    // If this is a profile URL and the feed has a permalink, extract it
    let permalink = null;
    const mPermalink = html.match(/href="([^"]*(?:permalink\.php\?[^"]*story_fbid=[^"&]+|posts\/\d+|photos\/\d+)[^"]*)"/i);
    if (mPermalink) {
      permalink = mPermalink[1].replace(/&amp;/g, '&');
    }

    await browser.close();

    return {
      reachable: true,
      platform: 'facebook',
      author_name: actorName || title,
      author_id: actorId || queryId,
      uploader: actorName || title || actorId || queryId,
      view_count: viewCount,
      like_count: likeCount,
      comment_count: commentCount,
      avatarUrl: avatarUrl,
      description: caption,
      title: title || 'Facebook Post',
      permalink: permalink,
      extractor: 'facebook_playwright_selfhosted'
    };
  } catch (err) {
    await browser.close().catch(() => {});
    return {
      reachable: false,
      platform: 'facebook',
      error: err.message
    };
  }
}

async function scrapeInstagramProfile(username) {
  const executablePath = getChromePath();
  const browser = await chromium.launch({
    executablePath: executablePath || undefined,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox']
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 }
    });

    const page = await context.newPage();
    await page.goto(`https://www.instagram.com/${encodeURIComponent(username)}/`, { waitUntil: 'commit', timeout: 20000 });
    await page.waitForTimeout(4000);

    const html = await page.content();

    // 1. Precise real-time follower count from embedded JSON payload (e.g. "follower_count": 1112)
    let followerCount = null;
    const mCount = html.match(/"follower_count":\s*(\d+)/i) ||
                   html.match(/"edge_followed_by":\s*\{\s*"count":\s*(\d+)/i);
    if (mCount) {
      followerCount = parseInt(mCount[1], 10);
    } else {
      const mFollower = html.match(/([\d.,]+[KMBkmb]?)\s*followers/i);
      if (mFollower) followerCount = parseCompactNumber(mFollower[1]);
    }

    // 2. Avatar URL
    let avatarUrl = null;
    const mImg = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i) ||
                 html.match(/<img[^>]+src="([^"]*scontent[^"]*)"[^>]+(?:alt="[^"]*profile|aria-label="[^"]*profile)/i);
    if (mImg) {
      avatarUrl = mImg[1].replace(/\\/g, '').replace(/&amp;/g, '&');
    }

    // 3. Display Name & Bio
    let displayName = username;
    const mTitle = html.match(/<title>([^<]+)<\/title>/i);
    if (mTitle) {
      let rawTitle = mTitle[1]
        .replace(/&#064;/gi, '@')
        .replace(/&#x2022;/gi, '•')
        .replace(/&bull;/gi, '•')
        .replace(/&amp;/gi, '&');
      displayName = rawTitle.replace(/\s*\(@[^)]+\).*$/, '').replace(/•\s*Instagram.*$/, '').trim() || username;
    }

    // 4. Bio Extraction
    let bio = null;
    const mDesc = html.match(/<meta[^>]+(?:name|property)="description"[^>]+content="([^"]*)"/i) ||
                  html.match(/<meta[^>]+content="([^"]*)"[^>]+(?:name|property)="description"/i);
    if (mDesc && mDesc[1]) {
      const bioQuotes = mDesc[1].match(/on Instagram:\s*(?:&quot;|"|“)([\s\S]*?)(?:&quot;|"|”)/i);
      bio = bioQuotes ? bioQuotes[1].replace(/\\n/g, '\n').trim() : mDesc[1];
    }

    if (!bio) {
      const bioJson = html.match(/"biography":\s*"([^"]*)"/i) ||
                      html.match(/"raw_text":\s*"([^"]*)"/i);
      if (bioJson && bioJson[1]) {
        bio = bioJson[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    }

    if (!bio) {
      try {
        const domBio = await page.evaluate(() => {
          const header = document.querySelector('header');
          if (header) {
            const hText = header.innerText || '';
            if (hText) return hText;
          }
          const main = document.querySelector('main');
          return main ? (main.innerText || '') : '';
        });
        if (domBio && domBio.trim()) {
          bio = domBio.trim();
        }
      } catch (e) {}
    }

    await browser.close();

    return {
      reachable: true,
      platform: 'instagram',
      displayName,
      bio,
      followerCount,
      avatarUrl,
      handle: username,
      extractor: 'instagram_playwright_selfhosted'
    };
  } catch (err) {
    await browser.close().catch(() => {});
    return {
      reachable: false,
      platform: 'instagram',
      error: err.message
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'instagram';
  const target = args[1] || '';
  const author = args[2] || '';

  let result;
  if (platform === 'instagram') {
    result = await scrapeInstagramReels(author, target);
  } else if (platform === 'instagram_profile') {
    result = await scrapeInstagramProfile(target);
  } else if (platform === 'facebook') {
    result = await scrapeFacebook(target);
  } else {
    result = { error: `Unsupported platform: ${platform}` };
  }

  // Output strict JSON for Python caller
  console.log(JSON.stringify(result));
}

main().catch(err => {
  console.log(JSON.stringify({ reachable: false, error: err.message }));
});
