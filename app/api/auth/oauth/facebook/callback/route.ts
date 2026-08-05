import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { saveSocialAccount } from '@/lib/supabase/creator';
import { exchangeFacebookCode, fetchFacebookUserProfile, fetchFacebookPages } from '@/lib/oauth/facebook';
import { notifyCreatorSocialConnected } from '@/lib/notifications/creator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/oauth/facebook/callback`;

  const errorHtml = (message: string) => `<!DOCTYPE html>
  <html>
    <head><title>Authentication Error</title></head>
    <body style="background:#0f172a;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
      <div style="text-align:center;padding:20px;">
        <h2>Authentication Failed</h2>
        <p style="color:#94a3b8;">${message}. Closing window...</p>
      </div>
      <script>setTimeout(function() { window.close(); }, 2500);</script>
    </body>
  </html>`;

  if (error) {
    return new NextResponse(errorHtml(error), { headers: { 'Content-Type': 'text/html' } });
  }

  if (!code) {
    return new NextResponse(errorHtml('Missing authorization code'), { headers: { 'Content-Type': 'text/html' } });
  }

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  if (!appId) {
    return new NextResponse(errorHtml('Facebook app not configured'), { headers: { 'Content-Type': 'text/html' } });
  }

  try {
    // 1. Exchange code for access token
    const tokenResult = await exchangeFacebookCode(code, redirectUri);

    // 2. Fetch personal profile
    const profile = await fetchFacebookUserProfile(tokenResult.accessToken);
    const username = profile.name
      ? profile.name.trim().replace(/\s+/g, '_').toLowerCase()
      : `fb_${profile.id}`;

    // 3. Save personal Facebook account
    const userProfile = await getOrCreateUserProfile();
    if (userProfile?.profile?.id) {
      await saveSocialAccount({
        profileId: userProfile.profile.id,
        platform: 'facebook',
        handle: username,
        platformUserId: profile.id,
        avatarUrl: profile.avatarUrl,
        accessToken: tokenResult.accessToken,
        scopes: ['public_profile', 'pages_show_list'],
      });

      notifyCreatorSocialConnected({
        clerkId: userProfile.profile.clerk_id,
        email: userProfile.profile.email,
        platform: 'Facebook',
        handle: username,
        profileId: userProfile.profile.id,
      }).catch(() => {});
    }

    // 4. Fetch managed pages to show picker
    const pages = await fetchFacebookPages(tokenResult.accessToken);

    // 5a. No pages — auto-close with success
    if (pages.length === 0) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Facebook Connected</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { background:#0f172a; color:#fff; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
              .card { text-align:center; background:#1e293b; border:1px solid #334155; padding:28px; border-radius:20px; }
              .icon { width:48px; height:48px; background:#1877f2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:24px; }
              h2 { margin:0 0 8px; font-size:20px; font-weight:700; }
              p { margin:0; color:#94a3b8; font-size:13px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">✓</div>
              <h2>Facebook Connected!</h2>
              <p>Linked @${username}. Closing window...</p>
            </div>
            <script>
              try { if (window.opener) window.opener.postMessage({ type: 'OAUTH_SUCCESS', platform: 'facebook', username: '${encodeURIComponent(username)}' }, '*'); } catch(e) {}
              setTimeout(function() { window.close(); }, 1200);
            </script>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // 5b. Has pages — show page picker UI
    const pagesJson = JSON.stringify(pages);
    const accessTokenJson = JSON.stringify(tokenResult.accessToken);

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Connect Facebook Pages</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: #0f172a; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; padding: 24px 16px; }
            .header { text-align: center; margin-bottom: 24px; }
            .header .fb-icon { width: 44px; height: 44px; background: #1877f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 22px; }
            .header h2 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
            .header p { color: #94a3b8; font-size: 13px; }
            .pages-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
            .page-item { display: flex; align-items: center; gap: 12px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 12px; cursor: pointer; transition: border-color 0.15s; }
            .page-item:hover { border-color: #1877f2; }
            .page-item.selected { border-color: #1877f2; background: #1e3a5f; }
            .page-item input[type="checkbox"] { display: none; }
            .page-avatar { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: #334155; flex-shrink: 0; }
            .page-avatar-placeholder { width: 40px; height: 40px; border-radius: 8px; background: #1877f2; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
            .page-info { flex: 1; min-width: 0; }
            .page-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .page-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
            .check { width: 20px; height: 20px; border: 2px solid #475569; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
            .page-item.selected .check { background: #1877f2; border-color: #1877f2; }
            .check::after { content: '✓'; font-size: 11px; color: white; display: none; }
            .page-item.selected .check::after { display: block; }
            .actions { display: flex; flex-direction: column; gap: 10px; }
            .btn { width: 100%; padding: 12px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
            .btn-primary { background: #1877f2; color: #fff; }
            .btn-primary:hover { opacity: 0.9; }
            .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
            .btn-skip { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
            .btn-skip:hover { color: #fff; }
            .status { text-align: center; font-size: 13px; color: #94a3b8; margin-top: 8px; display: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="fb-icon">f</div>
            <h2>Also connect your Pages?</h2>
            <p>Select the Facebook Pages you manage to connect them to Kpugi.</p>
          </div>

          <div class="pages-list" id="pagesList"></div>

          <div class="actions">
            <button class="btn btn-primary" id="connectBtn" disabled onclick="connectSelected()">
              Connect Selected Pages
            </button>
            <button class="btn btn-skip" onclick="skip()">Skip — just my profile</button>
          </div>
          <div class="status" id="status">Connecting pages...</div>

          <script>
            const PAGES = ${pagesJson};
            const ACCESS_TOKEN = ${accessTokenJson};
            const selected = new Set();

            function formatFollowers(n) {
              if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
              if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
              return n.toString();
            }

            function renderPages() {
              const list = document.getElementById('pagesList');
              list.innerHTML = '';
              PAGES.forEach(function(page) {
                const item = document.createElement('div');
                item.className = 'page-item';
                item.dataset.id = page.id;

                const avatar = page.picture
                  ? '<img class="page-avatar" src="' + page.picture + '" alt="">'
                  : '<div class="page-avatar-placeholder">' + page.name.charAt(0).toUpperCase() + '</div>';

                const followers = page.followersCount > 0
                  ? formatFollowers(page.followersCount) + ' followers'
                  : page.fanCount > 0
                    ? formatFollowers(page.fanCount) + ' fans'
                    : page.category;

                item.innerHTML = avatar +
                  '<div class="page-info">' +
                    '<div class="page-name">' + page.name + '</div>' +
                    '<div class="page-meta">' + followers + ' &middot; ' + page.category + '</div>' +
                  '</div>' +
                  '<div class="check"></div>';

                item.addEventListener('click', function() {
                  if (selected.has(page.id)) {
                    selected.delete(page.id);
                    item.classList.remove('selected');
                  } else {
                    selected.add(page.id);
                    item.classList.add('selected');
                  }
                  document.getElementById('connectBtn').disabled = selected.size === 0;
                  document.getElementById('connectBtn').textContent =
                    selected.size > 0
                      ? 'Connect ' + selected.size + ' Page' + (selected.size > 1 ? 's' : '')
                      : 'Connect Selected Pages';
                });

                list.appendChild(item);
              });
            }

            async function connectSelected() {
              const btn = document.getElementById('connectBtn');
              const status = document.getElementById('status');
              btn.disabled = true;
              status.style.display = 'block';

              try {
                const res = await fetch('/api/auth/oauth/facebook/pages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userAccessToken: ACCESS_TOKEN, pageIds: Array.from(selected) }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  status.textContent = 'Pages connected! Closing...';
                  try { if (window.opener) window.opener.postMessage({ type: 'OAUTH_SUCCESS', platform: 'facebook', username: data.saved.join(', ') }, '*'); } catch(e) {}
                  setTimeout(function() { window.close(); }, 1200);
                } else {
                  status.textContent = data.error || 'Failed to connect pages.';
                  btn.disabled = false;
                }
              } catch(e) {
                status.textContent = 'Network error. Try again.';
                btn.disabled = false;
              }
            }

            function skip() {
              try { if (window.opener) window.opener.postMessage({ type: 'OAUTH_SUCCESS', platform: 'facebook', username: '${encodeURIComponent(username)}' }, '*'); } catch(e) {}
              setTimeout(function() { window.close(); }, 300);
            }

            renderPages();
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err: any) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="background:#0f172a;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:20px;">
            <h2>Authentication Failed</h2>
            <p style="color:#94a3b8;">${err?.message || 'OAuth Exception'}. Closing window...</p>
          </div>
          <script>setTimeout(function() { window.close(); }, 2500);</script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
