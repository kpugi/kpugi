'use server';

import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent, AUDIT_ACTIONS } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

/**
 * setUserSuspensionStatusAction
 * Suspend or unsuspend a user account with mandatory audit trail
 */
export async function setUserSuspensionStatusAction(
  targetProfileId: string,
  newStatus: 'active' | 'suspended',
  reason: string
) {
  const { supabase, profileId: adminId } = await requireAdminSession();

  if (targetProfileId === adminId) {
    throw new Error('Self-suspension forbidden: You cannot suspend your own administrator account.');
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed justification is required for account suspension changes (minimum 5 characters).');
  }

  // 1. Fetch current profile
  const { data: currentProfile, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_admin, onboarding_checklist_state')
    .eq('id', targetProfileId)
    .single();

  if (fetchErr || !currentProfile) {
    throw new Error('Target profile not found.');
  }

  const isSuspending = newStatus === 'suspended';
  const now = new Date().toISOString();

  // 2. Update profile (handles both dedicated columns and JSON fallback)
  const currentChecklist = (currentProfile.onboarding_checklist_state as Record<string, unknown>) || {};
  const updatedChecklist = {
    ...currentChecklist,
    account_status: newStatus,
    suspended_reason: isSuspending ? reason : null,
    suspended_at: isSuspending ? now : null,
  };

  // Attempt update with dedicated columns; fall back to checklist state if columns not yet migrated
  let updateErr = null;
  const { error: directErr } = await supabase
    .from('profiles')
    .update({
      account_status: newStatus,
      suspended_reason: isSuspending ? reason : null,
      suspended_at: isSuspending ? now : null,
      onboarding_checklist_state: updatedChecklist,
      updated_at: now,
    } as any)
    .eq('id', targetProfileId);

  if (directErr) {
    // Retry updating only safe columns
    const { error: fallbackErr } = await supabase
      .from('profiles')
      .update({
        onboarding_checklist_state: updatedChecklist,
        updated_at: now,
      })
      .eq('id', targetProfileId);

    updateErr = fallbackErr;
  }

  if (updateErr) {
    throw new Error(`Failed to update user suspension status: ${updateErr.message}`);
  }

  // 3. Write immutable audit log
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: isSuspending ? AUDIT_ACTIONS.USER_SUSPENDED : AUDIT_ACTIONS.USER_UNSUSPENDED,
    targetTable: 'profiles',
    targetId: targetProfileId,
    details: `Admin ${isSuspending ? 'suspended' : 'reactivated'} account (${currentProfile.email}): ${reason}`,
    payload: {
      targetUser: {
        id: targetProfileId,
        email: currentProfile.email,
        fullName: currentProfile.full_name,
        role: currentProfile.role,
      },
      status: newStatus,
      reason,
      timestamp: now,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${targetProfileId}`);

  return { success: true, status: newStatus };
}

/**
 * adjustUserWalletBalanceAction
 * Credit or debit a user's wallet with ledger entry and immutable audit trail
 */
export async function adjustUserWalletBalanceAction(
  targetProfileId: string,
  walletType: 'advertiser_funding' | 'creator_earnings',
  amount: number,
  adjustmentType: 'credit' | 'debit',
  reason: string
) {
  const { supabase, profileId: adminId } = await requireAdminSession();

  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error('Adjustment amount must be a positive number greater than zero.');
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit justification is required for wallet adjustments (minimum 5 characters).');
  }

  // 1. Fetch or create wallet
  let { data: wallet, error: walletErr } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('profile_id', targetProfileId)
    .eq('wallet_type', walletType)
    .maybeSingle();

  if (walletErr) {
    throw new Error(`Failed to query wallet: ${walletErr.message}`);
  }

  if (!wallet) {
    // Initialize wallet if not yet created
    const { data: newWallet, error: initErr } = await supabase
      .from('wallets')
      .insert({
        profile_id: targetProfileId,
        wallet_type: walletType,
        balance: 0,
      })
      .select('id, balance')
      .single();

    if (initErr || !newWallet) {
      throw new Error(`Failed to initialize wallet: ${initErr?.message}`);
    }
    wallet = newWallet;
  }

  const currentBalance = Number(wallet.balance) || 0;
  let newBalance = adjustmentType === 'credit' ? currentBalance + amount : currentBalance - amount;

  if (adjustmentType === 'debit' && newBalance < 0) {
    throw new Error(`Insufficient funds: Current balance is ₦${currentBalance.toLocaleString()}, cannot debit ₦${amount.toLocaleString()}.`);
  }

  const now = new Date().toISOString();

  // 2. Update wallet balance
  const { error: updateErr } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', wallet.id);

  if (updateErr) {
    throw new Error(`Failed to update wallet balance: ${updateErr.message}`);
  }

  // 3. Insert transaction record into ledger
  const txType = adjustmentType === 'credit' ? 'budget_release_refund' : 'commission_deduction';
  const txRef = `ADMIN_ADJ_${Date.now()}_${adminId.slice(0, 8)}`;

  await supabase.from('wallet_transactions').insert({
    wallet_id: wallet.id,
    type: txType,
    amount: amount,
    paystack_reference: txRef,
    created_at: now,
  });

  // 4. Log audit event
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: adjustmentType === 'credit' ? AUDIT_ACTIONS.WALLET_FUNDED : AUDIT_ACTIONS.WALLET_WITHDRAWN,
    targetTable: 'wallets',
    targetId: wallet.id,
    details: `Admin ${adjustmentType === 'credit' ? 'credited' : 'debited'} ${walletType} wallet by ₦${amount.toLocaleString()}: ${reason}`,
    payload: {
      profileId: targetProfileId,
      walletId: wallet.id,
      walletType,
      adjustmentType,
      amount,
      previousBalance: currentBalance,
      newBalance,
      reference: txRef,
      reason,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${targetProfileId}`);

  return { success: true, newBalance };
}

/**
 * updateUserRoleAction
 * Change user role (creator, advertiser, both) and provision auxiliary profiles
 */
export async function updateUserRoleAction(
  targetProfileId: string,
  newRole: 'creator' | 'advertiser' | 'both',
  reason: string
) {
  const { supabase, profileId: adminId } = await requireAdminSession();

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit justification is required to change roles (minimum 5 characters).');
  }

  // 1. Fetch current profile
  const { data: currentProfile, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', targetProfileId)
    .single();

  if (fetchErr || !currentProfile) {
    throw new Error('Profile not found.');
  }

  const prevRole = currentProfile.role;
  if (prevRole === newRole) {
    return { success: true, role: newRole };
  }

  // 2. Update role in profiles
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', targetProfileId);

  if (updateErr) {
    throw new Error(`Failed to update role: ${updateErr.message}`);
  }

  // 3. Ensure sub-profiles exist
  if (newRole === 'creator' || newRole === 'both') {
    const { data: cProf } = await supabase
      .from('creator_profiles')
      .select('profile_id')
      .eq('profile_id', targetProfileId)
      .maybeSingle();

    if (!cProf) {
      await supabase.from('creator_profiles').insert({
        profile_id: targetProfileId,
        display_name: currentProfile.full_name || 'Creator',
      });
    }
  }

  if (newRole === 'advertiser' || newRole === 'both') {
    const { data: aProf } = await supabase
      .from('advertiser_profiles')
      .select('profile_id')
      .eq('profile_id', targetProfileId)
      .maybeSingle();

    if (!aProf) {
      await supabase.from('advertiser_profiles').insert({
        profile_id: targetProfileId,
        company_name: currentProfile.full_name || 'Brand Company',
        billing_email: currentProfile.email,
      });
    }
  }

  // 4. Log audit event
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: AUDIT_ACTIONS.USER_PROFILE_UPDATED,
    targetTable: 'profiles',
    targetId: targetProfileId,
    details: `Admin changed user role from '${prevRole}' to '${newRole}': ${reason}`,
    payload: {
      previousRole: prevRole,
      newRole,
      reason,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${targetProfileId}`);

  return { success: true, role: newRole };
}

/**
 * overrideUserKycStatusAction
 * Force override Didit KYC verification status on creator_profiles
 */
export async function overrideUserKycStatusAction(
  targetProfileId: string,
  kycStatus: 'verified' | 'unverified' | 'pending' | 'rejected',
  reason: string
) {
  const { supabase, profileId: adminId } = await requireAdminSession();

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit justification is required for KYC override (minimum 5 characters).');
  }

  const isVerified = kycStatus === 'verified';
  const now = new Date().toISOString();

  // Ensure creator profile exists
  const { data: cProf } = await supabase
    .from('creator_profiles')
    .select('profile_id, kyc_status')
    .eq('profile_id', targetProfileId)
    .maybeSingle();

  if (!cProf) {
    await supabase.from('creator_profiles').insert({
      profile_id: targetProfileId,
      kyc_status: kycStatus,
      kyc_verified_at: isVerified ? now : null,
    });
  } else {
    const { error: updateErr } = await supabase
      .from('creator_profiles')
      .update({
        kyc_status: kycStatus,
        kyc_verified_at: isVerified ? now : null,
      })
      .eq('profile_id', targetProfileId);

    if (updateErr) {
      throw new Error(`Failed to update KYC status: ${updateErr.message}`);
    }
  }

  // Log audit event
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'user.kyc.override',
    targetTable: 'creator_profiles',
    targetId: targetProfileId,
    details: `Admin changed KYC status to '${kycStatus}': ${reason}`,
    payload: {
      targetProfileId,
      previousStatus: cProf?.kyc_status || 'unverified',
      newStatus: kycStatus,
      reason,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${targetProfileId}`);

  return { success: true, kycStatus };
}
