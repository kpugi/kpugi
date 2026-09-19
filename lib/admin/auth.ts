import { auth } from '@clerk/nextjs/server';
import { createUserScopedClient } from '@/lib/supabase/user-scoped';

/**
 * requireAdminSession()
 *
 * Server-side guard for all admin Server Actions and Route Handlers.
 * - Gets the Clerk session token
 * - Creates a user-scoped Supabase client (JWT forwarded to Postgres)
 * - Runs a query gated by is_admin() RLS — if the user is not an admin,
 *   Postgres returns nothing and we throw a 403
 *
 * Usage:
 *   const { supabase, profileId } = await requireAdminSession();
 *   // supabase is already scoped to this admin user — all queries go through RLS
 */
export async function requireAdminSession() {
  const { userId, getToken } = await auth();

  if (!userId) {
    throw new Error('UNAUTHORIZED: No active session');
  }

  let token: string | null = null;
  try {
    token = await getToken({ template: 'supabase' });
  } catch {
    // Template 'supabase' may not be configured in Clerk Dashboard
  }

  if (!token) {
    token = await getToken();
  }

  if (!token) {
    throw new Error('UNAUTHORIZED: Could not retrieve session token from Clerk');
  }

  const supabase = createUserScopedClient(token);

  // Verify admin status via live DB check (is_admin() RLS function)
  // If user is not admin, profiles query returns nothing → throws 403
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin, role, full_name, email')
    .eq('clerk_id', userId)
    .single();

  if (error || !profile) {
    throw new Error('FORBIDDEN: Profile not found');
  }

  if (!profile.is_admin) {
    throw new Error('FORBIDDEN: Admin access required');
  }

  return {
    supabase,
    profileId: profile.id as string,
    profile: profile as {
      id: string;
      is_admin: boolean;
      role: string;
      full_name: string | null;
      email: string;
    },
  };
}

/**
 * getAdminSessionSafe()
 * Non-throwing version for UI components/layouts to gracefully render access-denied screens
 */
export async function getAdminSessionSafe() {
  try {
    const session = await requireAdminSession();
    return { session, error: null };
  } catch (err: any) {
    return { session: null, error: (err?.message as string) || 'Authentication failed' };
  }
}

