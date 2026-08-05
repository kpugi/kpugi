import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/auth/pkce';
import { getXAuthUrl } from '@/lib/oauth/x';

export async function GET(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_TWITTER_CLIENT_ID is not configured in .env.local' },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/oauth/x/callback`;

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const cookieStore = await cookies();
  cookieStore.set('x_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });
  cookieStore.set('x_code_verifier', codeVerifier, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });

  const authUrl = getXAuthUrl(redirectUri, state, codeChallenge);
  return NextResponse.redirect(authUrl);
}
