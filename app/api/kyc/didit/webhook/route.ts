import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
