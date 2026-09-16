import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';

export type RequiredRole = 'advertiser' | 'creator' | 'any';

export interface AuthGuardResult {
  authorized: boolean;
  response?: NextResponse;
  profile?: any;
  creatorProfile?: any;
  advertiserProfile?: any;
  userId?: string;
}

/**
 * Standardized API Route authentication and authorization guard.
 * Validates active Clerk session, loads Supabase profile, and enforces role constraints.
 * Prevents Broken Object-Level Authorization (BOLA/IDOR) by providing the verified user profile.
 */
export async function requireAuthProfile(
  requiredRole: RequiredRole = 'any'
): Promise<AuthGuardResult> {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized: Active user session required' },
          { status: 401 }
        ),
      };
    }

    const { profile, creatorProfile, advertiserProfile } = userProfile;

    if (requiredRole === 'advertiser') {
      if (profile.role !== 'advertiser' && !advertiserProfile) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'Forbidden: Advertiser privileges required' },
            { status: 403 }
          ),
        };
      }
    }

    if (requiredRole === 'creator') {
      if (profile.role !== 'creator' && !creatorProfile) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'Forbidden: Creator privileges required' },
            { status: 403 }
          ),
        };
      }
    }

    return {
      authorized: true,
      profile,
      creatorProfile,
      advertiserProfile,
      userId: profile.clerk_id,
    };
  } catch (error: any) {
    console.error('[requireAuthProfile] Error authenticating request:', error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      ),
    };
  }
}
