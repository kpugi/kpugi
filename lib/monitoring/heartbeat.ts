/**
 * Better Stack Heartbeat Ping Helper
 * 
 * Sends a lightweight GET ping to Better Stack when scheduled cron jobs succeed.
 * Uses strict timeouts and silently catches errors so that monitoring never
 * disrupts core transactional business logic.
 */

export async function sendHeartbeat(heartbeatUrl?: string | null): Promise<void> {
  if (!heartbeatUrl) {
    return;
  }

  try {
    const res = await fetch(heartbeatUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Kpugi-Cron-Heartbeat/1.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`[BetterStack Heartbeat] Ping returned status ${res.status}`);
    }
  } catch (err: any) {
    // Silently log and do not throw to protect cron execution
    console.warn('[BetterStack Heartbeat] Ping error:', err?.message || err);
  }
}
