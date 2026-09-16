import { NextResponse } from 'next/server';
import { sendHeartbeat } from '@/lib/monitoring/heartbeat';
import { verifyCronRequest } from '@/lib/auth/cron-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authResult = verifyCronRequest(request);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  // Ping Better Stack Heartbeat on successful campaign expiration check
  await sendHeartbeat(process.env.BETTERSTACK_HEARTBEAT_CLOSE_CAMPAIGNS);

  return NextResponse.json({ success: true, closedCampaigns: 0 });
}
