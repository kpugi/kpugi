import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/auth/pkce';

export async function GET(request: Request) {
  const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;

  if (!clientKey) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_TIKTOK_CLIENT_KEY is not configured in .env.local' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const baseUrl = appUrl || `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/oauth/tiktok/callback`;

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const cookieStore = await cookies();
  cookieStore.set('tiktok_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });
  cookieStore.set('tiktok_code_verifier', codeVerifier, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });

  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  authUrl.searchParams.set('client_key', clientKey);
  authUrl.searchParams.set('scope', 'user.info.basic,user.info.profile,user.info.stats,video.list');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  return NextResponse.redirect(authUrl.toString());
}
