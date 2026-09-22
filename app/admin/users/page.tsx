import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import UsersTableManager, { UserRowData } from '@/components/admin/users/UsersTableManager';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const { supabase, profileId: currentAdminId } = await requireAdminSession();

  // 1. Fetch profiles joined with creator, advertiser, and wallet records
  const [profilesRes, socialsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select(`
        id,
        clerk_id,
        email,
        full_name,
        avatar_url,
        role,
        phone,
        is_admin,
        created_at,
        onboarding_checklist_state,
        creator_profiles:creator_profiles (
          display_name,
          creator_handle,
          kyc_status,
          total_earned
        ),
        advertiser_profiles:advertiser_profiles (
          company_name,
          company_website
        ),
        wallets (
          wallet_type,
          balance
        )
      `)
      .order('created_at', { ascending: false })
      .limit(300),
    supabase
      .from('social_accounts')
      .select('creator_id, platform, handle, follower_count')
      .is('revoked_at', null),
  ]);

  const rawProfiles = profilesRes.data || [];
  const rawSocials = socialsRes.data || [];

  // Group socials by creator_id
  const socialsByCreator = new Map<string, Array<{ platform: string; handle: string; follower_count?: number }>>();
  rawSocials.forEach((soc) => {
    if (!soc.creator_id) return;
    const existing = socialsByCreator.get(soc.creator_id) || [];
    existing.push({
      platform: soc.platform,
      handle: soc.handle,
      follower_count: soc.follower_count,
    });
    socialsByCreator.set(soc.creator_id, existing);
  });

  // Assemble sanitized UserRowData array
  const users: UserRowData[] = rawProfiles.map((p: any) => {
    const checklist = (p.onboarding_checklist_state as Record<string, unknown>) || {};
    const accountStatus = (p.account_status || checklist.account_status || 'active') as 'active' | 'suspended';
    const suspendedReason = (p.suspended_reason || checklist.suspended_reason || null) as string | null;

    const creatorProfile = Array.isArray(p.creator_profiles) ? p.creator_profiles[0] : p.creator_profiles;
    const advertiserProfile = Array.isArray(p.advertiser_profiles) ? p.advertiser_profiles[0] : p.advertiser_profiles;

    return {
      id: p.id,
      clerk_id: p.clerk_id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      role: p.role || 'creator',
      phone: p.phone,
      is_admin: !!p.is_admin,
      created_at: p.created_at,
      account_status: accountStatus,
      suspended_reason: suspendedReason,
      creator_profile: creatorProfile || null,
      advertiser_profile: advertiserProfile || null,
      wallets: Array.isArray(p.wallets) ? p.wallets : [],
      social_accounts: socialsByCreator.get(p.id) || [],
    };
  });

  return (
    <div className="space-y-6">
      <UsersTableManager
        initialUsers={users}
        currentAdminId={currentAdminId}
      />
    </div>
  );
}
