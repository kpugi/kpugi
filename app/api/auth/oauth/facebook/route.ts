import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateState } from '@/lib/auth/pkce';
import { getFacebookAuthUrl } from '@/lib/oauth/facebook';

export async function GET(request: Request) {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;

  if (!appId) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_FACEBOOK_APP_ID or NEXT_PUBLIC_INSTAGRAM_CLIENT_ID is not configured in .env.local' },
      { status: 500 }
    );
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/oauth/facebook/callback`;

  const state = generateState();

  const cookieStore = await cookies();
  cookieStore.set('facebook_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });

  const authUrl = getFacebookAuthUrl(redirectUri, state);
  return NextResponse.redirect(authUrl);
}
