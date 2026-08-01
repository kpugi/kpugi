import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { createDiditKycSession } from '@/lib/didit/client';

export async function POST(req: Request) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.creatorProfile) {
      return NextResponse.json(
        { error: 'Unauthorized. Creator profile required.' },
        { status: 401 }
      );
    }

    const creatorId = userProfile.profile.id;
    const email = userProfile.profile.email;

    // Create session on Didit API
    const session = await createDiditKycSession({
      creatorId,
      email,
    });

    // Update creator profile in Supabase with session ID & pending status
    const supabase = createAdminClient();
    await supabase
      .from('creator_profiles')
      .update({
        kyc_status: 'pending',
        kyc_didit_session_id: session.sessionId,
      })
      .eq('profile_id', creatorId);

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      sessionUrl: session.url,
    });
  } catch (error: any) {
    console.error('[Didit Session API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start Didit KYC session.' },
      { status: 500 }
    );
  }
}
