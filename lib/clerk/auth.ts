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

    // 1. Try to fetch existing profile first
    let { data: profile, error: fetchProfileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    if (fetchProfileErr) {
      console.warn('[getOrCreateUserProfile] Warning fetching profile:', fetchProfileErr.message);
    }

    // Helper to resolve the user's real email from Clerk
    async function resolveRealClerkUser() {
      try {
        const authData = await getAuthenticatedUser();
        if (authData?.user) {
          const u = authData.user;
          const email =
            u.emailAddresses?.find((e: any) => e.id === u.primaryEmailAddressId)?.emailAddress ||
            u.emailAddresses?.[0]?.emailAddress;
          const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
          return { email, fullName, avatarUrl: u.imageUrl || null };
        }
        if (process.env.CLERK_SECRET_KEY) {
          const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
          });
          if (res.ok) {
            const u = await res.json();
            const email =
              u.email_addresses?.find((e: any) => e.id === u.primary_email_address_id)?.email_address ||
              u.email_addresses?.[0]?.email_address;
            const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ');
            return { email, fullName, avatarUrl: u.image_url || null };
          }
        }
      } catch (err) {
        console.warn('[getOrCreateUserProfile] Could not fetch Clerk user:', err);
      }
      return null;
    }

    // If profile exists but has a placeholder email, update it with the real Clerk email
    if (profile && (!profile.email || profile.email.includes('clerk_user_') || profile.email.endsWith('@kpugi.com'))) {
      const realUser = await resolveRealClerkUser();
      if (realUser?.email) {
        const updatePayload: Record<string, any> = { email: realUser.email };
        if (realUser.fullName && (!profile.full_name || profile.full_name === 'Creator')) {
          updatePayload.full_name = realUser.fullName;
          profile.full_name = realUser.fullName;
        }
        await supabase.from('profiles').update(updatePayload).eq('id', profile.id);
        profile.email = realUser.email;
      }
    }

    // 2. If profile doesn't exist, fetch Clerk user details and create it
    if (!profile) {
      const realUser = await resolveRealClerkUser();
      const primaryEmail = realUser?.email || `clerk_${userId}@kpugi.com`;
      const fullName = realUser?.fullName || 'Creator';
      const avatarUrl = realUser?.avatarUrl || null;

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


