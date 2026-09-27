'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { requireAdminSession } from '@/lib/admin/auth';
import {
  submitPerkProof,
  claimInstantPerk,
  adminDeployPerk,
  adminUpdatePerk,
  adminDeletePerk,
  adminApprovePerkClaim,
  adminRejectPerkClaim,
  type PlatformPerk,
} from '@/lib/supabase/perks';

// ── Creator Actions ──────────────────────────────────────────────────────────

/**
 * Creator submits proof (e.g. video URL) for a challenge/bounty perk.
 */
export async function submitPerkProofAction(input: {
  perkId: string;
  proofUrl: string;
  proofNotes?: string;
}) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.profile) {
    return { success: false, error: 'Unauthorized: please sign in.' };
  }

  const creatorId = userProfile.profile.id;

  const result = await submitPerkProof({
    perkId: input.perkId,
    creatorId,
    proofUrl: input.proofUrl,
    proofNotes: input.proofNotes,
  });

  if (result.success) {
    revalidatePath('/c/freebies');
    revalidatePath(`/c/freebies/${input.perkId}`);
    revalidatePath('/c/dashboard');
    revalidatePath('/b/dashboard');
    revalidatePath('/admin/freebies');
  }

  return result;
}

/**
 * Creator claims an instant perk (coupon, tool deal, download).
 */
export async function claimInstantPerkAction(perkId: string) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.profile) {
    return { success: false, error: 'Unauthorized: please sign in.' };
  }

  const creatorId = userProfile.profile.id;

  const result = await claimInstantPerk({
    perkId,
    creatorId,
  });

  if (result.success) {
    revalidatePath('/c/freebies');
    revalidatePath(`/c/freebies/${perkId}`);
    revalidatePath('/admin/freebies');
  }

  return result;
}

// ── Admin Actions ────────────────────────────────────────────────────────────

/**
 * Admin deploys a new perk to the catalog.
 */
export async function adminDeployPerkAction(
  perk: Omit<PlatformPerk, 'id' | 'claimed_count' | 'created_at'>
) {
  const { profile } = await requireAdminSession();

  const result = await adminDeployPerk(profile.id, perk);

  if (result.success) {
    revalidatePath('/admin/freebies');
    revalidatePath('/c/freebies');
  }

  return result;
}

/**
 * Admin approves a perk claim, atomically triggering wallet credit if applicable.
 */
export async function adminApprovePerkClaimAction(
  claimId: string,
  adminNotes?: string
) {
  const { profile } = await requireAdminSession();

  const result = await adminApprovePerkClaim(claimId, profile.id, adminNotes);

  if (result.success) {
    revalidatePath('/admin/freebies');
    revalidatePath('/c/freebies');
    revalidatePath('/c/wallet');
    revalidatePath('/c/dashboard');
    revalidatePath('/b/dashboard');
    revalidatePath('/b/wallet');
  }

  return result;
}

/**
 * Admin rejects a perk claim with audit feedback.
 */
export async function adminRejectPerkClaimAction(
  claimId: string,
  adminNotes: string
) {
  const { profile } = await requireAdminSession();

  const result = await adminRejectPerkClaim(claimId, profile.id, adminNotes);

  if (result.success) {
    revalidatePath('/admin/freebies');
    revalidatePath('/c/freebies');
    revalidatePath('/c/dashboard');
    revalidatePath('/b/dashboard');
  }

  return result;
}

/**
 * Admin toggles or updates a perk's status (active, draft, paused, expired).
 */
export async function adminUpdatePerkStatusAction(
  perkId: string,
  status: 'active' | 'draft' | 'paused' | 'expired'
) {
  const { supabase } = await requireAdminSession();

  const { error } = await supabase
    .from('platform_perks')
    .update({ status })
    .eq('id', perkId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/freebies');
  revalidatePath('/c/freebies');
  return { success: true };
}

/**
 * Admin updates an existing perk's details and configuration.
 */
export async function adminUpdatePerkAction(
  perkId: string,
  updates: Partial<Omit<PlatformPerk, 'id' | 'created_at' | 'claimed_count'>>
) {
  await requireAdminSession();

  const result = await adminUpdatePerk(perkId, updates);

  if (result.success) {
    revalidatePath('/admin/freebies');
    revalidatePath('/c/freebies');
    revalidatePath(`/c/freebies/${perkId}`);
  }

  return result;
}

/**
 * Admin permanently deletes a perk from the catalog.
 */
export async function adminDeletePerkAction(perkId: string) {
  await requireAdminSession();

  const result = await adminDeletePerk(perkId);

  if (result.success) {
    revalidatePath('/admin/freebies');
    revalidatePath('/c/freebies');
  }

  return result;
}

