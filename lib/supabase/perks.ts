/**
 * lib/supabase/perks.ts
 *
 * Server-side data fetching and mutation functions for the Platform Perks Hub.
 * All functions that mutate data use the admin Supabase client (service role)
 * so that RLS is bypassed safely on the server.
 */

import { createAdminClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

// Only 3 official categories: Challenges, Coupons, Freebies
export type PerkType = 'challenge' | 'coupon' | 'freebie';
export type RewardType = 'cash_wallet' | 'coupon_discount' | 'free_license' | 'merch_gift' | 'custom';
export type PerkStatus = 'active' | 'draft' | 'paused' | 'expired';
export type ClaimStatus = 'unlocked' | 'submitted' | 'approved' | 'rejected';

export interface PlatformPerk {
  id: string;
  title: string;
  slug: string;
  description: string;
  perk_type: PerkType;
  category: string;
  cover_image_url: string;
  theme_color: string;
  reward_type: RewardType;
  reward_amount: number;
  coupon_code: string | null;
  affiliate_url: string | null;
  has_affiliate_disclaimer: boolean;
  min_creator_level: number;
  requires_proof: boolean;
  proof_instructions: string | null;
  total_quota: number | null;
  claimed_count: number;
  savings_value: string | null;
  partner_name: string | null;
  status: PerkStatus;
  start_at: string;
  end_at: string | null;
  created_at: string;
}

export interface PerkClaim {
  id: string;
  perk_id: string;
  creator_id: string;
  status: ClaimStatus;
  proof_url: string | null;
  proof_notes: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  reward_paid: boolean;
  wallet_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PerkWithClaim extends PlatformPerk {
  claim: PerkClaim | null;
}

export interface AdminPerkClaimRow {
  id: string;
  perk_id: string;
  creator_id: string;
  status: ClaimStatus;
  proof_url: string | null;
  proof_notes: string | null;
  submitted_at: string | null;
  admin_notes: string | null;
  reward_paid: boolean;
  perk: Pick<PlatformPerk, 'title' | 'perk_type' | 'reward_amount' | 'reward_type'> | null;
  creator: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    creator_handle: string | null;
    total_earned: number;
    level?: number;
    role?: string;
  } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATOR — READ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all active platform perks, joined with the creator's own claim record.
 */
export async function getPerksForCreator(creatorId: string): Promise<PerkWithClaim[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_perks')
    .select(`
      *,
      claim:platform_perk_claims!platform_perk_claims_perk_id_fkey (
        id,
        creator_id,
        status,
        proof_url,
        proof_notes,
        submitted_at,
        reviewed_at,
        admin_notes,
        reward_paid,
        wallet_transaction_id,
        created_at,
        updated_at
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getPerksForCreator]', error);
    return [];
  }

  return (data ?? []).map((row: any) => {
    // Supabase returns the joined claim as an array; filter to this creator's record
    const claims: PerkClaim[] = Array.isArray(row.claim) ? row.claim : row.claim ? [row.claim] : [];
    const myClaim = claims.find((c: any) => c.creator_id === creatorId) ?? null;
    const perkType: PerkType = row.perk_type === 'software_deal' ? 'coupon' : row.perk_type === 'bonus' ? 'challenge' : (row.perk_type as PerkType);

    return {
      ...row,
      perk_type: perkType,
      claim: myClaim,
    } as PerkWithClaim;
  });
}

/**
 * Fetch a single perk by ID or slug with the creator's claim.
 */
export async function getPerkDetail(
  idOrSlug: string,
  creatorId: string
): Promise<PerkWithClaim | null> {
  const supabase = createAdminClient();

  const isUUID = /^[0-9a-f-]{36}$/i.test(idOrSlug);
  const filter = isUUID ? { id: idOrSlug } : { slug: idOrSlug };

  const { data, error } = await supabase
    .from('platform_perks')
    .select(`
      *,
      claim:platform_perk_claims!platform_perk_claims_perk_id_fkey (
        id,
        creator_id,
        status,
        proof_url,
        proof_notes,
        submitted_at,
        reviewed_at,
        admin_notes,
        reward_paid,
        wallet_transaction_id,
        created_at,
        updated_at
      )
    `)
    .match(filter)
    .maybeSingle();

  if (error || !data) {
    console.error('[getPerkDetail]', error);
    return null;
  }

  const claims: any[] = Array.isArray(data.claim) ? data.claim : data.claim ? [data.claim] : [];
  const myClaim = claims.find((c) => c.creator_id === creatorId) ?? null;
  const perkType: PerkType = data.perk_type === 'software_deal' ? 'coupon' : data.perk_type === 'bonus' ? 'challenge' : (data.perk_type as PerkType);

  return { ...data, perk_type: perkType, claim: myClaim } as PerkWithClaim;
}

/**
 * Get a creator's total bonuses earned from approved perk claims.
 */
export async function getCreatorPerkBonusTotal(creatorId: string): Promise<number> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_perk_claims')
    .select('perk:platform_perks!inner(reward_amount, reward_type)')
    .eq('creator_id', creatorId)
    .eq('status', 'approved');

  if (error || !data) return 0;

  return data.reduce((sum: number, row: any) => {
    const perk = Array.isArray(row.perk) ? row.perk[0] : row.perk;
    if (perk?.reward_type === 'cash_wallet') {
      return sum + (Number(perk.reward_amount) || 0);
    }
    return sum;
  }, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATOR — MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creator submits proof for a challenge/freebie perk.
 * Creates or updates their claim record to 'submitted'.
 */
export async function submitPerkProof(input: {
  perkId: string;
  creatorId: string;
  proofUrl: string;
  proofNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Upsert the claim — unique on (perk_id, creator_id)
  const { error } = await supabase
    .from('platform_perk_claims')
    .upsert(
      {
        perk_id:      input.perkId,
        creator_id:   input.creatorId,
        status:       'submitted',
        proof_url:    input.proofUrl,
        proof_notes:  input.proofNotes ?? null,
        submitted_at: new Date().toISOString(),
      },
      {
        onConflict: 'perk_id,creator_id',
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error('[submitPerkProof]', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Creator claims a no-proof perk (instant coupon / software deal / freebie).
 * Creates a claim record in 'approved' state immediately.
 */
export async function claimInstantPerk(input: {
  perkId: string;
  creatorId: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('platform_perk_claims')
    .upsert(
      {
        perk_id:    input.perkId,
        creator_id: input.creatorId,
        status:     'approved',
        reward_paid: false,
      },
      {
        onConflict: 'perk_id,creator_id',
        ignoreDuplicates: true,
      }
    );

  if (error) {
    console.error('[claimInstantPerk]', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — READ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all perks for admin catalog view (all statuses).
 */
export async function adminGetAllPerks(): Promise<PlatformPerk[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_perks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[adminGetAllPerks]', error);
    return [];
  }

  return (data ?? []) as PlatformPerk[];
}

/**
 * Fetch pending proof submissions for admin review queue.
 */
export async function adminGetPendingClaims(): Promise<AdminPerkClaimRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_perk_claims')
    .select(`
      id,
      perk_id,
      creator_id,
      status,
      proof_url,
      proof_notes,
      submitted_at,
      admin_notes,
      reward_paid,
      perk:platform_perks ( title, perk_type, reward_amount, reward_type ),
      creator:profiles (
        full_name,
        email,
        avatar_url,
        role,
        creator_profile:creator_profiles ( creator_handle, total_earned )
      )
    `)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

  if (error) {
    console.error('[adminGetPendingClaims]', error);
    return [];
  }

  return (data ?? []).map((row: any) => {
    const perk    = Array.isArray(row.perk)    ? row.perk[0]    : row.perk;
    const creator = Array.isArray(row.creator) ? row.creator[0] : row.creator;
    const cp      = creator?.creator_profile
      ? Array.isArray(creator.creator_profile)
        ? creator.creator_profile[0]
        : creator.creator_profile
      : null;

    return {
      id:           row.id,
      perk_id:      row.perk_id,
      creator_id:   row.creator_id,
      status:       row.status,
      proof_url:    row.proof_url,
      proof_notes:  row.proof_notes,
      submitted_at: row.submitted_at,
      admin_notes:  row.admin_notes,
      reward_paid:  row.reward_paid,
      perk:         perk ?? null,
      creator: creator
        ? {
            full_name:      creator.full_name,
            email:          creator.email,
            avatar_url:     creator.avatar_url,
            role:           creator.role ?? 'creator',
            creator_handle: cp?.creator_handle ?? (creator.role === 'advertiser' ? 'advertiser' : null),
            total_earned:   Number(cp?.total_earned ?? 0),
          }
        : null,
    } as AdminPerkClaimRow;
  });
}

/**
 * Fetch all claims for admin (any status).
 */
export async function adminGetAllClaims(): Promise<AdminPerkClaimRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_perk_claims')
    .select(`
      id,
      perk_id,
      creator_id,
      status,
      proof_url,
      proof_notes,
      submitted_at,
      admin_notes,
      reward_paid,
      perk:platform_perks ( title, perk_type, reward_amount, reward_type ),
      creator:profiles (
        full_name,
        email,
        avatar_url,
        role,
        creator_profile:creator_profiles ( creator_handle, total_earned )
      )
    `)
    .order('submitted_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[adminGetAllClaims]', error);
    return [];
  }

  return (data ?? []).map((row: any) => {
    const perk    = Array.isArray(row.perk)    ? row.perk[0]    : row.perk;
    const creator = Array.isArray(row.creator) ? row.creator[0] : row.creator;
    const cp      = creator?.creator_profile
      ? Array.isArray(creator.creator_profile)
        ? creator.creator_profile[0]
        : creator.creator_profile
      : null;

    return {
      id:           row.id,
      perk_id:      row.perk_id,
      creator_id:   row.creator_id,
      status:       row.status,
      proof_url:    row.proof_url,
      proof_notes:  row.proof_notes,
      submitted_at: row.submitted_at,
      admin_notes:  row.admin_notes,
      reward_paid:  row.reward_paid,
      perk:         perk ?? null,
      creator: creator
        ? {
            full_name:      creator.full_name,
            email:          creator.email,
            avatar_url:     creator.avatar_url,
            role:           creator.role ?? 'creator',
            creator_handle: cp?.creator_handle ?? (creator.role === 'advertiser' ? 'advertiser' : null),
            total_earned:   Number(cp?.total_earned ?? 0),
          }
        : null,
    } as AdminPerkClaimRow;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin deploys a new perk to the catalog.
 */
export async function adminDeployPerk(
  adminId: string,
  perk: Omit<PlatformPerk, 'id' | 'claimed_count' | 'created_at'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_perks')
    .insert({ ...perk, created_by: adminId, claimed_count: 0 })
    .select('id')
    .single();

  if (error) {
    console.error('[adminDeployPerk]', error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Admin updates an existing perk's fields.
 */
export async function adminUpdatePerk(
  perkId: string,
  updates: Partial<Omit<PlatformPerk, 'id' | 'created_at' | 'claimed_count'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('platform_perks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', perkId);

  if (error) {
    console.error('[adminUpdatePerk]', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Admin deletes a perk from the catalog.
 */
export async function adminDeletePerk(
  perkId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('platform_perks')
    .delete()
    .eq('id', perkId);

  if (error) {
    console.error('[adminDeletePerk]', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Approve a perk claim via the atomic SQL function.
 * Credits creator wallet if reward_type = 'cash_wallet'.
 */
export async function adminApprovePerkClaim(
  claimId: string,
  adminId: string,
  adminNotes?: string
): Promise<{ success: boolean; reward_amount?: number; new_balance?: number; error?: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('atomic_approve_perk_claim', {
    p_claim_id:    claimId,
    p_admin_id:    adminId,
    p_admin_notes: adminNotes ?? null,
  });

  if (error) {
    console.error('[adminApprovePerkClaim]', error);
    return { success: false, error: error.message };
  }

  return data as { success: boolean; reward_amount?: number; new_balance?: number; error?: string };
}

/**
 * Reject a perk claim.
 */
export async function adminRejectPerkClaim(
  claimId: string,
  adminId: string,
  adminNotes: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('reject_perk_claim', {
    p_claim_id:    claimId,
    p_admin_id:    adminId,
    p_admin_notes: adminNotes,
  });

  if (error) {
    console.error('[adminRejectPerkClaim]', error);
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}

/**
 * Get summary metrics for admin dashboard panel.
 */
export async function adminGetPerkMetrics(): Promise<{
  activePerksCount: number;
  pendingReviewCount: number;
  totalNairaPaidOut: number;
}> {
  const supabase = createAdminClient();

  const [perksRes, pendingRes, paidRes] = await Promise.all([
    supabase.from('platform_perks').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('platform_perk_claims').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('platform_perk_claims').select('perk:platform_perks!inner(reward_amount)').eq('status', 'approved').eq('reward_paid', true),
  ]);

  const totalNairaPaidOut = (paidRes.data ?? []).reduce((sum: number, row: any) => {
    const perk = Array.isArray(row.perk) ? row.perk[0] : row.perk;
    return sum + (Number(perk?.reward_amount) || 0);
  }, 0);

  return {
    activePerksCount:   perksRes.count ?? 0,
    pendingReviewCount: pendingRes.count ?? 0,
    totalNairaPaidOut,
  };
}
