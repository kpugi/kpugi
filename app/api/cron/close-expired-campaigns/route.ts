import { NextResponse } from 'next/server';
import { sendHeartbeat } from '@/lib/monitoring/heartbeat';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    const url = new URL(request.url);
    const queryKey = url.searchParams.get('key');
    if (!cronSecret || queryKey !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Ping Better Stack Heartbeat on successful campaign expiration check
  await sendHeartbeat(process.env.BETTERSTACK_HEARTBEAT_CLOSE_CAMPAIGNS);

  return NextResponse.json({ success: true, closedCampaigns: 0 });
}
