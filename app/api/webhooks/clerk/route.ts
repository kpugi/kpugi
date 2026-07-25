import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
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

