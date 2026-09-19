import { createClient } from '@supabase/supabase-js';

/**
 * Creates a user-scoped Supabase client that forwards the Clerk JWT
 * to Postgres so RLS policies (including is_admin()) apply correctly.
 *
 * Use this for ALL admin console operations — NOT the service-role client.
 * The service-role client bypasses RLS and should only be used in cron/webhooks.
 */
export function createUserScopedClient(clerkToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
