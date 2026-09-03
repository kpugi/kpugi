import crypto from 'crypto';

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export interface FreshdeskJwtOptions {
  email?: string | null;
  name?: string | null;
  uniqueExternalId?: string | null;
  phone?: string | null;
}

/**
 * Generates an RFC 7519 compliant HS256 JWT for Freshdesk Web Chat user authentication.
 * 
 * Freshdesk Web Chat Requirements:
 * - Must provide either `email` OR `unique_external_id`.
 * - Do NOT include both in the same token.
 * - Optional user details: `name`, `phone`, `language`.
 */
export function generateFreshdeskJwt({
  email,
  name,
  uniqueExternalId,
  phone,
}: FreshdeskJwtOptions): string {
  const secret = process.env.FRESHDESK_JWT_SECRET;
  if (!secret) {
    throw new Error('FRESHDESK_JWT_SECRET is not configured on server');
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };

  const payload: Record<string, any> = {
    iat: nowInSeconds,
    exp: nowInSeconds + 7 * 24 * 60 * 60, // 7 days expiration
  };

  const cleanEmail = email?.trim().toLowerCase();
  if (cleanEmail) {
    payload.email = cleanEmail;
  } else if (uniqueExternalId?.trim()) {
    payload.unique_external_id = uniqueExternalId.trim();
  }

  if (name?.trim()) {
    payload.name = name.trim();
  }

  if (phone?.trim()) {
    payload.phone = phone.trim();
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${message}.${signature}`;
}
