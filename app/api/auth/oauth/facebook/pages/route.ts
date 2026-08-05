import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { saveSocialAccount } from '@/lib/supabase/creator';
import { fetchFacebookPages } from '@/lib/oauth/facebook';
import { notifyCreatorSocialConnected } from '@/lib/notifications/creator';

/**
 * POST /api/auth/oauth/facebook/pages
 * Body: { userAccessToken: string, pageIds: string[] }
 *
 * Saves the selected Facebook Pages to social_accounts.
 * Called from the popup's page-picker UI after the creator selects pages.
 */
export async function POST(request: Request) {
  try {
    const { userAccessToken, pageIds } = await request.json();

    if (!userAccessToken || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json({ error: 'userAccessToken and pageIds are required' }, { status: 400 });
    }

    const userProfile = await getOrCreateUserProfile();
    if (!userProfile?.profile?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch all pages and filter to only the ones the creator selected
    const allPages = await fetchFacebookPages(userAccessToken);
    const selectedPages = allPages.filter((p) => pageIds.includes(p.id));

    if (selectedPages.length === 0) {
      return NextResponse.json({ error: 'No matching pages found' }, { status: 404 });
    }

    const saved: string[] = [];

    for (const page of selectedPages) {
      const handle = page.name.trim().replace(/\s+/g, '_').toLowerCase();
      await saveSocialAccount({
        profileId: userProfile.profile.id,
        platform: 'facebook_page',
        handle,
        platformUserId: page.id,
        followerCount: page.followersCount || page.fanCount || 0,
        avatarUrl: page.picture,
        accessToken: page.accessToken,
        scopes: ['pages_show_list'],
      });

      // Notify (non-blocking)
      notifyCreatorSocialConnected({
        clerkId: userProfile.profile.clerk_id,
        email: userProfile.profile.email,
        platform: 'Facebook Page',
        handle: page.name,
        profileId: userProfile.profile.id,
      }).catch(() => {});

      saved.push(page.name);
    }

    return NextResponse.json({ success: true, saved });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save pages' }, { status: 500 });
  }
}
