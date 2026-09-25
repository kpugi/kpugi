'use server';

import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent, AUDIT_ACTIONS } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/server';
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

/**
 * setUserSuspensionStatusAction
 * Suspend or unsuspend a user account with mandatory audit trail and Clerk synchronization
 */
export async function setUserSuspensionStatusAction(
  targetProfileId: string,
  newStatus: 'active' | 'suspended',
  reason: string,
  options?: { banInClerk?: boolean }
) {
  const { profileId: adminId } = await requireAdminSession();
  const adminClient = createAdminClient();

  if (targetProfileId === adminId) {
    throw new Error('Self-suspension forbidden: You cannot suspend your own administrator account.');
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed justification is required for account suspension changes (minimum 5 characters).');
  }

  // 1. Fetch current profile
  const { data: currentProfile, error: fetchErr } = await adminClient
    .from('profiles')
    .select('id, email, full_name, role, is_admin, clerk_id, account_status, onboarding_checklist_state')
    .eq('id', targetProfileId)
    .single();

  if (fetchErr || !currentProfile) {
    throw new Error('Target profile not found.');
  }

  const isSuspending = newStatus === 'suspended';
  const now = new Date().toISOString();

  // 2. Update profile with service role (bypasses RLS)
  const currentChecklist = (currentProfile.onboarding_checklist_state as Record<string, unknown>) || {};
  const updatedChecklist = {
    ...currentChecklist,
    account_status: newStatus,
    suspended_reason: isSuspending ? reason : null,
    suspended_at: isSuspending ? now : null,
  };

  const { error: updateErr } = await adminClient
    .from('profiles')
    .update({
      account_status: newStatus,
      suspended_reason: isSuspending ? reason : null,
      suspended_at: isSuspending ? now : null,
      onboarding_checklist_state: updatedChecklist,
      updated_at: now,
    })
    .eq('id', targetProfileId);

  if (updateErr) {
    throw new Error(`Failed to update user suspension status: ${updateErr.message}`);
  }

  // 3. Connect & synchronize with Clerk
  let clerkSynced = false;
  let clerkBanned = false;
  if (currentProfile.clerk_id) {
    try {
      const client = await clerkClient();

      // Sync publicMetadata so Clerk is officially aware of the suspension and reason
      await client.users.updateUserMetadata(currentProfile.clerk_id, {
        publicMetadata: {
          isSuspended: isSuspending,
          suspendedReason: isSuspending ? reason : null,
          suspendedAt: isSuspending ? now : null,
        },
      });
      clerkSynced = true;

      // Optional Clerk full ban or automatic unban
      if (isSuspending) {
        if (options?.banInClerk) {
          await client.users.banUser(currentProfile.clerk_id);
          clerkBanned = true;
        }
      } else {
        // Unsuspending: unban in Clerk if user was previously banned
        try {
          const clerkUser = await client.users.getUser(currentProfile.clerk_id);
          if (clerkUser.banned) {
            await client.users.unbanUser(currentProfile.clerk_id);
          }
        } catch (unbanErr) {
          console.warn('[setUserSuspensionStatusAction] Clerk unban check warning:', unbanErr);
        }
      }
    } catch (clerkErr: any) {
      console.warn('[setUserSuspensionStatusAction] Clerk sync warning:', clerkErr?.message);
    }
  }

  // 4. Write immutable audit log
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: isSuspending ? AUDIT_ACTIONS.USER_SUSPENDED : AUDIT_ACTIONS.USER_UNSUSPENDED,
    targetTable: 'profiles',
    targetId: targetProfileId,
    details: `Admin ${isSuspending ? 'suspended' : 'reactivated'} account (${currentProfile.email}): ${reason} [Clerk Synced: ${clerkSynced}${clerkBanned ? ', Full Ban' : ''}]`,
    payload: {
      targetUser: {
        id: targetProfileId,
        email: currentProfile.email,
        fullName: currentProfile.full_name,
        role: currentProfile.role,
        clerkId: currentProfile.clerk_id,
      },
      status: newStatus,
      reason,
      clerkSynced,
      clerkBanned,
      timestamp: now,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${targetProfileId}`);
  revalidatePath('/c/dashboard');
  revalidatePath('/b/dashboard');

  return { success: true, status: newStatus, clerkSynced, clerkBanned };
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
  const { profileId: adminId } = await requireAdminSession();
  const adminClient = createAdminClient();

  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error('Adjustment amount must be a positive number greater than zero.');
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit justification is required for wallet adjustments (minimum 5 characters).');
  }

  // 1. Fetch or initialize wallet with adminClient (service role bypasses RLS)
  let { data: wallet, error: walletErr } = await adminClient
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
    const { data: newWallet, error: initErr } = await adminClient
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
  const delta = adjustmentType === 'credit' ? amount : -amount;
  const newBalance = currentBalance + delta;

  if (adjustmentType === 'debit' && newBalance < 0) {
    throw new Error(`Insufficient funds: Current balance is ₦${currentBalance.toLocaleString()}, cannot debit ₦${amount.toLocaleString()}.`);
  }

  const now = new Date().toISOString();

  // 2. Update wallet balance via service role
  const { error: updateErr } = await adminClient
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', wallet.id);

  if (updateErr) {
    throw new Error(`Failed to update wallet balance: ${updateErr.message}`);
  }

  // 3. Insert transaction record into ledger
  const txType = adjustmentType === 'credit' ? 'deposit' : 'withdrawal';
  const txRef = `ADMIN_ADJ_${Date.now()}_${adminId.slice(0, 8)}`;

  const { error: txErr } = await adminClient.from('wallet_transactions').insert({
    wallet_id: wallet.id,
    type: txType,
    amount: delta,
    gross_amount: amount,
    net_amount: delta,
    status: 'completed',
    paystack_reference: txRef,
    created_at: now,
  });

  if (txErr) {
    console.error('[adjustUserWalletBalanceAction] Transaction record insert failed:', txErr);
  }

  // 4. Update creator total_earned if creator wallet was credited
  if (walletType === 'creator_earnings' && adjustmentType === 'credit') {
    const { data: cp } = await adminClient
      .from('creator_profiles')
      .select('total_earned')
      .eq('profile_id', targetProfileId)
      .maybeSingle();

    if (cp) {
      await adminClient
        .from('creator_profiles')
        .update({ total_earned: Math.max(0, (Number(cp.total_earned) || 0) + amount) })
        .eq('profile_id', targetProfileId);
    }
  }

  // 5. Log audit event
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
  revalidatePath('/admin/finances');
  revalidatePath('/c/wallet');
  revalidatePath('/b/wallet');

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
  const { profileId: adminId } = await requireAdminSession();
  const adminClient = createAdminClient();

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit justification is required to change roles (minimum 5 characters).');
  }

  // 1. Fetch current profile
  const { data: currentProfile, error: fetchErr } = await adminClient
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
  const { error: updateErr } = await adminClient
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', targetProfileId);

  if (updateErr) {
    throw new Error(`Failed to update role: ${updateErr.message}`);
  }

  // 3. Ensure sub-profiles exist
  if (newRole === 'creator' || newRole === 'both') {
    const { data: cProf } = await adminClient
      .from('creator_profiles')
      .select('profile_id')
      .eq('profile_id', targetProfileId)
      .maybeSingle();

    if (!cProf) {
      await adminClient.from('creator_profiles').insert({
        profile_id: targetProfileId,
        display_name: currentProfile.full_name || 'Creator',
      });
    }
  }

  if (newRole === 'advertiser' || newRole === 'both') {
    const { data: aProf } = await adminClient
      .from('advertiser_profiles')
      .select('profile_id')
      .eq('profile_id', targetProfileId)
      .maybeSingle();

    if (!aProf) {
      await adminClient.from('advertiser_profiles').insert({
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
  const { profileId: adminId } = await requireAdminSession();
  const adminClient = createAdminClient();

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit justification is required for KYC override (minimum 5 characters).');
  }

  const isVerified = kycStatus === 'verified';
  const now = new Date().toISOString();

  // Ensure creator profile exists
  const { data: cProf } = await adminClient
    .from('creator_profiles')
    .select('profile_id, kyc_status')
    .eq('profile_id', targetProfileId)
    .maybeSingle();

  if (!cProf) {
    await adminClient.from('creator_profiles').insert({
      profile_id: targetProfileId,
      kyc_status: kycStatus,
      kyc_verified_at: isVerified ? now : null,
    });
  } else {
    const { error: updateErr } = await adminClient
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
