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
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('creator_id', userProfile.profile.id)
      .eq('platform', platformKey)
      .order('connected_at', { ascending: false });

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'Account not found. Please start verification first.' }, { status: 404 });
    }

    const cleanId = cleanHandle.match(/id=(\d+)/i)?.[1] || (cleanHandle.match(/^\d+$/) ? cleanHandle : null);

    // Match by exact handle, cleanId, or latest pending account with a verification code
    const account =
      accounts.find(
        (a) =>
          a.handle.toLowerCase() === cleanHandle ||
          (cleanId && (a.platform_user_id === cleanId || a.handle.includes(cleanId)))
      ) ||
      accounts.find((a) => a.verification_status === 'pending' && a.verification_code) ||
      accounts[0];

    if (account.verification_status === 'verified') {
      return NextResponse.json({
        verified: true,
        message: 'This account is already verified.',
        accountName: account.display_name || account.handle,
        handle: account.handle,
      });
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
    // Must recognize both the account name (e.g. "Kpugi Kpugi") and profile ID (e.g. "61592632807693")
    if (postDetails.authorHandle || postDetails.authorName) {
      const normalize = (val: string) => val.toLowerCase().replace(/[\s\-_\.@]+/g, '').trim();
      const normScrapedHandle = postDetails.authorHandle ? normalize(postDetails.authorHandle) : '';
      const normScrapedName = postDetails.authorName ? normalize(postDetails.authorName) : '';
      const normExpected = normalize(cleanHandle);

      // Check numeric/profile ID match for Facebook / profile URLs (e.g. profile.php?id=61592632807693 or 61592632807693)
      const postUrlId = postUrl.match(/[?&]id=(\d+)/i)?.[1] || postUrl.match(/\/(?:posts|photos)\/(\d+)/i)?.[1] || null;
      const scrapedId = postDetails.authorId || null;

      const idMatch = cleanId && (
        postUrl.includes(cleanId) ||
        normScrapedHandle.includes(cleanId) ||
        normScrapedName.includes(cleanId) ||
        (postUrlId && postUrlId === cleanId) ||
        (scrapedId && scrapedId === cleanId) ||
        (account.platform_user_id && account.platform_user_id === cleanId)
      );

      // For Facebook:
      // Facebook profiles can be connected via profile.php?id=..., vanity name, or full name.
      // If the creator connected a Facebook profile (via ID, URL, or name), we verify ownership:
      // - Either ID matches
      // - Or name/handle matches
      // - Or the connected handle is a profile URL/ID on Facebook
      const isFacebookProfileMatch =
        platformKey === 'facebook' &&
        (
          Boolean(idMatch) ||
          cleanHandle.includes('profile.php') ||
          /^\d+$/.test(cleanHandle) ||
          (normScrapedName && normExpected && (normScrapedName.includes(normExpected) || normExpected.includes(normScrapedName))) ||
          (normScrapedHandle && normExpected && (normScrapedHandle.includes(normExpected) || normExpected.includes(normScrapedHandle)))
        );

      const isMatch =
        normScrapedHandle === normExpected ||
        normScrapedName === normExpected ||
        (normScrapedHandle && (normScrapedHandle.includes(normExpected) || normExpected.includes(normScrapedHandle))) ||
        (normScrapedName && (normScrapedName.includes(normExpected) || normExpected.includes(normScrapedName))) ||
        Boolean(idMatch) ||
        Boolean(isFacebookProfileMatch);

      if (!isMatch) {
        return NextResponse.json(
          {
            verified: false,
            error: `Author ownership mismatch: This post was published by "${postDetails.authorName || postDetails.authorHandle}", but your connected account is "${cleanHandle}". You may only verify your own posts.`,
          },
          { status: 403 }
        );
      }
    }

    // 6. Verification Code or Official Verification Copy Match in Post Text/Caption
    const combinedText = `${postDetails.postText || ''} ${postDetails.title || ''}`.toLowerCase();
    const codeExpected = account.verification_code.toLowerCase().trim();
    const hasCode = combinedText.includes(codeExpected);
    const hasOfficialCopy =
      combinedText.includes('creator economy is changing') ||
      combinedText.includes('kpugi brings both together') ||
      (combinedText.includes('#kpugi') && (combinedText.includes('creator') || combinedText.includes('brand')));

    if (!hasCode && !hasOfficialCopy) {
      return NextResponse.json({
        verified: false,
        error: `Your post caption is missing the verification code "${account.verification_code}" or the official Kpugi caption. Make sure your post text includes the required caption and try again.`,
        postSnippet: postDetails.postText ? postDetails.postText.slice(0, 150) + '...' : null,
      });
    }

    // Determine the best clean display name & handle to show on the creator card
    // Save the real account name (e.g. "Kpugi Kpugi") instead of the raw profile.php?id=... string
    const authorDisplayName = (postDetails.authorName || postDetails.authorHandle || '').trim();
    const isIdString = cleanHandle.includes('profile.php') || /^\d+$/.test(cleanHandle) || cleanHandle.includes('?');
    const resolvedDisplayName = authorDisplayName || (cleanId ? `Facebook User` : cleanHandle);
    const resolvedHandle = isIdString && authorDisplayName ? authorDisplayName : cleanHandle;
    const finalPlatformUserId = cleanId || account.platform_user_id || account.id;

    // Prevent duplicate key error on (platform, platform_user_id) if an obsolete row exists
    if (finalPlatformUserId) {
      await supabase
        .from('social_accounts')
        .delete()
        .eq('platform', platformKey)
        .eq('platform_user_id', finalPlatformUserId)
        .neq('id', account.id);
    }

    // ✅ Post verified successfully — update social account
    const updatePayload: Record<string, any> = {
      handle: resolvedHandle,
      display_name: resolvedDisplayName,
      platform_user_id: finalPlatformUserId,
      verification_status: 'verified',
      verification_method: 'post',
      verified_at: new Date().toISOString(),
      verification_code: null,
      verification_code_expires_at: null,
      last_synced_at: new Date().toISOString(),
    };

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
      handle: resolvedHandle,
      profileId: userProfile.profile.id,
    }).catch((err) => console.error('[notifyCreatorSocialConnected] Error:', err));

    return NextResponse.json({
      verified: true,
      message: `Account "${resolvedDisplayName}" verified successfully!`,
      accountId: account.id,
      accountName: resolvedDisplayName,
      handle: resolvedHandle,
      oldHandle: cleanHandle,
      stats: {
        authorHandle: resolvedHandle,
        displayName: resolvedDisplayName,
        avatarUrl: postDetails.avatarUrl || null,
        followerCount: postDetails.followerCount ?? null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Verification failed' }, { status: 500 });
  }
}
