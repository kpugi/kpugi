import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyAdvertiserWalletFunded } from '@/lib/notifications/advertiser';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac('sha512', paystackSecret)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.warn('[Paystack Webhook] Invalid signature received');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event;
    const data = payload?.data;
    const reference = data?.reference;
    const amountInKobo = data?.amount || 0;
    const amountInNaira = amountInKobo / 100;
    const customerEmail = data?.customer?.email;

    const supabase = createAdminClient();

    // Log raw Paystack webhook event
    await supabase.from('paystack_events').insert({
      event_type: event || 'unknown',
      reference: reference || null,
      payload,
    });

    if (event === 'charge.success' && reference) {
      console.log('[Paystack Webhook] Charge successful reference:', reference);

      // Attempt to locate advertiser by email or metadata
      if (customerEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, clerk_id, email')
          .eq('email', customerEmail)
          .maybeSingle();

        if (profile) {
          // Idempotently credit wallet via atomic RPC
          const { data: depositResult, error: depositErr } = await supabase.rpc(
            'atomic_deposit_advertiser_wallet',
            {
              p_profile_id: profile.id,
              p_amount: amountInNaira,
              p_reference: reference,
              p_receipt_number: `KPG-PAY-${reference.slice(-5).toUpperCase()}`,
              p_advertiser_email: profile.email,
              p_notes: 'Paystack webhook charge.success deposit confirmed',
            }
          );

          if (depositErr) {
            console.error('[Paystack Webhook] Error depositing to wallet:', depositErr);
          } else if (!depositResult?.already_processed) {
            // Only fire notification if this wasn't already credited by the frontend verification action
            await notifyAdvertiserWalletFunded({
              clerkId: profile.clerk_id,
              email: profile.email,
              amount: amountInNaira,
              reference,
              newBalance: Number(depositResult?.new_balance || 0),
              profileId: profile.id,
            });
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[Paystack Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
