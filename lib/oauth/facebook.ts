export function getFacebookAuthUrl(redirectUri: string, state: string): string {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || '';
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'public_profile');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  return authUrl.toString();
}

export async function exchangeFacebookCode(code: string, redirectUri: string) {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Facebook App credentials missing in environment variables');
  }

  const url = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to exchange Facebook authorization code');
  }

  return {
    accessToken: data.access_token as string,
    tokenType: data.token_type as string,
    expiresIn: data.expires_in as number,
  };
}

export async function fetchFacebookUserProfile(accessToken: string) {
  const url = `https://graph.facebook.com/v18.0/me?fields=id,name,picture.type(large)&access_token=${accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to fetch Facebook profile');
  }

  return {
    id: data.id as string,
    name: data.name as string,
    avatarUrl: (data.picture?.data?.url || null) as string | null,
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  fanCount: number;
  followersCount: number;
  picture: string | null;
  accessToken: string;
}

export async function fetchFacebookPages(userAccessToken: string): Promise<FacebookPage[]> {
  const url = `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,category,fan_count,followers_count,picture.type(large),access_token&access_token=${userAccessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    // pages_show_list may not be granted yet — return empty gracefully
    return [];
  }

  return (data.data || []).map((page: any) => ({
    id: page.id,
    name: page.name,
    category: page.category || 'Page',
    fanCount: page.fan_count || 0,
    followersCount: page.followers_count || page.fan_count || 0,
    picture: page.picture?.data?.url || null,
    accessToken: page.access_token,
  }));
}
