import { createAdminClient } from '@/lib/supabase/server';

export type AuditActorRole = 'creator' | 'advertiser' | 'admin' | 'system';

export interface AuditEventParams {
  profileId: string | null;    // null for system/cron actions
  actorRole: AuditActorRole;
  action: string;              // e.g. 'campaign.featured.toggle', 'submission.status.override'
  targetTable?: string;        // e.g. 'campaigns', 'submissions'
  targetId?: string;           // UUID or ID of the affected row
  details?: string;
  payload?: Record<string, unknown>; // { before: {...}, after: {...} }
  ipAddress?: string | null;
}

export interface AdminAuditParams {
  adminId: string | null;      // null for system/cron actions
  action: string;
  targetTable?: string;
  targetId?: string;
  details?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string | null;
}

export interface CreatorAuditParams {
  creatorId: string;
  action: string;
  actionCategory?: 'account' | 'submission' | 'finance' | 'security';
  targetTable?: string;
  targetId?: string;
  details?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string | null;
}

export interface BrandAuditParams {
  brandId: string;
  action: string;
  actionCategory?: 'campaign' | 'finance' | 'account' | 'security';
  targetTable?: string;
  targetId?: string;
  details?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string | null;
}

/**
 * logAdminAudit()
 * Writes an append-only audit record to the admin_audit_log table.
 */
export async function logAdminAudit(params: AdminAuditParams): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from('admin_audit_log').insert({
      admin_id: params.adminId,
      action: params.action,
      target_table: params.targetTable ?? null,
      target_id: params.targetId ?? null,
      details: params.details ?? null,
      payload: params.payload ?? null,
      ip_address: params.ipAddress ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[audit] Failed to write admin audit event:', params.action, err);
  }
}

/**
 * logCreatorAudit()
 * Writes an append-only user audit record to the creator_audit_log table.
 */
export async function logCreatorAudit(params: CreatorAuditParams): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from('creator_audit_log').insert({
      creator_id: params.creatorId,
      action: params.action,
      action_category: params.actionCategory ?? 'account',
      target_table: params.targetTable ?? null,
      target_id: params.targetId ?? null,
      details: params.details ?? null,
      payload: params.payload ?? null,
      ip_address: params.ipAddress ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[audit] Failed to write creator audit event:', params.action, err);
  }
}

/**
 * logBrandAudit()
 * Writes an append-only user audit record to the brand_audit_log table.
 */
export async function logBrandAudit(params: BrandAuditParams): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from('brand_audit_log').insert({
      brand_id: params.brandId,
      action: params.action,
      action_category: params.actionCategory ?? 'campaign',
      target_table: params.targetTable ?? null,
      target_id: params.targetId ?? null,
      details: params.details ?? null,
      payload: params.payload ?? null,
      ip_address: params.ipAddress ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[audit] Failed to write brand audit event:', params.action, err);
  }
}

/**
 * logAuditEvent()
 * Unified dispatcher that writes to audit_log and dispatches to specific
 * tables (admin_audit_log, creator_audit_log, brand_audit_log).
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    const supabase = createAdminClient();

    // 1. Write to centralized audit_log
    await supabase.from('audit_log').insert({
      profile_id: params.profileId,
      actor_role: params.actorRole,
      action: params.action,
      target_table: params.targetTable ?? null,
      target_id: params.targetId ?? null,
      payload: params.payload ?? null,
      ip_address: params.ipAddress ?? null,
      created_at: new Date().toISOString(),
    });

    // 2. Dispatch to dedicated tables based on actorRole
    if (params.actorRole === 'admin' || params.actorRole === 'system') {
      await logAdminAudit({
        adminId: params.profileId,
        action: params.action,
        targetTable: params.targetTable,
        targetId: params.targetId,
        details: params.details,
        payload: params.payload,
        ipAddress: params.ipAddress,
      });
    } else if (params.actorRole === 'creator' && params.profileId) {
      await logCreatorAudit({
        creatorId: params.profileId,
        action: params.action,
        targetTable: params.targetTable,
        targetId: params.targetId,
        details: params.details,
        payload: params.payload,
        ipAddress: params.ipAddress,
      });
    } else if (params.actorRole === 'advertiser' && params.profileId) {
      await logBrandAudit({
        brandId: params.profileId,
        action: params.action,
        targetTable: params.targetTable,
        targetId: params.targetId,
        details: params.details,
        payload: params.payload,
        ipAddress: params.ipAddress,
      });
    }
  } catch (err) {
    console.error('[audit] Failed to dispatch audit event:', params.action, err);
  }
}

// -------------------------------------------------------
// Pre-defined action constants
// -------------------------------------------------------
export const AUDIT_ACTIONS = {
  // Campaign
  CAMPAIGN_CREATED:          'campaign.created',
  CAMPAIGN_FUNDED:           'campaign.funded',
  CAMPAIGN_PAUSED:           'campaign.paused',
  CAMPAIGN_CANCELLED:        'campaign.cancelled',
  CAMPAIGN_FEATURED_TOGGLE:  'campaign.featured.toggle',
  CAMPAIGN_HERO_PIN_TOGGLE:  'campaign.hero_pin.toggle',
  CAMPAIGN_STATUS_OVERRIDE:  'campaign.status.override',
  CAMPAIGN_CPM_OVERRIDE:     'campaign.cpm.override',

  // Submission
  SUBMISSION_CREATED:        'submission.created',
  SUBMISSION_FORFEITED:      'submission.forfeited',
  SUBMISSION_DELETED:        'submission.deleted',
  SUBMISSION_VERIFIED_PASS:  'submission.verified.pass',
  SUBMISSION_VERIFIED_FAIL:  'submission.verified.fail',
  SUBMISSION_STATUS_OVERRIDE:'submission.status.override',
  SUBMISSION_PAYOUT_RELEASED:'submission.payout.released',

  // Social accounts
  ACCOUNT_CONNECTED:         'social_account.connected',
  ACCOUNT_DISCONNECTED:      'social_account.disconnected',
  ACCOUNT_VERIFIED:          'social_account.verified',

  // Users / profiles
  USER_ADMIN_TOGGLED:        'user.admin.toggled',
  USER_SUSPENDED:            'user.suspended',
  USER_UNSUSPENDED:          'user.unsuspended',
  USER_PROFILE_UPDATED:      'user.profile.updated',

  // Wallet & Finance
  WALLET_FUNDED:             'wallet.funded',
  WALLET_WITHDRAWN:          'wallet.withdrawn',
  PAYOUT_REQUESTED:          'payout.requested',
  PAYOUT_RECEIVED:           'payout.received',

  // System / cron
  CRON_VERIFY_RUN:           'cron.verify_submissions.run',
  CRON_PAYOUT_RUN:           'cron.release_payouts.run',
  CRON_SETTLEMENT_RUN:       'cron.daily_settlement.run',
  CRON_CAMPAIGN_CLOSE:       'cron.campaign.close',
} as const;
