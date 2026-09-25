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
  ]);

  const wallets = walletsRes.data || [];
  const walletIds = wallets.map((w) => w.id);
  const allTargetIds = [targetUserId, ...walletIds];

  // 3. Fetch wallet transactions and forensic audit logs across admin, creator, brand, and central tables
  const [txRes, adminAuditsRes, creatorAuditsRes, brandAuditsRes, centralAuditsRes] = await Promise.all([
    walletIds.length > 0
      ? supabase
          .from('wallet_transactions')
          .select('*')
          .in('wallet_id', walletIds)
          .order('created_at', { ascending: false })
          .limit(60)
      : Promise.resolve({ data: [] }),
    supabase
      .from('admin_audit_log')
      .select('id, action, target_table, target_id, details, payload, created_at, admin_id')
      .in('target_id', allTargetIds)
      .order('created_at', { ascending: false })
      .limit(60),
    supabase
      .from('creator_audit_log')
      .select('id, action, target_table, target_id, details, payload, created_at')
      .eq('creator_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(60),
    supabase
      .from('brand_audit_log')
      .select('id, action, target_table, target_id, details, payload, created_at')
      .eq('brand_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(60),
    supabase
      .from('audit_log')
      .select('id, action, actor_role, target_table, target_id, payload, created_at')
      .or(`target_id.eq.${targetUserId},profile_id.eq.${targetUserId}`)
      .order('created_at', { ascending: false })
      .limit(60),
  ]);

  const walletTransactions = txRes.data || [];

  // Assemble unified, deduplicated audit trail
  const auditTrail: Array<{
    id: string;
    action: string;
    actor_role: string;
    details?: string | null;
    payload?: any;
    created_at: string;
  }> = [];
  const seenAuditKeys = new Set<string>();

  // A. Admin interventions on this user (suspension, KYC override, wallet adjustments, role changes)
  for (const r of adminAuditsRes.data || []) {
    const key = `${r.action}_${Math.floor(new Date(r.created_at).getTime() / 2000)}`;
    seenAuditKeys.add(key);
    auditTrail.push({
      id: r.id,
      action: r.action,
      actor_role: 'admin',
      details: r.details,
      payload: r.payload,
      created_at: r.created_at,
    });
  }

  // B. Creator activities for this user (connected channels, verified socials, submissions, payouts)
  for (const r of creatorAuditsRes.data || []) {
    const key = `${r.action}_${Math.floor(new Date(r.created_at).getTime() / 2000)}`;
    if (!seenAuditKeys.has(key)) {
      seenAuditKeys.add(key);
      auditTrail.push({
        id: r.id,
        action: r.action,
        actor_role: 'creator',
        details: r.details,
        payload: r.payload,
        created_at: r.created_at,
      });
    }
  }

  // C. Brand / Advertiser activities for this user
  for (const r of brandAuditsRes.data || []) {
    const key = `${r.action}_${Math.floor(new Date(r.created_at).getTime() / 2000)}`;
    if (!seenAuditKeys.has(key)) {
      seenAuditKeys.add(key);
      auditTrail.push({
        id: r.id,
        action: r.action,
        actor_role: 'advertiser',
        details: r.details,
        payload: r.payload,
        created_at: r.created_at,
      });
    }
  }

  // D. Centralized audit log (system validations, submissions pass/fail, etc.)
  for (const c of centralAuditsRes.data || []) {
    const key = `${c.action}_${Math.floor(new Date(c.created_at).getTime() / 2000)}`;
    if (!seenAuditKeys.has(key)) {
      seenAuditKeys.add(key);
      const payloadObj = (c.payload as Record<string, any>) || {};
      const fallbackDetails =
        payloadObj.details ||
        payloadObj.reason ||
        (payloadObj.post_url ? `Post submission for ${payloadObj.campaign_title || 'campaign'}` : null) ||
        `${c.action} on ${c.target_table || 'system'}`;

      auditTrail.push({
        id: c.id,
        action: c.action,
        actor_role: c.actor_role || 'system',
        details: fallbackDetails,
        payload: c.payload,
        created_at: c.created_at,
      });
    }
  }

  // Sort chronological descending
  auditTrail.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      auditTrail={auditTrail}
      clerkMetadata={clerkMetadata}
      currentAdminId={currentAdminId}
    />
  );
}
