import { NextResponse } from 'next/server';

export function getYouTubeAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || '';
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.readonly');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);
  return authUrl.toString();
}

export async function exchangeYouTubeCode(code: string, redirectUri: string) {
  const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('YouTube OAuth credentials missing in environment variables');
  }

  const formData = new URLSearchParams();
  formData.append('code', code);
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);
  formData.append('redirect_uri', redirectUri);
  formData.append('grant_type', 'authorization_code');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Failed to exchange YouTube authorization code');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function fetchYouTubeChannelProfile(accessToken: string) {
  const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true';
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to fetch YouTube channel profile');
  }

  const item = data.items?.[0];
  if (!item) {
    throw new Error('No YouTube channel found for this Google account');
  }

  const snippet = item.snippet || {};
  const stats = item.statistics || {};

  return {
    id: item.id,
    title: snippet.title || 'YouTube Creator',
    customUrl: snippet.customUrl ? snippet.customUrl.replace(/^@/, '') : snippet.title,
    avatarUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || null,
    subscriberCount: Number(stats.subscriberCount) || 0,
    videoCount: Number(stats.videoCount) || 0,
    viewCount: Number(stats.viewCount) || 0,
  };
}
