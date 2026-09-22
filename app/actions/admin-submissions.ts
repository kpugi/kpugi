'use server';

import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent, AUDIT_ACTIONS } from '@/lib/audit';
import { triggerScraperRun } from '@/lib/scraper/trigger';
import { revalidatePath } from 'next/cache';

export type SubmissionStatusType =
  | 'pending'
  | 'verified_pass'
  | 'verified_fail'
  | 'paid'
  | 'forfeited'
  | 'approved'
  | 'rejected'
  | 'joined';

/**
 * overrideSubmissionStatusAction
 * Governance action to override submission verification status with mandatory audit trail
 */
export async function overrideSubmissionStatusAction(
  submissionId: string,
  newStatus: SubmissionStatusType,
  reason: string,
  failureReason?: string
) {
  const { supabase, profileId: adminId } = await requireAdminSession();

  if (!submissionId) {
    throw new Error('Submission ID is required.');
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit justification is required (minimum 5 characters).');
  }

  // 1. Fetch current submission
  const { data: currentSub, error: fetchErr } = await supabase
    .from('submissions')
    .select(`
      id,
      status,
      campaign_id,
      creator_id,
      post_url,
      reserved_amount,
      payout_amount,
      final_view_count,
      failure_reason,
      campaign:campaigns (
        id,
        title,
        cpm_rate
      )
    `)
    .eq('id', submissionId)
    .single();

  if (fetchErr || !currentSub) {
    throw new Error('Submission not found.');
  }

  const prevStatus = currentSub.status;
  const now = new Date().toISOString();

  // 2. Prepare update payload
  const isFailure = newStatus === 'verified_fail' || newStatus === 'rejected';
  const resolvedFailureReason = isFailure ? (failureReason || reason).trim() : null;

  const updateData: Record<string, unknown> = {
    status: newStatus,
    failure_reason: resolvedFailureReason,
    verified_at: now,
  };

  // If marked as paid, timestamp it
  if (newStatus === 'paid') {
    updateData.paid_at = now;
    if (!currentSub.payout_amount || Number(currentSub.payout_amount) === 0) {
      updateData.payout_amount = currentSub.reserved_amount;
    }
  }

  // If overriding to verified_pass and payout_amount is 0 or null, calculate based on cpm or reserved
  if ((newStatus === 'verified_pass' || newStatus === 'approved') && (!currentSub.payout_amount || Number(currentSub.payout_amount) === 0)) {
    const cpmRate = (currentSub.campaign as any)?.cpm_rate || 0;
    const views = currentSub.final_view_count || 0;
    const calcPayout = views > 0 && cpmRate > 0 ? (views / 1000) * cpmRate : Number(currentSub.reserved_amount);
    updateData.payout_amount = Math.min(calcPayout, Number(currentSub.reserved_amount) || calcPayout);
  }

  const { error: updateErr } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId);

  if (updateErr) {
    throw new Error(`Failed to update submission status: ${updateErr.message}`);
  }

  // 3. Log immutable audit event
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: AUDIT_ACTIONS.SUBMISSION_STATUS_OVERRIDE,
    targetTable: 'submissions',
    targetId: submissionId,
    details: `Admin changed submission status from '${prevStatus}' to '${newStatus}': ${reason}`,
    payload: {
      submissionId,
      campaignId: currentSub.campaign_id,
      creatorId: currentSub.creator_id,
      previousStatus: prevStatus,
      newStatus,
      reason,
      failureReason: resolvedFailureReason,
      timestamp: now,
    },
  });

  // 4. Revalidate all dependent routes
  revalidatePath('/admin');
  revalidatePath('/admin/submissions');
  revalidatePath(`/admin/submissions/${submissionId}`);
  if (currentSub.campaign_id) {
    revalidatePath(`/admin/campaigns/${currentSub.campaign_id}`);
  }
  if (currentSub.creator_id) {
    revalidatePath(`/admin/users/${currentSub.creator_id}`);
  }

  return { success: true, status: newStatus };
}

/**
 * adjustSubmissionPayoutAction
 * Manually update payout amount for a submission with ledger justification
 */
export async function adjustSubmissionPayoutAction(
  submissionId: string,
  newPayoutAmount: number,
  reason: string
) {
  const { supabase, profileId: adminId } = await requireAdminSession();

  if (isNaN(newPayoutAmount) || newPayoutAmount < 0) {
    throw new Error('Payout amount must be a non-negative number.');
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit justification is required (minimum 5 characters).');
  }

  const { data: currentSub, error: fetchErr } = await supabase
    .from('submissions')
    .select('id, payout_amount, reserved_amount, campaign_id, creator_id')
    .eq('id', submissionId)
    .single();

  if (fetchErr || !currentSub) {
    throw new Error('Submission not found.');
  }

  const prevPayout = Number(currentSub.payout_amount) || 0;

  const { error: updateErr } = await supabase
    .from('submissions')
    .update({ payout_amount: newPayoutAmount })
    .eq('id', submissionId);

  if (updateErr) {
    throw new Error(`Failed to update payout amount: ${updateErr.message}`);
  }

  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'submission.payout.adjusted',
    targetTable: 'submissions',
    targetId: submissionId,
    details: `Admin adjusted payout from ₦${prevPayout.toLocaleString()} to ₦${newPayoutAmount.toLocaleString()}: ${reason}`,
    payload: {
      submissionId,
      previousPayout: prevPayout,
      newPayout: newPayoutAmount,
      reservedAmount: currentSub.reserved_amount,
      reason,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/submissions');
  revalidatePath(`/admin/submissions/${submissionId}`);

  return { success: true, payoutAmount: newPayoutAmount };
}

/**
 * triggerSingleSubmissionScrapeAction
 * Dispatches on-demand verification check for this specific submission
 */
export async function triggerSingleSubmissionScrapeAction(submissionId: string) {
  const { supabase, profileId: adminId } = await requireAdminSession();

  const { data: sub, error: fetchErr } = await supabase
    .from('submissions')
    .select('id, post_url, campaign_id, creator_id')
    .eq('id', submissionId)
    .single();

  if (fetchErr || !sub) {
    throw new Error('Submission not found.');
  }

  if (!sub.post_url) {
    throw new Error('This submission has no active post URL to scrape.');
  }

  // Trigger scraper run
  const result = await triggerScraperRun();

  // Log audit event
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'submission.scraper.manual_trigger',
    targetTable: 'submissions',
    targetId: submissionId,
    details: `Admin requested immediate scraper check via ${result.channel}: ${result.message}`,
    payload: {
      submissionId,
      postUrl: sub.post_url,
      channel: result.channel,
      message: result.message,
    },
  });

  revalidatePath('/admin/submissions');
  revalidatePath(`/admin/submissions/${submissionId}`);

  return {
    success: true,
    channel: result.channel,
    message: result.message,
  };
}
