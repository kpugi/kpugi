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
  revalidatePath(`/admin/campaigns/${campaignId}`);
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
  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath('/browse');

  return { success: true, is_featured: newVal };
}

/**
 * updateCampaignStatus
 * Admin override to change campaign lifecycle status
 */
export async function updateCampaignStatus(
  campaignId: string,
  newStatus: 'live' | 'paused' | 'completed' | 'archived',
  reason?: string
) {
  const { supabase, profileId } = await requireAdminSession();

  const { data: current, error: fetchErr } = await supabase
    .from('campaigns')
    .select('id, title, status')
    .eq('id', campaignId)
    .single();

  if (fetchErr || !current) {
    throw new Error('Campaign not found.');
  }

  const prevStatus = current.status;
  if (prevStatus === newStatus) {
    return { success: true, status: newStatus };
  }

  const { error } = await supabase
    .from('campaigns')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  if (error) {
    throw new Error(`Failed to update campaign status: ${error.message}`);
  }

  // If completed, trigger settlement if needed
  if (newStatus === 'completed' && prevStatus !== 'completed') {
    try {
      const { settleCompletedCampaign } = await import('@/lib/supabase/settlement');
      await settleCompletedCampaign(supabase, campaignId);
    } catch (settleErr) {
      console.error('[updateCampaignStatus] Settlement error:', settleErr);
    }
  }

  await logAuditEvent({
    profileId,
    actorRole: 'admin',
    action: AUDIT_ACTIONS.CAMPAIGN_STATUS_OVERRIDE,
    targetTable: 'campaigns',
    targetId: campaignId,
    details: `Admin changed status from '${prevStatus}' to '${newStatus}'${reason ? `: ${reason}` : ''}`,
    payload: { previous: prevStatus, current: newStatus, reason: reason || null },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/campaigns');
  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath('/browse');

  return { success: true, status: newStatus };
}

/**
 * updateCampaignCpm
 * Admin override for CPM rate
 */
export async function updateCampaignCpm(
  campaignId: string,
  newCpmRate: number,
  reason?: string
) {
  const { supabase, profileId } = await requireAdminSession();

  if (!newCpmRate || newCpmRate <= 0) {
    throw new Error('CPM rate must be a positive number.');
  }

  const { data: current, error: fetchErr } = await supabase
    .from('campaigns')
    .select('id, title, cpm_rate')
    .eq('id', campaignId)
    .single();

  if (fetchErr || !current) {
    throw new Error('Campaign not found.');
  }

  const prevCpm = current.cpm_rate;

  const { error } = await supabase
    .from('campaigns')
    .update({
      cpm_rate: newCpmRate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  if (error) {
    throw new Error(`Failed to update CPM rate: ${error.message}`);
  }

  await logAuditEvent({
    profileId,
    actorRole: 'admin',
    action: AUDIT_ACTIONS.CAMPAIGN_CPM_OVERRIDE,
    targetTable: 'campaigns',
    targetId: campaignId,
    details: `Admin updated CPM from ₦${Number(prevCpm).toLocaleString()} to ₦${Number(newCpmRate).toLocaleString()}${reason ? `: ${reason}` : ''}`,
    payload: { previous: prevCpm, current: newCpmRate, reason: reason || null },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/campaigns');
  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath('/browse');

  return { success: true, cpm_rate: newCpmRate };
}

/**
 * updateCampaignBudget
 * Admin adjustment for campaign total budget
 */
export async function updateCampaignBudget(
  campaignId: string,
  newTotalBudget: number,
  reason?: string
) {
  const { supabase, profileId } = await requireAdminSession();

  if (newTotalBudget === undefined || newTotalBudget < 0) {
    throw new Error('Total budget must be a non-negative number.');
  }

  const { data: current, error: fetchErr } = await supabase
    .from('campaigns')
    .select('id, title, total_budget, spent_budget')
    .eq('id', campaignId)
    .single();

  if (fetchErr || !current) {
    throw new Error('Campaign not found.');
  }

  const prevBudget = current.total_budget;

  const { error } = await supabase
    .from('campaigns')
    .update({
      total_budget: newTotalBudget,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  if (error) {
    throw new Error(`Failed to update budget: ${error.message}`);
  }

  await logAuditEvent({
    profileId,
    actorRole: 'admin',
    action: 'campaign.budget.override',
    targetTable: 'campaigns',
    targetId: campaignId,
    details: `Admin adjusted budget from ₦${Number(prevBudget).toLocaleString()} to ₦${Number(newTotalBudget).toLocaleString()}${reason ? `: ${reason}` : ''}`,
    payload: { previous: prevBudget, current: newTotalBudget, reason: reason || null },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/campaigns');
  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath('/browse');

  return { success: true, total_budget: newTotalBudget };
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

/**
 * triggerManualScraperRunAction
 * On-demand dispatch of the GitHub Actions / cron scraper engine
 */
export async function triggerManualScraperRunAction(campaignId?: string) {
  const { profileId } = await requireAdminSession();
  const { triggerScraperRun } = await import('@/lib/scraper/trigger');
  const result = await triggerScraperRun();

  await logAuditEvent({
    profileId,
    actorRole: 'admin',
    action: 'scraper.manual_dispatch',
    targetTable: campaignId ? 'campaigns' : undefined,
    targetId: campaignId,
    details: `Admin dispatched scraper run via ${result.channel}: ${result.message}`,
    payload: { result, campaignId },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/campaigns');
  if (campaignId) {
    revalidatePath(`/admin/campaigns/${campaignId}`);
  }

  return result;
}
