import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { saveSocialAccount } from '@/lib/supabase/creator';
import { exchangeInstagramCode, getInstagramLongLivedToken, fetchInstagramUserProfile } from '@/lib/oauth/instagram';
import { notifyCreatorSocialConnected } from '@/lib/notifications/creator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/oauth/instagram/callback`;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=missing_code`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('instagram_oauth_state')?.value;

  if (savedState && state && state !== savedState) {
    console.warn(`Instagram OAuth State Mismatch: state=${state}, savedState=${savedState}`);
  }

  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=instagram_keys_missing`);
  }

  try {
    // 1. Exchange authorization code for short-lived access token
    const tokenResult = await exchangeInstagramCode(code, redirectUri);

    // 2. Upgrade to 60-day Long-Lived Access Token
    const longLivedToken = await getInstagramLongLivedToken(tokenResult.accessToken);

    // 3. Fetch Instagram User Profile
    const profile = await fetchInstagramUserProfile(longLivedToken);

    const username = profile.username ? profile.username.trim().replace(/^@/, '').toLowerCase() : `ig_${profile.id}`;

    // 4. Save to Supabase social_accounts
    const userProfile = await getOrCreateUserProfile();
    if (userProfile?.profile?.id && username) {
      await saveSocialAccount({
        profileId: userProfile.profile.id,
        platform: 'instagram',
        handle: username,
        platformUserId: profile.id || username,
        followerCount: profile.followerCount || 0,
        videoCount: profile.mediaCount || 0,
        avatarUrl: profile.avatarUrl || null,
        accessToken: longLivedToken,
        scopes: ['instagram_basic', 'pages_show_list', 'public_profile'],
      });

      // Fire in-app + email notification (non-blocking)
      notifyCreatorSocialConnected({
        clerkId: userProfile.profile.clerk_id,
        email: userProfile.profile.email,
        platform: 'Instagram',
        handle: username,
        profileId: userProfile.profile.id,
      }).catch(() => {});
    }

    // Return auto-closing HTML window
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Instagram Account Connected</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { background-color: #0f172a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { text-align: center; background: #1e293b; border: 1px solid #334155; padding: 28px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
            .icon { width: 48px; height: 48px; background: #e1306c; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; color: white; }
            h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; }
            p { margin: 0; color: #94a3b8; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✓</div>
            <h2>Instagram Connected!</h2>
            <p>Linked @${username}. Closing window...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_SUCCESS', platform: 'instagram', username: '${encodeURIComponent(username)}' }, '*');
              }
            } catch (e) {}
            setTimeout(function() { window.close(); }, 1200);
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err: any) {
    console.error('Instagram OAuth Exception:', err);
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
