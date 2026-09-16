import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Validates that an incoming Cron HTTP request contains a valid, timing-safe Bearer token.
 * 
 * Security rules enforced:
 * 1. Fails closed if CRON_SECRET is missing or empty in environment.
 * 2. Mandates 'Authorization: Bearer <token>' header.
 * 3. Strictly rejects query string authentication (?key=...) to prevent token leakage in
 *    access logs, browser history, referrers, and intermediate proxies.
 * 4. Uses crypto.timingSafeEqual to prevent side-channel timing attacks.
 */
export function verifyCronRequest(request: Request): {
  authorized: boolean;
  response?: NextResponse;
} {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || cronSecret.trim() === '') {
    console.error('[Cron Guard] CRON_SECRET is not configured on this server');
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Server misconfiguration: CRON_SECRET not defined' },
        { status: 500 }
      ),
    };
  }

  // Reject requests attempting to pass secret in query parameters
  const url = new URL(request.url);
  if (url.searchParams.has('key') || url.searchParams.has('secret') || url.searchParams.has('token')) {
    console.warn('[Cron Guard] Rejected attempt to pass cron secret in query string');
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Query parameter authentication is deprecated for security. Use Bearer header.' },
        { status: 401 }
      ),
    };
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Missing or invalid Authorization Bearer header' },
        { status: 401 }
      ),
    };
  }

  const providedToken = authHeader.slice(7).trim();
  const tokenBuf = Buffer.from(providedToken, 'utf8');
  const secretBuf = Buffer.from(cronSecret, 'utf8');

  // Constant-time comparison
  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    console.warn('[Cron Guard] Invalid cron bearer token attempt');
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Invalid credentials' },
        { status: 401 }
      ),
    };
  }

  return { authorized: true };
}
