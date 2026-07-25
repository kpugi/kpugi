import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return NextResponse.json({ error: 'Unauthorized or profile missing' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const supabase = createAdminClient();
    const profileId = userProfile.profile.id;

    // ACTION 1: Role Selection
    if (action === 'set-role') {
      const { role } = body;
      if (role !== 'advertiser' && role !== 'creator' && role !== 'both') {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', profileId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, role });
    }

    // ACTION 2: Complete Advertiser Profile
    if (action === 'complete-advertiser') {
      const { company_name, company_website, billing_email, agreed_global_rules } = body;

      if (!company_name || !billing_email) {
        return NextResponse.json({ error: 'Company name and billing email are required' }, { status: 400 });
      }

      if (!agreed_global_rules) {
        return NextResponse.json({ error: 'You must agree to platform rules to continue' }, { status: 400 });
      }

      // Update role on profile
      await supabase
        .from('profiles')
        .update({ role: 'advertiser', updated_at: new Date().toISOString() })
        .eq('id', profileId);

      // Insert/update advertiser_profiles
      const { error: advError } = await supabase
        .from('advertiser_profiles')
        .upsert(
          {
            profile_id: profileId,
            company_name,
            company_website: company_website || null,
            billing_email,
            agreed_global_rules_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id' }
        );

      if (advError) {
        return NextResponse.json({ error: advError.message }, { status: 500 });
      }

      // Initialize wallet row if wallets table exists
      try {
        await supabase
          .from('wallets')
          .upsert(
            {
              owner_id: profileId,
              owner_type: 'advertiser',
              balance: 0,
            },
            { onConflict: 'owner_id,owner_type' }
          );
      } catch (e) {
        // Safe fallback if wallets table is created in later phase
      }

      return NextResponse.json({ success: true, redirect: '/dashboard' });
    }

    // ACTION 3: Complete Creator Profile
    if (action === 'complete-creator') {
      const { display_name, bio } = body;

      // Update role on profile
      await supabase
        .from('profiles')
        .update({ role: 'creator', updated_at: new Date().toISOString() })
        .eq('id', profileId);

      // Insert/update creator_profiles
      const { error: creatorError } = await supabase
        .from('creator_profiles')
        .upsert(
          {
            profile_id: profileId,
            display_name: display_name || userProfile.profile.full_name || 'Creator',
            bio: bio || null,
          },
          { onConflict: 'profile_id' }
        );

      if (creatorError) {
        return NextResponse.json({ error: creatorError.message }, { status: 500 });
      }

      // Initialize wallet row if wallets table exists
      try {
        await supabase
          .from('wallets')
          .upsert(
            {
              owner_id: profileId,
              owner_type: 'creator',
              balance: 0,
            },
            { onConflict: 'owner_id,owner_type' }
          );
      } catch (e) {
        // Safe fallback if wallets table is created in later phase
      }

      return NextResponse.json({ success: true, redirect: '/dashboard' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[Onboarding API] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
