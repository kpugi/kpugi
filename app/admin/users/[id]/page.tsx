import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin/auth';
import { clerkClient } from '@clerk/nextjs/server';
import UserDetailAdminView from '@/components/admin/users/UserDetailAdminView';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { supabase } = await requireAdminSession();
  const { data: user } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', id)
    .maybeSingle();

  return {
    title: user?.full_name
      ? `${user.full_name} (${user.email}) — User Management | KpugiAdmin`
      : 'User Profile Inspection — KpugiAdmin',
  };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: targetUserId } = await params;
  const { supabase, profileId: currentAdminId } = await requireAdminSession();

  // 1. Query the target user profile
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .maybeSingle();

  if (profileErr || !profile) {
    notFound();
  }

  // 2. Fetch parallel sub-profiles, wallets, socials, activities, and audit trail
  const [
    creatorRes,
    advertiserRes,
    socialsRes,
    walletsRes,
    campaignsRes,
    submissionsRes,
    auditsRes,
  ] = await Promise.all([
    supabase
      .from('creator_profiles')
      .select('*')
      .eq('profile_id', targetUserId)
      .maybeSingle(),
    supabase
      .from('advertiser_profiles')
      .select('*')
      .eq('profile_id', targetUserId)
      .maybeSingle(),
    supabase
      .from('social_accounts')
      .select('*')
      .eq('creator_id', targetUserId)
      .order('connected_at', { ascending: false }),
    supabase
      .from('wallets')
      .select('*')
      .eq('profile_id', targetUserId),
    supabase
      .from('campaigns')
      .select('id, title, status, cpm_rate, total_budget, spent_budget, created_at')
      .eq('advertiser_id', targetUserId)
      .order('created_at', { ascending: false }),
    supabase
      .from('submissions')
      .select(`
        id,
        post_url,
        status,
        final_view_count,
        reserved_amount,
        payout_amount,
        submitted_at,
        verified_at,
        campaign:campaigns (
          id,
          title,
          cpm_rate
        )
      `)
      .eq('creator_id', targetUserId)
      .order('submitted_at', { ascending: false }),
    supabase
      .from('audit_log')
      .select('id, action, actor_role, details, payload, created_at')
      .or(`target_id.eq.${targetUserId},profile_id.eq.${targetUserId}`)
      .order('created_at', { ascending: false })
      .limit(60),
  ]);

  const wallets = walletsRes.data || [];
  const walletIds = wallets.map((w) => w.id);

  // 3. Fetch wallet transactions if any wallets exist
  let walletTransactions: any[] = [];
  if (walletIds.length > 0) {
    const { data: txData } = await supabase
      .from('wallet_transactions')
      .select('*')
      .in('wallet_id', walletIds)
      .order('created_at', { ascending: false })
      .limit(60);
    walletTransactions = txData || [];
  }

  // 4. Safe Clerk metadata lookup
  let clerkMetadata: {
    lastSignInAt?: string | null;
    isEmailVerified?: boolean;
    banned?: boolean;
  } | null = null;

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(profile.clerk_id);
    if (clerkUser) {
      clerkMetadata = {
        lastSignInAt: clerkUser.lastSignInAt
          ? new Date(clerkUser.lastSignInAt).toISOString()
          : null,
        isEmailVerified: clerkUser.emailAddresses?.some((e) => e.verification?.status === 'verified'),
        banned: clerkUser.banned,
      };
    }
  } catch (clerkErr) {
    // Graceful fallback if Clerk API is offline or user not found
    console.warn('[AdminUserDetailPage] Clerk metadata fetch bypassed:', clerkErr);
  }

  // Parse suspension state
  const checklist = (profile.onboarding_checklist_state as Record<string, unknown>) || {};
  const accountStatus = (profile.account_status || checklist.account_status || 'active') as 'active' | 'suspended';
  const suspendedReason = (profile.suspended_reason || checklist.suspended_reason || null) as string | null;
  const suspendedAt = (profile.suspended_at || checklist.suspended_at || null) as string | null;

  return (
    <UserDetailAdminView
      user={{
        id: profile.id,
        clerk_id: profile.clerk_id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
        phone: profile.phone,
        is_admin: !!profile.is_admin,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        account_status: accountStatus,
        suspended_reason: suspendedReason,
        suspended_at: suspendedAt,
      }}
      creatorProfile={creatorRes.data || null}
      advertiserProfile={advertiserRes.data || null}
      socialAccounts={socialsRes.data || []}
      wallets={wallets}
      walletTransactions={walletTransactions}
      campaignsCreated={campaignsRes.data || []}
      submissionsMade={(submissionsRes.data as any) || []}
      auditTrail={auditsRes.data || []}
      clerkMetadata={clerkMetadata}
      currentAdminId={currentAdminId}
    />
  );
}
