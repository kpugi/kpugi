import { NextResponse } from 'next/server';
import {
  verifyDiditWebhookSignature,
  extractDecisionWarnings,
} from '@/lib/didit/webhook';
import { createAdminClient } from '@/lib/supabase/server';
import { redis, isRedisConfigured } from '@/lib/redis/client';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let rawBody = '';

  try {
    // 1. Read raw body as text — NEVER parse JSON before signature verification
    rawBody = await req.text();

    // 2. Verify signature & signed body timestamp freshness
    const verifyResult = verifyDiditWebhookSignature({
      rawBody,
      headers: req.headers,
    });

    if (!verifyResult.isValid) {
      console.warn('[Didit Webhook] Verification failed:', verifyResult.error, {
        rawSnippet: rawBody.slice(0, 150),
        hasSigV2: Boolean(req.headers.get('x-signature-v2')),
        hasSigRaw: Boolean(req.headers.get('x-signature') || req.headers.get('x-didit-signature')),
        hasSigSimple: Boolean(req.headers.get('x-signature-simple')),
      });

      return NextResponse.json(
        { error: verifyResult.error || 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = verifyResult.payload || {};
    const webhookType = payload.webhook_type || 'status.updated';
    const status = payload.status || '';
    const sessionId = payload.session_id || payload.sessionId || null;
    const vendorData = payload.vendor_data || payload.vendorData || null;
    const eventId =
      payload.event_id ||
      `${sessionId || 'sess'}:${status || 'stat'}:${webhookType}:${payload.timestamp || Date.now()}`;

    // 3. Deduplication & Idempotency: Atomic store check (Redis)
    if (isRedisConfigured && redis) {
      try {
        const lockAcquired = await redis.set(`didit_evt:${eventId}`, '1', {
          nx: true,
          ex: 86400 * 7, // 7 days TTL
        });

        if (!lockAcquired) {
          console.log(`[Didit Webhook] Duplicate event dropped via Redis: ${eventId}`);
          return NextResponse.json({
            received: true,
            deduplicated: true,
            event_id: eventId,
          });
        }
      } catch (redisErr) {
        console.warn('[Didit Webhook] Redis deduplication warning:', redisErr);
      }
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const decision = payload.decision || {};
    const warnings = extractDecisionWarnings(decision);

    // 4. Deduplication & Idempotency: Durable store check (Postgres didit_webhook_events)
    try {
      const { error: insertErr } = await supabase
        .from('didit_webhook_events')
        .insert({
          event_id: eventId,
          session_id: sessionId,
          business_session_id: payload.business_session_id || null,
          session_kind: payload.session_kind || null,
          webhook_type: webhookType,
          status: status || null,
          vendor_data: vendorData,
          payload: payload,
          processed: true,
        });

      if (insertErr && insertErr.code === '23505') {
        // Unique constraint violation on event_id → already processed
        console.log(`[Didit Webhook] Duplicate event dropped via Postgres: ${eventId}`);
        return NextResponse.json({
          received: true,
          deduplicated: true,
          event_id: eventId,
        });
      }
    } catch {
      // Table might not be migrated yet; execution continues safely
    }

    // 5. Map Didit verification status to Kpugi creator KYC status
    let kycStatus: 'verified' | 'rejected' | 'pending' | 'unverified' = 'unverified';
    switch (status) {
      case 'Approved':
        kycStatus = 'verified';
        break;
      case 'Declined':
        kycStatus = 'rejected';
        break;
      case 'In Review':
      case 'In Progress':
      case 'Resubmitted':
        kycStatus = 'pending';
        break;
      case 'Abandoned':
      case 'Expired':
      case 'KYC Expired':
      case 'Not Started':
      default:
        // Handle variations gracefully
        if (typeof status === 'string') {
          const lower = status.toLowerCase();
          if (lower.includes('approve') || lower.includes('pass') || lower === 'verified') {
            kycStatus = 'verified';
          } else if (lower.includes('reject') || lower.includes('decline') || lower === 'fail') {
            kycStatus = 'rejected';
          } else if (lower.includes('review') || lower.includes('progress')) {
            kycStatus = 'pending';
          }
        }
        break;
    }

    // 6. Update user / creator verification state
    if (vendorData || sessionId) {
      const updatePayload: Record<string, any> = {
        kyc_status: kycStatus,
      };

      if (kycStatus === 'verified') {
        updatePayload.kyc_verified_at = now;
      }
      if (sessionId) {
        updatePayload.kyc_didit_session_id = sessionId;
      }

      // Safe update attempts: first try with decision JSON columns, fallback if not migrated
      try {
        const enrichedPayload = {
          ...updatePayload,
          kyc_decision: decision,
          kyc_decision_warnings: warnings.length > 0 ? warnings : null,
        };

        if (vendorData) {
          const { error } = await supabase
            .from('creator_profiles')
            .update(enrichedPayload)
            .or(`profile_id.eq.${vendorData}`);

          if (error) throw error;
        } else if (sessionId) {
          const { error } = await supabase
            .from('creator_profiles')
            .update(enrichedPayload)
            .eq('kyc_didit_session_id', sessionId);

          if (error) throw error;
        }
      } catch {
        // Fallback to base columns if decision jsonb columns don't exist yet
        if (vendorData) {
          await supabase
            .from('creator_profiles')
            .update(updatePayload)
            .or(`profile_id.eq.${vendorData}`);
        } else if (sessionId) {
          await supabase
            .from('creator_profiles')
            .update(updatePayload)
            .eq('kyc_didit_session_id', sessionId);
        }
      }
    }

    // 7. Platform Audit Log entry
    try {
      await supabase.from('audit_log').insert({
        actor_role: 'system',
        action: `didit.webhook.${webhookType}`,
        target_table: 'creator_profiles',
        target_id: vendorData || null,
        payload: {
          event_id: eventId,
          session_id: sessionId,
          status,
          kyc_status: kycStatus,
          warnings,
          webhook_type: webhookType,
        },
      });
    } catch {
      // Non-critical audit logging failure ignored
    }

    // 8. Return 2xx immediately
    return NextResponse.json({
      received: true,
      event_id: eventId,
      status: kycStatus,
      webhook_type: webhookType,
    });
  } catch (error: any) {
    console.error('[Didit Webhook Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
