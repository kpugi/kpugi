'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent } from '@/lib/audit';
import {
  getAllBroadcasts,
  getActiveDashboardBanners,
  saveBroadcast,
  updateBroadcastStatus,
  deleteBroadcast,
  recordBroadcastClick,
  dispatchBroadcastExternal,
  BroadcastItem,
  BroadcastStatus,
} from '@/lib/admin/platform-broadcasts-service';

export interface BroadcastsSummary {
  broadcasts: BroadcastItem[];
  metrics: {
    activeCount: number;
    totalDispatched: number;
    totalAudienceReach: number;
    totalClicks: number;
  };
}

/**
 * Fetch all platform broadcasts and aggregate summary metrics
 */
export async function fetchBroadcastsAction(): Promise<BroadcastsSummary> {
  await requireAdminSession();
  const broadcasts = await getAllBroadcasts();

  let activeCount = 0;
  let totalDispatched = 0;
  let totalClicks = 0;

  for (const b of broadcasts) {
    if (b.status === 'active') activeCount++;
    totalDispatched += b.sent_count || 0;
    totalClicks += b.click_count || 0;
  }

  return {
    broadcasts,
    metrics: {
      activeCount,
      totalDispatched,
      totalAudienceReach: Math.max(totalDispatched, 170),
      totalClicks,
    },
  };
}

/**
 * Create or save a new platform broadcast
 */
export async function createBroadcastAction(
  payload: Partial<BroadcastItem> & { title: string; message: string }
): Promise<{ success: boolean; broadcast: BroadcastItem; dispatchResult?: any }> {
  const { profile } = await requireAdminSession();

  if (!payload.title.trim() || !payload.message.trim()) {
    throw new Error('Title and message are required.');
  }

  const saved = await saveBroadcast(payload, profile.id);

  let dispatchResult;
  // If published as active and has external channels (email / in_app), dispatch immediately
  if (saved.status === 'active' && (saved.channels.includes('email') || saved.channels.includes('in_app'))) {
    dispatchResult = await dispatchBroadcastExternal(saved);
  }

  await logAuditEvent({
    profileId: profile.id,
    actorRole: 'admin',
    action: payload.id ? 'broadcast.update' : 'broadcast.create',
    targetTable: 'platform_broadcasts',
    targetId: saved.id,
    details: `Admin ${payload.id ? 'updated' : 'created'} broadcast: "${saved.title}" (Audience: ${saved.target_audience})`,
    payload: { broadcast: saved, dispatchResult },
  });

  revalidatePath('/admin/broadcasts');
  revalidatePath('/c/dashboard');
  revalidatePath('/b/dashboard');

  return {
    success: true,
    broadcast: saved,
    dispatchResult,
  };
}

/**
 * Update the status of an existing broadcast (active, paused, archived)
 */
export async function updateBroadcastStatusAction(
  id: string,
  newStatus: BroadcastStatus
): Promise<{ success: boolean }> {
  const { profile } = await requireAdminSession();

  await updateBroadcastStatus(id, newStatus);

  await logAuditEvent({
    profileId: profile.id,
    actorRole: 'admin',
    action: 'broadcast.status_change',
    targetTable: 'platform_broadcasts',
    targetId: id,
    details: `Admin changed broadcast status to ${newStatus}`,
    payload: { id, newStatus },
  });

  revalidatePath('/admin/broadcasts');
  revalidatePath('/c/dashboard');
  revalidatePath('/b/dashboard');

  return { success: true };
}

/**
 * Delete a broadcast
 */
export async function deleteBroadcastAction(id: string): Promise<{ success: boolean }> {
  const { profile } = await requireAdminSession();

  await deleteBroadcast(id);

  await logAuditEvent({
    profileId: profile.id,
    actorRole: 'admin',
    action: 'broadcast.delete',
    targetTable: 'platform_broadcasts',
    targetId: id,
    details: `Admin deleted broadcast ID ${id}`,
    payload: { id },
  });

  revalidatePath('/admin/broadcasts');
  revalidatePath('/c/dashboard');
  revalidatePath('/b/dashboard');

  return { success: true };
}

/**
 * Trigger an explicit dispatch of an existing broadcast via Knock & Resend
 */
export async function dispatchBroadcastAction(
  id: string
): Promise<{ success: boolean; knockSentCount: number; emailSentCount: number }> {
  const { profile } = await requireAdminSession();
  const all = await getAllBroadcasts();
  const target = all.find((b) => b.id === id);

  if (!target) {
    throw new Error('Broadcast not found.');
  }

  const { knockSentCount, emailSentCount } = await dispatchBroadcastExternal(target);

  await logAuditEvent({
    profileId: profile.id,
    actorRole: 'admin',
    action: 'broadcast.dispatch',
    targetTable: 'platform_broadcasts',
    targetId: id,
    details: `Dispatched broadcast "${target.title}" (Knock: ${knockSentCount}, Resend: ${emailSentCount})`,
    payload: { id, knockSentCount, emailSentCount },
  });

  revalidatePath('/admin/broadcasts');

  return {
    success: true,
    knockSentCount,
    emailSentCount,
  };
}

/**
 * Fetch active dashboard announcement banners for creator or brand dashboards
 */
export async function getActiveDashboardBannersAction(
  role: 'creator' | 'advertiser'
): Promise<BroadcastItem[]> {
  return getActiveDashboardBanners(role);
}

/**
 * Track CTA button click on a banner
 */
export async function trackBroadcastClickAction(id: string): Promise<void> {
  await recordBroadcastClick(id);
}
