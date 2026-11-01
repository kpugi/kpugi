import { POST as diditWebhookHandler } from '@/app/api/webhooks/didit/route';

export const runtime = 'nodejs';

/**
 * Legacy webhook endpoint alias: delegates directly to /api/webhooks/didit.
 * Ensures zero downtime for destinations configured with the legacy path.
 */
export async function POST(req: Request) {
  return diditWebhookHandler(req);
}
