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

    const creatorId = userProfile.profile.id;
    const supabase = createAdminClient();

    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('kyc_status, kyc_didit_session_id, kyc_verified_at')
      .eq('profile_id', creatorId)
      .maybeSingle();

    let currentStatus = (creator?.kyc_status as any) || 'unverified';

    // Auto-heal any legacy mock session IDs from earlier sandbox fallback
    if (creator?.kyc_didit_session_id?.startsWith('didit_sess_')) {
      currentStatus = 'unverified';
      await supabase
        .from('creator_profiles')
        .update({
          kyc_status: 'unverified',
          kyc_didit_session_id: null,
        })
        .eq('profile_id', creatorId);
    } else if (creator?.kyc_didit_session_id?.startsWith('sync_')) {
      // KpugiSync native in-house submission: status is managed natively in DB
      // No external calls required
    } else if (currentStatus === 'pending' && creator?.kyc_didit_session_id) {
      try {
        const decisionData = await getDiditSessionDecision(creator.kyc_didit_session_id);
        if (decisionData.status === 'approved') {
          currentStatus = 'verified';
          await supabase
            .from('creator_profiles')
            .update({
              kyc_status: 'verified',
              kyc_verified_at: new Date().toISOString(),
            })
            .eq('profile_id', creatorId);
        } else if (decisionData.status === 'rejected') {
          currentStatus = 'rejected';
          await supabase
            .from('creator_profiles')
            .update({ kyc_status: 'rejected' })
            .eq('profile_id', creatorId);
        }
      } catch (e: any) {
        console.warn('[KYC Status Check Error]:', e.message);
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
