import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

function verifyClerkWebhook(
  rawBody: string,
  headers: Headers,
  secret: string
): boolean {
  const svixId = headers.get('svix-id');
  const svixTimestamp = headers.get('svix-timestamp');
  const svixSignature = headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature || !secret) {
    return false;
  }

  // Prevent replay attacks by checking timestamp drift (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const timestamp = parseInt(svixTimestamp, 10);
  if (isNaN(timestamp) || Math.abs(now - timestamp) > 300) {
    return false;
  }

  const key = secret.startsWith('whsec_')
    ? Buffer.from(secret.slice(6), 'base64')
    : Buffer.from(secret, 'utf8');

  const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
  const computedSignature = crypto
    .createHmac('sha256', key)
    .update(toSign)
    .digest('base64');

  const signatures = svixSignature.split(' ').map((sig) => sig.replace(/^v1,/, ''));

  return signatures.some((sig) => {
    try {
      const sigBuffer = Buffer.from(sig, 'base64');
      const compBuffer = Buffer.from(computedSignature, 'base64');
      return sigBuffer.length === compBuffer.length && crypto.timingSafeEqual(sigBuffer, compBuffer);
    } catch {
      return false;
    }
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Clerk Webhook] CLERK_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValid = verifyClerkWebhook(rawBody, req.headers, webhookSecret);
    if (!isValid) {
      console.warn('[Clerk Webhook] Invalid or missing signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload?.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = payload.data;
      const primaryEmail = email_addresses?.[0]?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(' ');

      if (!id || !primaryEmail) {
        return NextResponse.json({ error: 'Missing required user payload data' }, { status: 400 });
      }

      const supabase = createAdminClient();
      const { error } = await supabase.from('profiles').upsert(
        {
          clerk_id: id,
          email: primaryEmail,
          full_name: fullName || null,
          avatar_url: image_url || null,
          role: 'creator', // default fallback, chosen in /onboarding/role
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clerk_id' }
      );

      if (error) {
        console.error('[Clerk Webhook] Profile sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Clerk Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

