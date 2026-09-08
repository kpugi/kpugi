/**
 * POST /api/verify/social/check-post
 *
 * Verifies a creator's social account via a published post:
 * 1. Checks that the post is reachable and public.
 * 2. Enforces anti-fraud author ownership (the post author matches the creator's handle).
 * 3. Confirms that the unique verification code is present in the post caption/content.
 * 4. Marks the account as verified with method 'post' and fires notifications.
 *
 * Body: { platform: string, handle: string, postUrl: string }
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { extractPostForVerification } from '@/lib/verification/post-verifier';
import { notifyCreatorSocialConnected } from '@/lib/notifications/creator';

export async function POST(request: Request) {
  try {
    const { platform, handle, postUrl } = await request.json();

    if (!platform || !handle || !postUrl) {
      return NextResponse.json(
        { error: 'Platform, handle, and post URL are all required.' },
        { status: 400 }
      );
    }

    const userProfile = await getOrCreateUserProfile();
    if (!userProfile?.profile?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const platformKey = platform.toLowerCase() === 'twitter' ? 'x' : platform.toLowerCase();
    const cleanHandle = handle.replace(/^@/, '').toLowerCase().trim();

    // 1. Load pending social account
    const { data: account } = await supabase
      .from('social_accounts')
      .select('id, verification_code, verification_code_expires_at, verification_status')
      .eq('creator_id', userProfile.profile.id)
      .eq('platform', platformKey)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: 'Account not found. Please start verification first.' }, { status: 404 });
    }

    if (account.verification_status === 'verified') {
      return NextResponse.json({ verified: true, message: 'This account is already verified.' });
    }

    if (!account.verification_code) {
      return NextResponse.json(
        { error: 'No active verification code found. Please generate a code first.' },
        { status: 400 }
      );
    }

    // 2. Check expiration (24h)
    if (account.verification_code_expires_at && new Date(account.verification_code_expires_at) < new Date()) {
      await supabase
        .from('social_accounts')
        .update({ verification_status: 'failed', verification_code: null })
        .eq('id', account.id);
      return NextResponse.json(
        { error: 'Verification code expired. Please start again to get a fresh code.' },
        { status: 410 }
      );
    }

    // 3. Inspect the live post
    const postDetails = await extractPostForVerification(postUrl.trim());

    if (!postDetails.reachable) {
      return NextResponse.json(
        {
          verified: false,
          error: postDetails.errorMessage || 'Could not reach your post. Make sure your post and account are set to public.',
        },
        { status: 422 }
      );
    }

    // 4. Platform check
    if (postDetails.platform !== platformKey) {
      return NextResponse.json(
        {
          verified: false,
          error: `Platform mismatch: You submitted a ${postDetails.platform.toUpperCase()} link for your ${platformKey.toUpperCase()} account verification.`,
        },
        { status: 400 }
      );
    }

    // 5. Anti-Fraud Author Ownership Match
    if (postDetails.authorHandle) {
      const normalize = (val: string) => val.toLowerCase().replace(/[\s\-_\.@]+/g, '').trim();
      const normScraped = normalize(postDetails.authorHandle);
      const normExpected = normalize(cleanHandle);

      if (normScraped !== normExpected) {
        return NextResponse.json(
          {
            verified: false,
            error: `Author ownership mismatch: This post was published by @${postDetails.authorHandle}, but your account handle is @${cleanHandle}. You may only verify your own posts.`,
          },
          { status: 403 }
        );
      }
    }

    // 6. Verification Code Match in Post Text/Caption
    const combinedText = `${postDetails.postText || ''} ${postDetails.title || ''}`.toLowerCase();
    const codeExpected = account.verification_code.toLowerCase().trim();

    if (!combinedText.includes(codeExpected)) {
      return NextResponse.json({
        verified: false,
        error: `Verification code "${account.verification_code}" was not found in your post caption. Make sure your post text includes "${account.verification_code}" and try again.`,
        postSnippet: postDetails.postText ? postDetails.postText.slice(0, 150) + '...' : null,
      });
    }

    // ✅ Post verified successfully — update social account
    const updatePayload: Record<string, any> = {
      verification_status: 'verified',
      verification_method: 'post',
      verified_at: new Date().toISOString(),
      verification_code: null,
      verification_code_expires_at: null,
      last_synced_at: new Date().toISOString(),
    };

    if (postDetails.authorHandle) updatePayload.display_name = postDetails.authorHandle;
    if (postDetails.avatarUrl) updatePayload.avatar_url = postDetails.avatarUrl;
    if (postDetails.followerCount !== undefined && postDetails.followerCount !== null) {
      updatePayload.follower_count = postDetails.followerCount;
    }

    await supabase.from('social_accounts').update(updatePayload).eq('id', account.id);

    // 🔔 Fire non-blocking notifications
    notifyCreatorSocialConnected({
      clerkId: userProfile.profile.clerk_id,
      email: userProfile.profile.email,
      platform: platformKey.toUpperCase(),
      handle: cleanHandle,
      profileId: userProfile.profile.id,
    }).catch((err) => console.error('[notifyCreatorSocialConnected] Error:', err));

    return NextResponse.json({
      verified: true,
      message: 'Account verified successfully via verification post!',
      stats: {
        displayName: postDetails.authorHandle || cleanHandle,
        avatarUrl: postDetails.avatarUrl || null,
        followerCount: postDetails.followerCount ?? null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Verification failed' }, { status: 500 });
  }
}
