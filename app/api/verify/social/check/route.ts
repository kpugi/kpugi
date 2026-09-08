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

import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const { platform, handle, accountId } = await request.json();

    if (!platform || (!handle && !accountId)) {
      return NextResponse.json({ error: 'platform and handle or accountId are required' }, { status: 400 });
    }

    const userProfile = await getOrCreateUserProfile();
    if (!userProfile?.profile?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const platformKey = platform.toLowerCase() === 'twitter' ? 'x' : platform.toLowerCase();
    const cleanHandle = (handle || '').replace(/^@/, '').toLowerCase();

    // Load the social account matching this specific handle/id
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('creator_id', userProfile.profile.id)
      .eq('platform', platformKey)
      .order('connected_at', { ascending: false });

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const cleanId = cleanHandle.match(/id=(\d+)/i)?.[1] || (cleanHandle.match(/^\d+$/) ? cleanHandle : null);

    const account =
      (accountId ? accounts.find((a) => a.id === accountId) : null) ||
      accounts.find(
        (a) =>
          a.handle.toLowerCase() === cleanHandle ||
          (a.display_name && a.display_name.toLowerCase() === cleanHandle) ||
          (cleanId && (a.platform_user_id === cleanId || a.handle.includes(cleanId))) ||
          (a.platform_user_id && a.platform_user_id.toLowerCase() === cleanHandle)
      ) ||
      accounts[0];

    if (account.verification_status === 'verified') {
      // Re-sync stats on demand for already verified accounts
      const lookupIdentifier = account.platform_user_id || account.handle || cleanHandle;
      let scrapedProfile;
      try {
        scrapedProfile = await scrapeProfile(platformKey, lookupIdentifier);
      } catch (err: any) {
        return NextResponse.json(
          { error: `Could not fetch live stats: ${err?.message || 'Profile lookup failed'}` },
          { status: 422 }
        );
      }

      const updateData: Record<string, any> = {
        last_synced_at: new Date().toISOString(),
      };
      if (scrapedProfile.followerCount !== null && scrapedProfile.followerCount !== undefined) {
        updateData.follower_count = scrapedProfile.followerCount;
      }
      if (scrapedProfile.avatarUrl) {
        updateData.avatar_url = scrapedProfile.avatarUrl;
      }
      if (scrapedProfile.displayName && !account.display_name) {
        updateData.display_name = scrapedProfile.displayName;
      }
      if (scrapedProfile.bio) {
        updateData.bio = scrapedProfile.bio;
      }

      await supabase
        .from('social_accounts')
        .update(updateData)
        .eq('id', account.id);

      return NextResponse.json({
        verified: true,
        message: 'Stats re-synced successfully',
        stats: {
          followerCount: scrapedProfile.followerCount ?? account.follower_count,
          avatarUrl: scrapedProfile.avatarUrl || account.avatar_url,
          displayName: account.display_name || scrapedProfile.displayName,
          bio: scrapedProfile.bio || account.bio,
        },
      });
    }

    // Auto-generate code if missing
    if (!account.verification_code) {
      const newCode = `kpugi-${randomBytes(5).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('social_accounts')
        .update({
          verification_code: newCode,
          verification_code_expires_at: expiresAt,
          verification_status: 'pending',
        })
        .eq('id', account.id);

      return NextResponse.json({
        error: `Verification code was missing. We generated code "${newCode}". Add it to your bio or publish a verification post.`,
        code: newCode,
        needsBioUpdate: true,
      }, { status: 400 });
    }

    // Check expiry
    if (account.verification_code_expires_at && new Date(account.verification_code_expires_at) < new Date()) {
      const refreshedCode = `kpugi-${randomBytes(5).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('social_accounts')
        .update({
          verification_code: refreshedCode,
          verification_code_expires_at: expiresAt,
          verification_status: 'pending',
        })
        .eq('id', account.id);

      return NextResponse.json({
        error: `Verification code expired. We generated a new code "${refreshedCode}". Please update your bio.`,
        code: refreshedCode,
        needsBioUpdate: true,
      }, { status: 410 });
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
