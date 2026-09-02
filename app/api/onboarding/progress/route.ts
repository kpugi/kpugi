import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const profileId = userProfile.profile.id;
    const role = userProfile.role;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, onboarding_tour_completed, onboarding_tour_dismissed_at, onboarding_checklist_state')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('[Onboarding Progress GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Evaluate live dynamic state from the database
    const dynamicChecklist: Record<string, boolean> = {
      ...(profile?.onboarding_checklist_state || {}),
    };

    if (role === 'creator') {
      // 1. Profile is created
      dynamicChecklist.creator_profile = true;

      // 2. Check connected social accounts
      const { count: socialCount } = await supabase
        .from('social_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', profileId)
        .is('revoked_at', null);

      if ((socialCount || 0) > 0) {
        dynamicChecklist.creator_social = true;
      }

      // 3. Check bank account details (in bank_accounts or creator_profiles)
      const [bankAccountsRes, creatorProfileRes] = await Promise.all([
        supabase
          .from('bank_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', profileId),
        supabase
          .from('creator_profiles')
          .select('paystack_recipient_code')
          .eq('profile_id', profileId)
          .maybeSingle(),
      ]);

      const hasBank =
        (bankAccountsRes.count && bankAccountsRes.count > 0) ||
        Boolean(creatorProfileRes.data?.paystack_recipient_code);

      if (hasBank) {
        dynamicChecklist.creator_bank = true;
      }

      // 4. Check submissions / joined campaigns
      const { count: subCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', profileId);

      if ((subCount || 0) > 0) {
        dynamicChecklist.creator_browse = true;
        dynamicChecklist.creator_first_submission = true;
      }
    } else if (role === 'advertiser') {
      // 1. Brand profile created
      dynamicChecklist.advertiser_profile = true;

      // 2. Check advertiser settings (website / billing email)
      const { data: aProfile } = await supabase
        .from('advertiser_profiles')
        .select('company_website, billing_email')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (Boolean(aProfile?.company_website || aProfile?.billing_email)) {
        dynamicChecklist.advertiser_settings = true;
      }

      // 3. Check wallet balance or funding
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (Number(walletData?.balance || 0) > 0) {
        dynamicChecklist.advertiser_wallet = true;
      }

      // 4. Check campaigns created
      const { count: campCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('advertiser_id', profileId);

      if ((campCount || 0) > 0) {
        dynamicChecklist.advertiser_create_campaign = true;
      }

      // 5. Check submissions on advertiser's campaigns
      const { data: userCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('advertiser_id', profileId);

      if (userCampaigns && userCampaigns.length > 0) {
        const campaignIds = userCampaigns.map((c) => c.id);
        const { count: subCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .in('campaign_id', campaignIds);

        if ((subCount || 0) > 0) {
          dynamicChecklist.advertiser_review_posts = true;
        }
      }
    }

    return NextResponse.json({
      onboarding_tour_completed: !!profile?.onboarding_tour_completed,
      onboarding_tour_dismissed_at: profile?.onboarding_tour_dismissed_at,
      onboarding_checklist_dismissed: !!profile?.onboarding_checklist_state?.dismissed,
      onboarding_checklist_state: dynamicChecklist,
    });
  } catch (err: any) {
    console.error('[Onboarding Progress GET] Server error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, stepId, completed, checklistState } = body;
    const supabase = createAdminClient();
    const profileId = userProfile.profile.id;

    if (action === 'complete-tour') {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_tour_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (error) throw error;
      return NextResponse.json({ success: true, onboarding_tour_completed: true });
    }

    if (action === 'dismiss-tour') {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_tour_dismissed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (error) throw error;
      return NextResponse.json({ success: true, dismissed: true });
    }

    if (action === 'dismiss-checklist') {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('onboarding_checklist_state')
        .eq('id', profileId)
        .single();

      const currentState = currentProfile?.onboarding_checklist_state || {};
      const updatedState = {
        ...currentState,
        dismissed: true,
        dismissed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_checklist_state: updatedState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (error) throw error;
      return NextResponse.json({ success: true, dismissed: true });
    }

    if (action === 'update-checklist-step') {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('onboarding_checklist_state')
        .eq('id', profileId)
        .single();

      const currentState = currentProfile?.onboarding_checklist_state || {};
      const updatedState = {
        ...currentState,
        ...(stepId ? { [stepId]: completed !== undefined ? completed : true } : checklistState || {}),
        last_updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_checklist_state: updatedState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (error) throw error;
      return NextResponse.json({ success: true, onboarding_checklist_state: updatedState });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[Onboarding Progress POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
