/**
 * POST /api/verify/social/check
 *
 * Runs the verification against the creator's public profile,
 * checks whether the verification code is present in their bio,
 * marks the account as verified if found, and fires Knock & Resend notifications.
 *
 * Body: { platform: string, handle: string }
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { scrapeProfile } from '@/lib/verification/scraper';
import { notifyCreatorSocialConnected } from '@/lib/notifications/creator';

export async function POST(request: Request) {
  try {
    const { platform, handle } = await request.json();

    if (!platform || !handle) {
      return NextResponse.json({ error: 'platform and handle are required' }, { status: 400 });
    }

    const userProfile = await getOrCreateUserProfile();
    if (!userProfile?.profile?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const platformKey = platform.toLowerCase() === 'twitter' ? 'x' : platform.toLowerCase();
    const cleanHandle = handle.replace(/^@/, '').toLowerCase();

    // Load the pending social account
    const { data: account } = await supabase
      .from('social_accounts')
      .select('id, verification_code, verification_code_expires_at, verification_status')
      .eq('creator_id', userProfile.profile.id)
      .eq('platform', platformKey)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.verification_status === 'verified') {
      return NextResponse.json({ verified: true, message: 'Already verified' });
    }

    if (!account.verification_code) {
      return NextResponse.json({ error: 'No verification code found. Start verification first.' }, { status: 400 });
    }

    // Check expiry
    if (account.verification_code_expires_at && new Date(account.verification_code_expires_at) < new Date()) {
      await supabase
        .from('social_accounts')
        .update({ verification_status: 'failed', verification_code: null })
        .eq('id', account.id);
      return NextResponse.json({ error: 'Verification code expired. Please start again.' }, { status: 410 });
    }

    // Read the public profile
    let scrapedProfile;
    try {
      scrapedProfile = await scrapeProfile(platformKey, cleanHandle);
    } catch (scrapeErr: any) {
      return NextResponse.json(
        {
          error: `Could not read your public profile: ${scrapeErr?.message || 'Profile lookup failed'}. Make sure your profile is public.`,
        },
        { status: 422 }
      );
    }

    const bioText = scrapedProfile.bio || '';
    const codeFound = bioText.toLowerCase().includes(account.verification_code.toLowerCase());

    if (!codeFound) {
      return NextResponse.json({
        verified: false,
        message: `Verification code not found in your bio. Make sure "${account.verification_code}" is saved in your bio and try again.`,
        scrapedBio: bioText || null,
      });
    }

    // ✅ Code found — mark as verified and save stats
    const updatePayload: Record<string, any> = {
      verification_status: 'verified',
      verification_method: 'code_in_bio',
      verified_at: new Date().toISOString(),
      verification_code: null, // clear code once verified
      verification_code_expires_at: null,
      last_synced_at: new Date().toISOString(),
    };

    if (scrapedProfile.displayName) updatePayload.display_name = scrapedProfile.displayName;
    if (scrapedProfile.bio) updatePayload.bio = scrapedProfile.bio;
    if (scrapedProfile.followerCount !== null) updatePayload.follower_count = scrapedProfile.followerCount;
    if (scrapedProfile.avatarUrl) updatePayload.avatar_url = scrapedProfile.avatarUrl;

    await supabase.from('social_accounts').update(updatePayload).eq('id', account.id);

    // 🔔 Fire non-blocking notifications: Knock in-app notification + Resend email
    notifyCreatorSocialConnected({
      clerkId: userProfile.profile.clerk_id,
      email: userProfile.profile.email,
      platform: platformKey.toUpperCase(),
      handle: cleanHandle,
      profileId: userProfile.profile.id,
    }).catch((err) => console.error('[notifyCreatorSocialConnected] Error:', err));

    return NextResponse.json({
      verified: true,
      message: 'Account verified successfully!',
      stats: {
        displayName: scrapedProfile.displayName,
        followerCount: scrapedProfile.followerCount,
        avatarUrl: scrapedProfile.avatarUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Verification check failed' }, { status: 500 });
  }
}
