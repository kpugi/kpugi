import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function getAuthenticatedUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    const user = await currentUser();
    if (!user) return null;
    return { userId, user };
  } catch (error) {
    console.error('[getAuthenticatedUser] Clerk API error:', error);
    return null;
  }
}

export async function getOrCreateUserProfile() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const supabase = createAdminClient();

    // 1. Try to fetch existing profile first (avoids Clerk API network request)
    let { data: profile, error: fetchProfileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    if (fetchProfileErr) {
      console.warn('[getOrCreateUserProfile] Warning fetching profile:', fetchProfileErr.message);
    }

    // 2. If profile doesn't exist, fetch Clerk user details and create it
    if (!profile) {
      const authData = await getAuthenticatedUser();
      const user = authData?.user;
      
      const primaryEmail = user?.emailAddresses?.[0]?.emailAddress || `clerk_${userId}@kpugi.com`;
      const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : 'Creator';
      const avatarUrl = user?.imageUrl || null;

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .upsert(
          {
            clerk_id: userId,
            email: primaryEmail,
            full_name: fullName || null,
            avatar_url: avatarUrl,
            role: 'creator', // default pending role selection
          },
          { onConflict: 'clerk_id' }
        )
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('[getOrCreateUserProfile] Error creating profile:', error);
      } else {
        profile = newProfile;
      }
    }

    if (!profile) return null;

    // 3. Check role-specific profiles
    let advertiserProfile = null;
    let creatorProfile = null;

    if (profile.role === 'advertiser' || profile.role === 'both') {
      const { data } = await supabase
        .from('advertiser_profiles')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();
      advertiserProfile = data;
    }

    if (profile.role === 'creator' || profile.role === 'both') {
      const { data } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();
      creatorProfile = data;
    }

    const hasSelectedRole = Boolean(advertiserProfile || creatorProfile);

    return {
      userId,
      profile,
      advertiserProfile,
      creatorProfile,
      role: profile.role,
      onboardingComplete: hasSelectedRole,
    };
  } catch (err: any) {
    if (err?.digest?.startsWith('DYNAMIC_SERVER_USAGE') || err?.message?.includes('Dynamic server usage') || err?.digest === 'NEXT_DYNAMIC_NO_SSR_SUPPORT') {
      throw err;
    }
    console.error('[getOrCreateUserProfile] Unexpected error:', err?.message || err);
    return null;
  }
}


