import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyAdvertiserWalletFunded } from '@/lib/notifications/advertiser';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
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
          // Fetch wallet balance
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('profile_id', profile.id)
            .maybeSingle();

          const newBalance = (Number(wallet?.balance) || 0) + amountInNaira;

          await notifyAdvertiserWalletFunded({
            clerkId: profile.clerk_id,
            email: profile.email,
            amount: amountInNaira,
            reference,
            newBalance,
            profileId: profile.id,
          });
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[Paystack Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
