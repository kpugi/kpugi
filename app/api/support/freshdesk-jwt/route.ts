import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { generateFreshdeskJwt } from '@/lib/support/freshdesk-auth';

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      // Anonymous visitors should NOT receive a synthetic/random JWT
      // Freshdesk natively supports anonymous visitors without JWT
      return NextResponse.json({
        authenticated: false,
        token: null,
      });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    const fullName =
      user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      'Kpugi User';

    const token = generateFreshdeskJwt({
      email: email || undefined,
      uniqueExternalId: !email ? user.id : undefined,
      name: fullName,
    });

    return NextResponse.json({
      authenticated: true,
      token,
      email: email || null,
      name: fullName,
      userId: user.id,
    });
  } catch (error: any) {
    console.error('[Freshdesk JWT Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate Freshdesk authentication token' },
      { status: 500 }
    );
  }
}
