/**
 * POST /api/verify/social/start
 *
 * Initiates the profile verification for a social account handle.
 * Creates or updates the social_accounts record with status 'pending'
 * and generates a unique verification code.
 *
 * Body: { platform: string, handle: string }
 * Returns: { code: string, instructions: string, expiresAt: string }
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { randomBytes } from 'crypto';

function generateVerificationCode(): string {
  return `kpugi-${randomBytes(5).toString('hex')}`;
}

export async function POST(request: Request) {
  try {
    const { platform, handle } = await request.json();

    if (!platform || !handle) {
      return NextResponse.json({ error: 'platform and handle are required' }, { status: 400 });
    }

    const userProfile = await getOrCreateUserProfile();
    if (!userProfile?.profile?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Resolve platform key
    const platformKey = platform.toLowerCase() === 'twitter' ? 'x' : platform.toLowerCase();
    const cleanHandle = handle.trim().replace(/^@/, '').replace(/^https?:\/\/[^\/]+\//, '').toLowerCase();

    if (!cleanHandle) {
      return NextResponse.json({ error: 'Please enter a valid handle' }, { status: 400 });
    }

    // Check if handle is already verified by another user
    const { data: existingOther } = await supabase
      .from('social_accounts')
      .select('id, creator_id')
      .eq('platform', platformKey)
      .ilike('handle', cleanHandle)
      .eq('verification_status', 'verified')
      .neq('creator_id', userProfile.profile.id)
      .maybeSingle();

    if (existingOther) {
      return NextResponse.json(
        { error: 'This handle is already verified by another creator.' },
        { status: 409 }
      );
    }

    // Find if current user already has this platform + handle record
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id, verification_status')
      .eq('creator_id', userProfile.profile.id)
      .eq('platform', platformKey)
      .ilike('handle', cleanHandle)
      .maybeSingle();

    if (existingAccount && existingAccount.verification_status === 'verified') {
      return NextResponse.json({ error: 'This account is already verified.' }, { status: 409 });
    }

    // Generate short, unique verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    if (existingAccount) {
      // Update existing record with new verification code
      await supabase
        .from('social_accounts')
        .update({
          verification_code: code,
          verification_code_expires_at: expiresAt,
          verification_method: 'code_in_bio',
          verification_status: 'pending',
        })
        .eq('id', existingAccount.id);
    } else {
      // Insert new pending social account record
      await supabase.from('social_accounts').insert({
        creator_id: userProfile.profile.id,
        platform: platformKey,
        handle: cleanHandle,
        platform_user_id: cleanHandle,
        verification_code: code,
        verification_code_expires_at: expiresAt,
        verification_method: 'code_in_bio',
        verification_status: 'pending',
        connected_at: new Date().toISOString(),
      });
    }

    // Platform-specific instructions
    const instructions: Record<string, string> = {
      x: `Go to your X profile → Edit Profile → add "${code}" anywhere in your bio → Save → click Verify Account.`,
      twitter: `Go to your X profile → Edit Profile → add "${code}" anywhere in your bio → Save → click Verify Account.`,
      tiktok: `Go to your TikTok profile → Edit Profile → add "${code}" anywhere in your bio → Save → click Verify Account.`,
      instagram: `Go to your Instagram profile → Edit Profile → add "${code}" anywhere in your bio → Save → click Verify Account.`,
      youtube: `Go to YouTube Studio → Customization → Basic Info → add "${code}" to your channel description → Publish → click Verify Account.`,
      facebook: `Go to your Facebook profile → Edit Details → add "${code}" to your bio → Save → click Verify Account.`,
      linkedin: `Go to your LinkedIn profile → Edit intro → add "${code}" to your headline or summary → Save → click Verify Account.`,
    };

    return NextResponse.json({
      code,
      expiresAt,
      instructions: instructions[platformKey] || `Add "${code}" to your bio and click Verify Account.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to start verification' }, { status: 500 });
  }
}
