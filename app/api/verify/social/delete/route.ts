/**
 * DELETE /api/verify/social/delete
 *
 * Deletes a social account connection for the authenticated creator.
 * Body: { platform: string, handle: string } or { accountId: string }
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';

export async function DELETE(request: Request) {
  try {
    const { platform, handle, accountId } = await request.json();

    const userProfile = await getOrCreateUserProfile();
    if (!userProfile?.profile?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createAdminClient();

    let query = supabase
      .from('social_accounts')
      .delete()
      .eq('creator_id', userProfile.profile.id);

    if (accountId) {
      query = query.eq('id', accountId);
    } else if (platform && handle) {
      const platformKey = platform.toLowerCase() === 'twitter' ? 'x' : platform.toLowerCase();
      const cleanHandle = handle.trim().replace(/^@/, '').toLowerCase();
      query = query.eq('platform', platformKey).ilike('handle', cleanHandle);
    } else {
      return NextResponse.json({ error: 'accountId or platform & handle required' }, { status: 400 });
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Account connection removed' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete account' }, { status: 500 });
  }
}
