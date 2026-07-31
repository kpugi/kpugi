import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { notifyCreatorWithdrawalCompleted } from '@/lib/notifications/creator';

export async function POST(req: Request) {
  try {
    const userProfile = await getOrCreateUserProfile();
    if (!userProfile || !userProfile.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { amount = 0, bankName = 'Bank', accountMasked = '****1234', reference = `WDR-${Date.now()}` } = body;

    // Trigger Withdrawal Completed Notification
    notifyCreatorWithdrawalCompleted({
      clerkId: userProfile.profile.clerk_id,
      email: userProfile.profile.email,
      amount,
      bankName,
      accountMasked,
      reference,
      profileId: userProfile.profile.id,
    }).catch(err => console.error('[Wallet Withdraw API] Notification error:', err));

    return NextResponse.json({ success: true, reference });
  } catch (err) {
    console.error('[Wallet Withdraw API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
