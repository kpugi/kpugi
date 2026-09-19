'use server';

import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent, AUDIT_ACTIONS } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

/**
 * toggleCampaignHeroPinned
 * Pinned to the 5-slot top hero slider on the Browse page
 */
export async function toggleCampaignHeroPinned(campaignId: string, currentVal: boolean) {
  const { supabase, profileId } = await requireAdminSession();
  const newVal = !currentVal;

  if (newVal) {
    // Enforce max 5 hero pinned slots
    const { count, error: countErr } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('is_hero_pinned', true);

    if (countErr) {
      throw new Error(`Failed to check pinned count: ${countErr.message}`);
    }

    if ((count || 0) >= 5) {
      throw new Error('Maximum limit reached: Only 5 campaigns can be pinned to the hero slider at once.');
    }
  }

  const { error } = await supabase
    .from('campaigns')
    .update({ is_hero_pinned: newVal })
    .eq('id', campaignId);

  if (error) {
    throw new Error(`Failed to update campaign: ${error.message}`);
  }

  await logAuditEvent({
    profileId,
    actorRole: 'admin',
    action: AUDIT_ACTIONS.CAMPAIGN_HERO_PIN_TOGGLE,
    targetTable: 'campaigns',
    targetId: campaignId,
    payload: { previous: currentVal, current: newVal },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/campaigns');
  revalidatePath('/browse');

  return { success: true, is_hero_pinned: newVal };
}

/**
 * toggleCampaignFeatured
 * Featured badge on the browse floor grid
 */
export async function toggleCampaignFeatured(campaignId: string, currentVal: boolean) {
  const { supabase, profileId } = await requireAdminSession();
  const newVal = !currentVal;

  const { error } = await supabase
    .from('campaigns')
    .update({ is_featured: newVal })
    .eq('id', campaignId);

  if (error) {
    throw new Error(`Failed to update featured status: ${error.message}`);
  }

  await logAuditEvent({
    profileId,
    actorRole: 'admin',
    action: AUDIT_ACTIONS.CAMPAIGN_FEATURED_TOGGLE,
    targetTable: 'campaigns',
    targetId: campaignId,
    payload: { previous: currentVal, current: newVal },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/campaigns');
  revalidatePath('/browse');

  return { success: true, is_featured: newVal };
}

/**
 * toggleUserAdminStatus
 * Grant or revoke operator permissions
 */
export async function toggleUserAdminStatus(targetProfileId: string, currentVal: boolean) {
  const { supabase, profileId } = await requireAdminSession();
  const newVal = !currentVal;

  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: newVal })
    .eq('id', targetProfileId);

  if (error) {
    throw new Error(`Failed to update user admin status: ${error.message}`);
  }

  await logAuditEvent({
    profileId,
    actorRole: 'admin',
    action: AUDIT_ACTIONS.USER_ADMIN_TOGGLED,
    targetTable: 'profiles',
    targetId: targetProfileId,
    payload: { previous: currentVal, current: newVal },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/users');

  return { success: true, is_admin: newVal };
}

/**
 * overrideSubmissionStatus
 * Manually force a submission to verified_pass or verified_fail
 */
export async function overrideSubmissionStatus(
  submissionId: string,
  newStatus: 'verified_pass' | 'verified_fail' | 'approved' | 'rejected',
  reason: string
) {
  const { supabase, profileId } = await requireAdminSession();

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed audit reason is required for status overrides (min 5 chars).');
  }

  const { error } = await supabase
    .from('submissions')
    .update({
      status: newStatus,
      failure_reason: newStatus === 'verified_fail' || newStatus === 'rejected' ? reason : null,
      verified_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (error) {
    throw new Error(`Failed to override submission: ${error.message}`);
  }

  await logAuditEvent({
    profileId,
    actorRole: 'admin',
    action: AUDIT_ACTIONS.SUBMISSION_STATUS_OVERRIDE,
    targetTable: 'submissions',
    targetId: submissionId,
    payload: { newStatus, reason },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/submissions');

  return { success: true };
}
