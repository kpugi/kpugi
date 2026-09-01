import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

function verifyDiditWebhook(rawBody: string, req: Request, secret: string): boolean {
  const signature = req.headers.get('x-didit-signature') || req.headers.get('x-signature');
  const authHeader = req.headers.get('authorization');

  if (authHeader && authHeader === `Bearer ${secret}`) {
    return true;
  }

  if (signature) {
    const cleanSig = signature.replace(/^sha256=/, '');
    const computedHex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const computedBase64 = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

    try {
      const sigBuf = Buffer.from(cleanSig, 'utf8');
      const hexBuf = Buffer.from(computedHex, 'utf8');
      const b64Buf = Buffer.from(computedBase64, 'utf8');

      if (sigBuf.length === hexBuf.length && crypto.timingSafeEqual(sigBuf, hexBuf)) {
        return true;
      }
      if (sigBuf.length === b64Buf.length && crypto.timingSafeEqual(sigBuf, b64Buf)) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET || process.env.DIDIT_CLIENT_SECRET;

    if (!webhookSecret) {
      console.error('[Didit Webhook] DIDIT_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValid = verifyDiditWebhook(rawBody, req, webhookSecret);
    if (!isValid) {
      console.warn('[Didit Webhook] Invalid or missing signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    console.log('[Didit Webhook Received]:', JSON.stringify(body, null, 2));

    const sessionId = body.session_id || body.sessionId || body.data?.session_id;
    const vendorData = body.vendor_data || body.vendorData || body.data?.vendor_data;
    const statusRaw = (body.status || body.decision || body.event || '').toLowerCase();

    if (!sessionId && !vendorData) {
      return NextResponse.json({ error: 'Missing session_id or vendor_data' }, { status: 400 });
    }

    let kycStatus: 'verified' | 'rejected' | 'pending' = 'pending';
    if (statusRaw.includes('approve') || statusRaw.includes('verified') || statusRaw.includes('pass')) {
      kycStatus = 'verified';
    } else if (statusRaw.includes('reject') || statusRaw.includes('fail')) {
      kycStatus = 'rejected';
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    if (vendorData) {
      await supabase
        .from('creator_profiles')
        .update({
          kyc_status: kycStatus,
          ...(kycStatus === 'verified' ? { kyc_verified_at: now } : {}),
        })
        .or(`id.eq.${vendorData},profile_id.eq.${vendorData}`);
    } else if (sessionId) {
      await supabase
        .from('creator_profiles')
        .update({
          kyc_status: kycStatus,
          ...(kycStatus === 'verified' ? { kyc_verified_at: now } : {}),
        })
        .eq('kyc_didit_session_id', sessionId);
    }

    return NextResponse.json({ success: true, status: kycStatus });
  } catch (error: any) {
    console.error('[Didit Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
