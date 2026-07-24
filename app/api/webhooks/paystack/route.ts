import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const event = payload?.event;
    const reference = payload?.data?.reference;

    const supabase = createAdminClient();

    // Log raw Paystack webhook event
    await supabase.from('paystack_events').insert({
      event_type: event || 'unknown',
      reference: reference || null,
      payload,
    });

    if (event === 'charge.success') {
      // Process campaign funding or wallet credit logic
      console.log('[Paystack Webhook] Charge successful reference:', reference);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[Paystack Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
