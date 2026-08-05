import { NextResponse } from 'next/server';

export function getXAuthUrl(redirectUri: string, state: string, codeChallenge: string): string {
  const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '';
  const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  return authUrl.toString();
}

export async function exchangeXCode(code: string, redirectUri: string, codeVerifier: string) {
  const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;

  if (!clientId) {
    throw new Error('Twitter/X OAuth Client ID missing in environment variables');
  }

  const formData = new URLSearchParams();
  formData.append('code', code);
  formData.append('grant_type', 'authorization_code');
  formData.append('client_id', clientId);
  formData.append('redirect_uri', redirectUri);
  formData.append('code_verifier', codeVerifier);

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (clientSecret) {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${basicAuth}`;
  }

  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Failed to exchange Twitter/X authorization code');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

export async function fetchXUserProfile(accessToken: string) {
  const url = 'https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,username,name';
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok || data.errors) {
    throw new Error(data.errors?.[0]?.message || 'Failed to fetch Twitter/X profile');
  }

  const user = data.data;
  const metrics = user?.public_metrics || {};

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarUrl: user.profile_image_url ? user.profile_image_url.replace('_normal', '') : null,
    followerCount: metrics.followers_count || 0,
    followingCount: metrics.following_count || 0,
    likesCount: metrics.like_count || 0,
    videoCount: metrics.tweet_count || 0,
  };
}
