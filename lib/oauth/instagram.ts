/**
 * Instagram OAuth — Instagram API with Instagram Login
 *
 * Uses the standalone Instagram Login flow (no Facebook Page required).
 * Requires the app to have "Instagram API with Instagram Login" product
 * added in Meta App Dashboard.
 *
 * Scopes (post-Jan 2025):
 *   - instagram_business_basic  → profile info, follower count, media count
 */

export function getInstagramAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || '';
  const authUrl = new URL('https://api.instagram.com/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'instagram_business_basic');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  return authUrl.toString();
}

export async function exchangeInstagramCode(code: string, redirectUri: string) {
  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Instagram OAuth keys missing in environment variables');
  }

  const formData = new URLSearchParams();
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);
  formData.append('grant_type', 'authorization_code');
  formData.append('redirect_uri', redirectUri);
  formData.append('code', code);

  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.error_message || data.error) {
    throw new Error(data.error_message || data.error?.message || 'Failed to exchange Instagram authorization code');
  }

  return {
    accessToken: data.access_token as string,
    userId: (data.user_id || null) as string | null,
  };
}

export async function getInstagramLongLivedToken(shortLivedToken: string): Promise<string> {
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  if (!clientSecret) return shortLivedToken;

  try {
    const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok && data.access_token) {
      return data.access_token as string;
    }
  } catch {
    // fall through — use short-lived token
  }
  return shortLivedToken;
}

export async function fetchInstagramUserProfile(accessToken: string) {
  const url = `https://graph.instagram.com/me?fields=id,username,account_type,followers_count,media_count,profile_picture_url&access_token=${accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to fetch Instagram profile');
  }

  return {
    id: data.id as string,
    username: data.username as string,
    accountType: (data.account_type || 'BUSINESS') as string,
    followerCount: (data.followers_count || 0) as number,
    mediaCount: (data.media_count || 0) as number,
    avatarUrl: (data.profile_picture_url || null) as string | null,
  };
}
