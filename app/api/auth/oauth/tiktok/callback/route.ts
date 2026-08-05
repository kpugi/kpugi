import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { saveSocialAccount } from '@/lib/supabase/creator';
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
  const baseUrl = appUrl || `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/oauth/tiktok/callback`;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=missing_code`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('tiktok_oauth_state')?.value;
  const codeVerifier = cookieStore.get('tiktok_code_verifier')?.value;

  if (savedState && state && state !== savedState) {
    console.warn(`TikTok OAuth State Mismatch: state=${state}, savedState=${savedState}`);
  }

  const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=tiktok_keys_missing`);
  }

  try {
    // 1. Exchange authorization code for Access Token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier || '',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error('TikTok Token Error:', tokenData);
      return NextResponse.redirect(`${baseUrl}/accounts?error=${encodeURIComponent(tokenData.error_description || 'token_failed')}`);
    }

    const accessToken = tokenData.access_token;
    const openId = tokenData.open_id;

    // 2. Fetch User Profile Info from TikTok Display API
    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,avatar_url_100,avatar_large_url,display_name,username,follower_count,following_count,likes_count,video_count',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = await userRes.json();
    console.log('TikTok User Data API Response:', JSON.stringify(userData));
    
    const tiktokUser = userData?.data?.user;
    const avatarUrl = tiktokUser?.avatar_large_url || tiktokUser?.avatar_url_100 || tiktokUser?.avatar_url || null;
    const followerCount = tiktokUser?.follower_count ?? tiktokUser?.followers_count ?? 0;
    const followingCount = tiktokUser?.following_count ?? tiktokUser?.followings_count ?? tiktokUser?.following ?? 0;
    const likesCount = tiktokUser?.likes_count ?? tiktokUser?.like_count ?? tiktokUser?.likes ?? tiktokUser?.heart_count ?? tiktokUser?.total_likes ?? 0;
    const videoCount = tiktokUser?.video_count ?? tiktokUser?.videos_count ?? tiktokUser?.video_total ?? 0;

    let username = tiktokUser?.username || tiktokUser?.display_name;

    // Handle Sandbox open_id fallback when username is missing or restricted by TikTok Sandbox
    if (!username || username.startsWith('-000')) {
      const userProfile = await getOrCreateUserProfile();
      const creatorName = userProfile?.profile?.full_name || userProfile?.profile?.email?.split('@')[0];
      username = creatorName ? creatorName.replace(/\s+/g, '_').toLowerCase() : (openId ? `tiktok_${openId.slice(-6)}` : 'creator');
    } else {
      username = username.trim().replace(/^@/, '').replace(/\s+/g, '_').toLowerCase();
    }

    // 3. Save to Supabase social_accounts & creator_profiles tables
    const userProfile = await getOrCreateUserProfile();
    if (userProfile?.profile?.id && username) {
      await saveSocialAccount({
        profileId: userProfile.profile.id,
        platform: 'tiktok',
        handle: username,
        platformUserId: openId || username,
        followerCount,
        followingCount,
        likesCount,
        videoCount,
        avatarUrl,
        accessToken,
        scopes: ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.list'],
      });

      // Fire in-app + email notification (non-blocking)
      notifyCreatorSocialConnected({
        clerkId: userProfile.profile.clerk_id,
        email: userProfile.profile.email,
        platform: 'TikTok',
        handle: username,
        profileId: userProfile.profile.id,
      }).catch(() => {});
    }

    // Return auto-close HTML response for popup window
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>TikTok Account Connected</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { background-color: #0f172a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { text-align: center; background: #1e293b; border: 1px solid #334155; padding: 28px; rounded-radius: 20px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
            .icon { width: 48px; height: 48px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; }
            h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; }
            p { margin: 0; color: #94a3b8; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✓</div>
            <h2>TikTok Connected!</h2>
            <p>Linked @${username}. Closing window...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_SUCCESS', platform: 'tiktok', username: '${encodeURIComponent(username)}' }, '*');
              }
            } catch (e) {}
            setTimeout(function() { window.close(); }, 1200);
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err: any) {
    console.error('TikTok OAuth Exception:', err);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="background:#0f172a;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-center;height:100vh;margin:0;">
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
