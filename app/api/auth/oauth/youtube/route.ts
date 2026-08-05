import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateState } from '@/lib/auth/pkce';
import { getYouTubeAuthUrl } from '@/lib/oauth/youtube';

export async function GET(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_YOUTUBE_CLIENT_ID is not configured in .env.local' },
      { status: 500 }
    );
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  // Prefer current request host over NEXT_PUBLIC_APP_URL so localhost testing uses localhost URI
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/oauth/youtube/callback`;

  const state = generateState();

  const cookieStore = await cookies();
  cookieStore.set('youtube_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });

  const authUrl = getYouTubeAuthUrl(redirectUri, state);
  return NextResponse.redirect(authUrl);
}
