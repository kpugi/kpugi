import { cache } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export const getAuthenticatedUser = cache(async () => {
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
});

export const getOrCreateUserProfile = cache(async () => {
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

    // 3. Check / Auto-provision role-specific profiles
    let advertiserProfile = null;
    let creatorProfile = null;

    if (profile.role === 'advertiser' || profile.role === 'both') {
      let { data } = await supabase
        .from('advertiser_profiles')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!data) {
        const { data: newAdv } = await supabase
          .from('advertiser_profiles')
          .upsert(
            {
              profile_id: profile.id,
              company_name: profile.full_name || 'Advertiser Brand',
              billing_email: profile.email,
            },
            { onConflict: 'profile_id' }
          )
          .select('*')
          .maybeSingle();
        data = newAdv;
      }
      advertiserProfile = data;
    }

    if (profile.role === 'creator' || profile.role === 'both' || !profile.role) {
      let { data } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!data) {
        const { data: newCp } = await supabase
          .from('creator_profiles')
          .upsert(
            {
              profile_id: profile.id,
              display_name: profile.full_name || 'Creator',
            },
            { onConflict: 'profile_id' }
          )
          .select('*')
          .maybeSingle();
        data = newCp;
      }
      creatorProfile = data;
    }

    // Ensure matching wallet exists only if missing (preserves existing balances)
    const targetWalletType = profile.role === 'advertiser' ? 'advertiser_budget' : 'creator_earnings';
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('wallet_type', targetWalletType)
      .maybeSingle();

    if (!existingWallet) {
      await supabase
        .from('wallets')
        .insert({
          profile_id: profile.id,
          wallet_type: targetWalletType,
          balance: 0,
        });
    }

    const hasRole = Boolean(profile.role && profile.role !== 'none');

    return {
      userId,
      profile,
      advertiserProfile,
      creatorProfile,
      role: profile.role || 'creator',
      onboardingComplete: hasRole,
    };
  } catch (err: any) {
    if (err?.digest?.startsWith('DYNAMIC_SERVER_USAGE') || err?.message?.includes('Dynamic server usage') || err?.digest === 'NEXT_DYNAMIC_NO_SSR_SUPPORT') {
      throw err;
    }
    console.error('[getOrCreateUserProfile] Unexpected error:', err?.message || err);
    return null;
  }
});


