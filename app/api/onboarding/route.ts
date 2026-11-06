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

    // ─── ACTION 0: Resolve Nigerian Bank Account (Paystack NUBAN) ────────────
    if (action === 'resolve-bank') {
      const { bank_code, account_number } = body;
      if (!bank_code || !account_number || !/^\d{10}$/.test(account_number)) {
        return NextResponse.json(
          { error: 'Please enter a valid 10-digit NUBAN account number and select a bank.' },
          { status: 400 }
        );
      }

      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecret) {
        // Fallback demo/sandbox resolution if key isn't configured
        return NextResponse.json({
          success: true,
          account_name: userProfile.profile.full_name || 'Verified Nigerian Account',
        });
      }

      try {
        const res = await fetch(
          `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
          {
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
            },
            signal: AbortSignal.timeout(8000),
          }
        );
        const json = await res.json();
        if (!json.status || !json.data?.account_name) {
          return NextResponse.json(
            { error: json.message || 'Could not verify account name for this bank.' },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, account_name: json.data.account_name });
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message || 'Bank resolution timed out. Please try again.' },
          { status: 500 }
        );
      }
    }

    // ─── ACTION 1: Role Selection ────────────────────────────────────────────
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

      // Pre-provision role profile and wallet immediately
      if (role === 'creator' || role === 'both') {
        await supabase
          .from('creator_profiles')
          .upsert(
            {
              profile_id: profileId,
              display_name: userProfile.profile.full_name || 'Creator',
            },
            { onConflict: 'profile_id' }
          );

        const { data: existingW } = await supabase
          .from('wallets')
          .select('id')
          .eq('profile_id', profileId)
          .eq('wallet_type', 'creator_earnings')
          .maybeSingle();

        if (!existingW) {
          await supabase
            .from('wallets')
            .insert({
              profile_id: profileId,
              wallet_type: 'creator_earnings',
              balance: 0,
            });
        }
      }

      if (role === 'advertiser' || role === 'both') {
        await supabase
          .from('advertiser_profiles')
          .upsert(
            {
              profile_id: profileId,
              company_name: userProfile.profile.full_name || 'Advertiser Brand',
              billing_email: userProfile.profile.email,
            },
            { onConflict: 'profile_id' }
          );

        const { data: existingW } = await supabase
          .from('wallets')
          .select('id')
          .eq('profile_id', profileId)
          .eq('wallet_type', 'advertiser_budget')
          .maybeSingle();

        if (!existingW) {
          await supabase
            .from('wallets')
            .insert({
              profile_id: profileId,
              wallet_type: 'advertiser_budget',
              balance: 0,
            });
        }
      }

      return NextResponse.json({ success: true, role });
    }

    // ─── ACTION 2: Complete Advertiser Profile ───────────────────────────────
    if (action === 'complete-advertiser') {
      const {
        company_name,
        company_website,
        industry,
        company_logo_url,
        agreed_global_rules,
        billing_email,
        campaign_goals,
        estimated_budget,
      } = body;

      const finalCompanyName = company_name || userProfile.profile.full_name || 'Brand';
      const finalBillingEmail = billing_email || userProfile.profile.email;

      if (!finalCompanyName) {
        return NextResponse.json({ error: 'Company or Brand name is required' }, { status: 400 });
      }

      if (!agreed_global_rules) {
        return NextResponse.json({ error: 'You must agree to platform rules to continue' }, { status: 400 });
      }

      // Update role & avatar on profile
      await supabase
        .from('profiles')
        .update({
          role: 'advertiser',
          ...(company_logo_url ? { avatar_url: company_logo_url } : {}),
          onboarding_tour_completed: false,
          onboarding_checklist_state: {
            advertiser_profile: true,
            advertiser_settings: true,
            campaign_goals: campaign_goals || 'brand_reach',
            estimated_budget: estimated_budget || 'medium',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      // Insert/update advertiser_profiles
      const { error: advError } = await supabase
        .from('advertiser_profiles')
        .upsert(
          {
            profile_id: profileId,
            company_name: finalCompanyName,
            company_website: company_website || null,
            industry: industry || 'E-commerce & Retail',
            company_logo_url: company_logo_url || null,
            billing_email: finalBillingEmail,
            agreed_global_rules_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id' }
        );

      if (advError) {
        return NextResponse.json({ error: advError.message }, { status: 500 });
      }

      // Initialize advertiser wallet if missing
      const { data: existingAdvW } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', profileId)
        .eq('wallet_type', 'advertiser_budget')
        .maybeSingle();

      if (!existingAdvW) {
        await supabase
          .from('wallets')
          .insert({
            profile_id: profileId,
            wallet_type: 'advertiser_budget',
            balance: 0,
          });
      }

      // Trigger Advertiser Welcome Notifications
      const { notifyAdvertiserWelcome } = await import('@/lib/notifications/advertiser');
      notifyAdvertiserWelcome({
        clerkId: userProfile.profile.clerk_id,
        email: finalBillingEmail,
        companyName: finalCompanyName,
        profileId,
      }).catch(err => console.error('[Onboarding] Error sending advertiser welcome notification:', err));

      return NextResponse.json({ success: true, redirect: '/b/dashboard' });
    }

    // ─── ACTION 3: Complete Creator Profile ──────────────────────────────────
    if (action === 'complete-creator') {
      const {
        display_name,
        bio,
        avatar_url,
        niche_categories,
        channels,
        bank_details,
      } = body;

      const finalDisplayName = display_name || userProfile.profile.full_name || 'Creator';

      // Update role & avatar on profile
      await supabase
        .from('profiles')
        .update({
          role: 'creator',
          full_name: finalDisplayName,
          ...(avatar_url ? { avatar_url } : {}),
          onboarding_tour_completed: false,
          onboarding_checklist_state: {
            creator_profile: true,
            creator_social: Array.isArray(channels) && channels.length > 0,
            creator_bank: Boolean(bank_details?.account_number),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      // Insert/update creator_profiles
      const { error: creatorError } = await supabase
        .from('creator_profiles')
        .upsert(
          {
            profile_id: profileId,
            display_name: finalDisplayName,
            bio: bio || null,
            ...(avatar_url ? { avatar_url } : {}),
            niche_categories: Array.isArray(niche_categories) ? niche_categories : [],
            ...(bank_details?.account_number
              ? {
                  paystack_recipient_code: JSON.stringify(bank_details),
                  bank_account_number: bank_details.account_number,
                  bank_code: bank_details.bank_code,
                  bank_name: bank_details.bank_name || 'Bank',
                }
              : {}),
          },
          { onConflict: 'profile_id' }
        );

      if (creatorError) {
        return NextResponse.json({ error: creatorError.message }, { status: 500 });
      }

      // If bank details were provided, persist to bank_accounts table
      if (bank_details && bank_details.bank_code && bank_details.account_number) {
        await supabase.from('bank_accounts').upsert(
          {
            profile_id: profileId,
            bank_name: bank_details.bank_name || 'Bank',
            bank_code: bank_details.bank_code,
            account_number: bank_details.account_number,
            account_name: bank_details.account_name || finalDisplayName,
            is_primary: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id,account_number,bank_code' }
        );
      }

      // Initialize creator wallet if missing
      const { data: existingCpW } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', profileId)
        .eq('wallet_type', 'creator_earnings')
        .maybeSingle();

      if (!existingCpW) {
        await supabase
          .from('wallets')
          .insert({
            profile_id: profileId,
            wallet_type: 'creator_earnings',
            balance: 0,
          });
      }

      // Trigger async vector embedding sync for creator matching
      import('@/lib/ai/embeddings').then(({ syncCreatorProfileEmbedding }) => {
        syncCreatorProfileEmbedding(profileId).catch((err) =>
          console.error('[Onboarding API] Creator embedding sync error:', err)
        );
      });

      // Trigger Creator Welcome Notifications
      const { notifyCreatorWelcome } = await import('@/lib/notifications/creator');
      notifyCreatorWelcome({
        clerkId: userProfile.profile.clerk_id,
        email: userProfile.profile.email,
        name: finalDisplayName,
        profileId,
      }).catch(err => console.error('[Onboarding] Error sending creator welcome notification:', err));

      return NextResponse.json({ success: true, redirect: '/c/dashboard' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[Onboarding API] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
