'use server';

import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface KycInspectionData {
  creatorId: string;
  fullName: string;
  email: string;
  kycStatus: string;
  verifiedAt: string | null;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;
  submission: {
    id: string;
    documentType: string;
    idNumber: string | null;
    extractedName: string | null;
    matchScore: number;
    faceConfidence: number;
    submittedAt: string;
    reason: string;
    decision: string;
  } | null;
  idSignedUrl: string | null;
  selfieSignedUrl: string | null;
}

/**
 * Fetch complete KYC inspection details with short-lived secure signed URLs
 */
export async function getCreatorKycInspection(creatorId: string): Promise<KycInspectionData> {
  await requireAdminSession();
  const supabase = createAdminClient();

  // 1. Fetch Profile & Creator Details
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', creatorId)
    .single();

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('kyc_status, kyc_verified_at, notification_preferences, kyc_didit_session_id')
    .eq('profile_id', creatorId)
    .single();

  // 2. Fetch Bank Account Details
  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('bank_name, account_number, account_name, is_primary')
    .eq('profile_id', creatorId)
    .order('is_primary', { ascending: false })
    .limit(1);

  const bankAccount = bankAccounts && bankAccounts.length > 0 ? {
    bankName: bankAccounts[0].bank_name,
    accountNumber: bankAccounts[0].account_number,
    accountName: bankAccounts[0].account_name,
  } : null;

  // 3. Extract KpugiSync submission metadata
  const notifs = (creator?.notification_preferences as any) || {};
  let meta = notifs.kpugisync_submission || null;

  let idPath = meta?.id_path || null;
  let selfiePath = meta?.selfie_path || null;

  // Storage Fallback: If metadata paths are missing, check creator's storage folder directly
  if (!idPath || !selfiePath) {
    try {
      const { data: files } = await supabase.storage
        .from('kyc-documents')
        .list(creatorId, { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

      if (files && files.length > 0) {
        if (!idPath) {
          const idFile = files.find((f) => f.name.startsWith('id_front_') || f.name.includes('id_'));
          if (idFile) idPath = `${creatorId}/${idFile.name}`;
        }
        if (!selfiePath) {
          const selfieFile = files.find((f) => f.name.startsWith('selfie_') || f.name.includes('selfie'));
          if (selfieFile) selfiePath = `${creatorId}/${selfieFile.name}`;
        }
      }
    } catch (e: any) {
      console.warn('[Admin KYC] Storage fallback list error:', e.message);
    }
  }

  let idSignedUrl: string | null = null;
  let selfieSignedUrl: string | null = null;

  if (idPath) {
    const { data: idSigned } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(idPath, 900); // 15 mins
    idSignedUrl = idSigned?.signedUrl || null;
  }

  if (selfiePath) {
    const { data: selfieSigned } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(selfiePath, 900); // 15 mins
    selfieSignedUrl = selfieSigned?.signedUrl || null;
  }

  // Construct submission data, falling back to files on disk if meta was pending
  const submission = (meta || idPath) ? {
    id: meta?.id || creator?.kyc_didit_session_id || 'sync',
    documentType: meta?.document_type || 'Government ID',
    idNumber: meta?.id_number || null,
    extractedName: meta?.extracted_name || null,
    matchScore: Number(meta?.match_score) || 0,
    faceConfidence: Number(meta?.face_confidence) || 0,
    submittedAt: meta?.submitted_at || creator?.kyc_verified_at || new Date().toISOString(),
    reason: meta?.decision === 'auto_approved'
      ? 'Matched with high confidence'
      : (meta?.reason || 'Queued for human verification'),
    decision: meta?.decision || (creator?.kyc_status === 'verified' ? 'auto_approved' : 'pending'),
  } : null;

  return {
    creatorId,
    fullName: profile?.full_name || 'Creator',
    email: profile?.email || '',
    kycStatus: creator?.kyc_status || 'unverified',
    verifiedAt: creator?.kyc_verified_at || null,
    bankAccount,
    submission,
    idSignedUrl,
    selfieSignedUrl,
  };
}

/**
 * 1-Click Approve KpugiSync Submission
 */
export async function approveKpugiSyncSubmission(creatorId: string) {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('creator_profiles')
    .update({
      kyc_status: 'verified',
      kyc_verified_at: now,
    })
    .eq('profile_id', creatorId);

  if (error) {
    throw new Error(`Failed to approve verification: ${error.message}`);
  }

  // Update kyc_submissions table if exists
  try {
    await supabase
      .from('kyc_submissions')
      .update({
        decision: 'admin_approved',
        reviewed_by: adminId,
        reviewed_at: now,
      })
      .eq('creator_id', creatorId)
      .eq('decision', 'pending');
  } catch (e: any) {
    // Non-fatal if table pending
  }

  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'user.kyc.override',
    targetTable: 'creator_profiles',
    targetId: creatorId,
    details: 'Admin approved via KpugiSync review panel',
    payload: {
      new_status: 'verified',
    },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

/**
 * 1-Click Reject KpugiSync Submission with Reason
 */
export async function rejectKpugiSyncSubmission(creatorId: string, reason: string) {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  if (!reason || reason.trim().length < 5) {
    throw new Error('Please provide an informative rejection reason (minimum 5 characters).');
  }

  const { error } = await supabase
    .from('creator_profiles')
    .update({
      kyc_status: 'rejected',
    })
    .eq('profile_id', creatorId);

  if (error) {
    throw new Error(`Failed to reject verification: ${error.message}`);
  }

  // Update kyc_submissions table if exists
  try {
    await supabase
      .from('kyc_submissions')
      .update({
        decision: 'admin_rejected',
        rejection_reason: reason.trim(),
        reviewed_by: adminId,
        reviewed_at: now,
      })
      .eq('creator_id', creatorId)
      .eq('decision', 'pending');
  } catch (e: any) {
    // Non-fatal if table pending
  }

  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'user.kyc.override',
    targetTable: 'creator_profiles',
    targetId: creatorId,
    details: `Admin rejected via KpugiSync: ${reason.trim()}`,
    payload: {
      new_status: 'rejected',
      reason: reason.trim(),
    },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

