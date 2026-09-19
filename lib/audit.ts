import { createAdminClient } from '@/lib/supabase/server';

export type AuditActorRole = 'creator' | 'advertiser' | 'admin' | 'system';

export interface AuditEventParams {
  profileId: string | null;    // null for system/cron actions
  actorRole: AuditActorRole;
  action: string;              // e.g. 'campaign.featured.toggle', 'submission.status.override'
  targetTable?: string;        // e.g. 'campaigns', 'submissions'
  targetId?: string;           // UUID of the affected row
  payload?: Record<string, unknown>; // { before: {...}, after: {...} }
  ipAddress?: string | null;
}

/**
 * logAuditEvent()
 *
 * Platform-wide audit logger. Writes to the append-only audit_log table.
 * Uses the service-role client so it always succeeds regardless of RLS.
 *
 * This should be called after EVERY significant user or system action:
 *   - Creator: submit post, forfeit, connect/disconnect account
 *   - Advertiser: create campaign, fund wallet, cancel campaign
 *   - Admin: toggle featured, override submission, suspend user
 *   - System: auto-verify, release payout, close expired campaign
 *
 * Usage:
 *   await logAuditEvent({
 *     profileId: session.userId,
 *     actorRole: 'admin',
 *     action: 'campaign.featured.toggle',
 *     targetTable: 'campaigns',
 *     targetId: campaignId,
 *     payload: { before: { is_featured: false }, after: { is_featured: true } },
 *     ipAddress: req.headers.get('x-forwarded-for'),
 *   });
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    const supabase = createAdminClient();

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
  } catch (err) {
    // Audit log failures must NEVER crash the main request.
    // Log to console for monitoring but swallow the error.
    console.error('[audit] Failed to write audit event:', params.action, err);
  }
}

// -------------------------------------------------------
// Pre-defined action constants (prevents typos across codebase)
// -------------------------------------------------------
export const AUDIT_ACTIONS = {
  // Campaign
  CAMPAIGN_CREATED:          'campaign.created',
  CAMPAIGN_FUNDED:           'campaign.funded',
  CAMPAIGN_CANCELLED:        'campaign.cancelled',
  CAMPAIGN_FEATURED_TOGGLE:  'campaign.featured.toggle',
  CAMPAIGN_HERO_PIN_TOGGLE:  'campaign.hero_pin.toggle',
  CAMPAIGN_STATUS_OVERRIDE:  'campaign.status.override',
  CAMPAIGN_CPM_OVERRIDE:     'campaign.cpm.override',

  // Submission
  SUBMISSION_CREATED:        'submission.created',
  SUBMISSION_FORFEITED:      'submission.forfeited',
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

  // Wallet
  WALLET_FUNDED:             'wallet.funded',
  WALLET_WITHDRAWN:          'wallet.withdrawn',

  // System / cron
  CRON_VERIFY_RUN:           'cron.verify_submissions.run',
  CRON_PAYOUT_RUN:           'cron.release_payouts.run',
  CRON_SETTLEMENT_RUN:       'cron.daily_settlement.run',
  CRON_CAMPAIGN_CLOSE:       'cron.campaign.close',
} as const;
