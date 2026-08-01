import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { getDiditSessionDecision } from '@/lib/didit/client';

export async function GET() {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.creatorProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creatorId = userProfile.creatorProfile.id;
    const supabase = createAdminClient();

    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('kyc_status, kyc_didit_session_id, kyc_verified_at')
      .or(`id.eq.${creatorId},profile_id.eq.${creatorId}`)
      .maybeSingle();

    let currentStatus = (creator?.kyc_status as any) || 'unverified';

    // If status is pending and we have a session ID, check live decision API
    if (currentStatus === 'pending' && creator?.kyc_didit_session_id) {
      const decisionData = await getDiditSessionDecision(creator.kyc_didit_session_id);
      if (decisionData.status === 'approved') {
        currentStatus = 'verified';
        await supabase
          .from('creator_profiles')
          .update({
            kyc_status: 'verified',
            kyc_verified_at: new Date().toISOString(),
          })
          .or(`id.eq.${creatorId},profile_id.eq.${creatorId}`);
      } else if (decisionData.status === 'rejected') {
        currentStatus = 'rejected';
        await supabase
          .from('creator_profiles')
          .update({ kyc_status: 'rejected' })
          .or(`id.eq.${creatorId},profile_id.eq.${creatorId}`);
      }
    }

    return NextResponse.json({
      success: true,
      status: currentStatus,
      verifiedAt: creator?.kyc_verified_at || null,
    });
  } catch (error: any) {
    console.error('[KYC Status API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
