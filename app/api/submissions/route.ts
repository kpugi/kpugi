import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { calculateBudgetReservation } from '@/lib/utils/budget';
import { validatePostUrlOwnership } from '@/lib/utils/social-url';

export async function GET() {
  return NextResponse.json({ submissions: [] });
}

export async function POST(req: Request) {
  try {
    const userProfile = await getOrCreateUserProfile();
    if (!userProfile || !userProfile.profile || !userProfile.creatorProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action = 'join', campaignId, socialAccountId, postUrl, screenshotUrl } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // ─────────────────────────────────────────────────────
    // ACTION: JOIN CAMPAIGN (Step 1)
    // ─────────────────────────────────────────────────────
    if (action === 'join') {
      if (!socialAccountId) {
        return NextResponse.json({ error: 'Missing socialAccountId' }, { status: 400 });
      }

      // Check if creator already has a submission/joined record for this campaign
      const { data: existingSub } = await supabase
        .from('submissions')
        .select('id, status')
        .eq('campaign_id', campaignId)
        .eq('creator_id', userProfile.profile.id)
        .maybeSingle();

      if (existingSub) {
        return NextResponse.json({ 
          error: `You have already ${existingSub.status === 'joined' ? 'joined' : 'submitted a link for'} this campaign` 
        }, { status: 400 });
      }

      // 1. Fetch Campaign and lock/verify budget
      const { data: campaign, error: campErr } = await supabase
        .from('campaigns')
        .select('id, title, advertiser_id, cpm_rate, total_budget, reserved_budget, spent_budget, status')
        .eq('id', campaignId)
        .single();

      if (campErr || !campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      if (campaign.status !== 'live') {
        return NextResponse.json({ error: 'Campaign is not currently active' }, { status: 400 });
      }

      // 2. Fetch Creator Social Account and verify connection
      const { data: socialAccount, error: accErr } = await supabase
        .from('social_accounts')
        .select('id, platform, follower_count')
        .eq('id', socialAccountId)
        .eq('creator_id', userProfile.profile.id)
        .single();

      if (accErr || !socialAccount) {
        return NextResponse.json({ error: 'Social account not found or unauthorized' }, { status: 404 });
      }

      // 3. Payout Reservation estimation
      const remainingBudget = Number(campaign.total_budget) - Number(campaign.reserved_budget);
      if (remainingBudget <= 0) {
        return NextResponse.json({ error: 'Campaign budget is fully reserved or completed' }, { status: 400 });
      }

      const reservedAmount = calculateBudgetReservation(
        socialAccount.follower_count || 5000,
        Number(campaign.cpm_rate),
        remainingBudget
      );

      if (reservedAmount <= 0) {
        return NextResponse.json({ error: 'Insufficient campaign budget remaining' }, { status: 400 });
      }

      // 4. Update campaign reserved budget and create submission record in joined state
      const { error: updateErr } = await supabase
        .from('campaigns')
        .update({
          reserved_budget: Number(campaign.reserved_budget) + reservedAmount,
        })
        .eq('id', campaignId);

      if (updateErr) {
        console.error('[Submissions API] Error updating campaign budget:', updateErr);
        return NextResponse.json({ error: 'Failed to reserve campaign budget' }, { status: 500 });
      }

      const { data: submission, error: subErr } = await supabase
        .from('submissions')
        .insert({
          campaign_id: campaignId,
          creator_id: userProfile.profile.id,
          social_account_id: socialAccountId,
          post_url: null,
          screenshot_url: null,
          reserved_amount: reservedAmount,
          status: 'joined',
        })
        .select('*')
        .single();

      if (subErr) {
        console.error('[Submissions API] Error inserting submission:', subErr);
        // Rollback budget reservation
        await supabase
          .from('campaigns')
          .update({
            reserved_budget: Number(campaign.reserved_budget),
          })
          .eq('id', campaignId);

        return NextResponse.json({ error: 'Failed to create join record' }, { status: 500 });
      }

      // Trigger Join Notifications (Creator + Advertiser)
      const { notifyCreatorJoinedCampaign, notifyAdvertiserCreatorJoined } = await import('@/lib/notifications');
      
      notifyCreatorJoinedCampaign({
        clerkId: userProfile.profile.clerk_id,
        campaignTitle: campaign.title || 'Campaign',
        reservedAmount,
        campaignId: campaign.id,
        profileId: userProfile.profile.id,
      }).catch(err => console.error('[Submissions API] Creator join notify error:', err));

      // Fetch campaign advertiser for notification
      if (campaign.advertiser_id) {
        supabase
          .from('profiles')
          .select('clerk_id, email')
          .eq('id', campaign.advertiser_id)
          .maybeSingle()
          .then(({ data: advProfile }) => {
            if (advProfile) {
              notifyAdvertiserCreatorJoined({
                clerkId: advProfile.clerk_id,
                creatorHandle: userProfile.creatorProfile?.display_name || userProfile.profile.full_name || 'Creator',
                platform: socialAccount.platform || 'social',
                campaignTitle: campaign.title || 'Campaign',
                reservedAmount,
                campaignId: campaign.id,
                profileId: campaign.advertiser_id,
              }).catch(err => console.error('[Submissions API] Advertiser join notify error:', err));
            }
          });
      }

      return NextResponse.json({ success: true, action: 'join', submission });
    }

    // ─────────────────────────────────────────────────────
    // ACTION: UNJOIN CAMPAIGN (Cancel / Leave Slot)
    // ─────────────────────────────────────────────────────
    if (action === 'unjoin') {
      const { data: subToUnjoin, error: findErr } = await supabase
        .from('submissions')
        .select('id, status, reserved_amount, campaign_id')
        .eq('campaign_id', campaignId)
        .eq('creator_id', userProfile.profile.id)
        .maybeSingle();

      if (findErr || !subToUnjoin) {
        return NextResponse.json({ error: 'You have not joined this campaign.' }, { status: 404 });
      }

      if (subToUnjoin.status !== 'joined') {
        return NextResponse.json({ 
          error: 'Cannot unjoin a campaign after a post link has been submitted or verified.' 
        }, { status: 400 });
      }

      // 1. Fetch Campaign and release reserved budget
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, reserved_budget')
        .eq('id', campaignId)
        .single();

      if (campaign) {
        const currentReserved = Number(campaign.reserved_budget || 0);
        const subReserved = Number(subToUnjoin.reserved_amount || 0);
        const newReserved = Math.max(0, currentReserved - subReserved);

        await supabase
          .from('campaigns')
          .update({ reserved_budget: newReserved })
          .eq('id', campaignId);
      }

      // 2. Delete the joined submission record
      const { error: delErr } = await supabase
        .from('submissions')
        .delete()
        .eq('id', subToUnjoin.id);

      if (delErr) {
        return NextResponse.json({ error: 'Failed to unjoin campaign. Please try again.' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'unjoin' });
    }

    // ─────────────────────────────────────────────────────
    // ACTION: DELETE / RESET POST LINK (Reset back to Joined state)
    // ─────────────────────────────────────────────────────
    if (action === 'delete_link') {
      const { data: subToReset, error: findErr } = await supabase
        .from('submissions')
        .select('id, status, post_url, payout_amount, pending_payout_amount')
        .eq('campaign_id', campaignId)
        .eq('creator_id', userProfile.profile.id)
        .maybeSingle();

      if (findErr || !subToReset) {
        return NextResponse.json({ error: 'Submission not found for this campaign.' }, { status: 404 });
      }

      const clearedPayout = Number(subToReset.payout_amount || 0);

      // 1. Delete associated verification checks, audits, and transactions
      await Promise.all([
        supabase
          .from('verification_checks')
          .delete()
          .eq('submission_id', subToReset.id),
        supabase
          .from('submission_audits')
          .delete()
          .eq('submission_id', subToReset.id),
        supabase
          .from('wallet_transactions')
          .delete()
          .eq('submission_id', subToReset.id),
      ]);

      // 2. Reset submission back to 'joined' state with 0 stats
      const { data: updatedSub, error: updateErr } = await supabase
        .from('submissions')
        .update({
          post_url: null,
          screenshot_url: null,
          status: 'joined',
          final_view_count: 0,
          last_paid_view_count: 0,
          max_verified_views: 0,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          watch_time_seconds: 0,
          pending_payout_amount: 0,
          payout_amount: 0,
          last_scraped_at: null,
          verified_at: null,
          submitted_at: new Date().toISOString(),
          auto_approve_at: null,
          failure_reason: null,
        })
        .eq('id', subToReset.id)
        .select('*')
        .single();

      if (updateErr) {
        console.error('[Submissions API] Error resetting post link:', updateErr);
        return NextResponse.json({ error: 'Failed to delete post link. Please try again.' }, { status: 500 });
      }

      // 3. Clawback & Reversal: If funds had cleared to creator balance, reverse and refund campaign
      if (clearedPayout > 0) {
        const { data: creatorWallet } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('profile_id', userProfile.profile.id)
          .eq('wallet_type', 'creator_earnings')
          .maybeSingle();

        if (creatorWallet) {
          const newBalance = Number(creatorWallet.balance || 0) - clearedPayout;
          await supabase
            .from('wallets')
            .update({ balance: newBalance })
            .eq('id', creatorWallet.id);

          await supabase.from('wallet_transactions').insert({
            wallet_id: creatorWallet.id,
            type: 'withdrawal',
            amount: -clearedPayout,
            campaign_id: campaignId,
            submission_id: subToReset.id,
            status: 'completed',
            paystack_reference: `KP-CLAWBACK-${subToReset.id.slice(0, 8)}-${Date.now()}`,
          });
        }

        const { data: camp } = await supabase
          .from('campaigns')
          .select('id, spent_budget')
          .eq('id', campaignId)
          .maybeSingle();

        if (camp) {
          const newSpent = Math.max(0, Number(camp.spent_budget || 0) - clearedPayout);
          await supabase
            .from('campaigns')
            .update({ spent_budget: newSpent })
            .eq('id', campaignId);
        }
      }

      // 4. Reconcile Creator Wallet & Total Earned from remaining valid audits
      const [auditsRes, withdrawalsRes, creatorWalletRes] = await Promise.all([
        supabase
          .from('submission_audits')
          .select('payout_amount, status')
          .eq('creator_id', userProfile.profile.id),
        supabase
          .from('payout_requests')
          .select('amount, status')
          .eq('profile_id', userProfile.profile.id),
        supabase
          .from('wallets')
          .select('id, balance')
          .eq('profile_id', userProfile.profile.id)
          .eq('wallet_type', 'creator_earnings')
          .maybeSingle(),
      ]);

      const validAudits = (auditsRes.data || []).filter(
        (a: any) => a.status === 'approved' || a.status === 'auto_approved' || a.status === 'completed'
      );
      const totalCleared = validAudits.reduce((sum: number, a: any) => sum + Number(a.payout_amount || 0), 0);
      const totalWithdrawn = (withdrawalsRes.data || [])
        .filter((w: any) => w.status === 'success' || w.status === 'completed')
        .reduce((sum: number, w: any) => sum + Number(w.amount || 0), 0);
      const reconciledBalance = totalCleared - totalWithdrawn;

      if (creatorWalletRes.data) {
        await supabase
          .from('wallets')
          .update({ balance: reconciledBalance })
          .eq('id', creatorWalletRes.data.id);
      }

      await supabase
        .from('creator_profiles')
        .update({ total_earned: Math.max(0, totalCleared) })
        .eq('profile_id', userProfile.profile.id);

      return NextResponse.json({ success: true, action: 'delete_link', submission: updatedSub });
    }

    // ─────────────────────────────────────────────────────
    // ACTION: SUBMIT POST LINK (Step 2)
    // ─────────────────────────────────────────────────────
    if (action === 'submit_link') {
      if (!postUrl) {
        return NextResponse.json({ error: 'Missing postUrl' }, { status: 400 });
      }

      // Zero-Trust URL Validation
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(postUrl);
        if (parsedUrl.protocol !== 'https:') {
          return NextResponse.json({ error: 'Post URL must start with https://' }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: 'Please enter a valid, complete post URL' }, { status: 400 });
      }

      const cleanPostUrl = postUrl.trim().replace(/\/+$/, '');

      // Check if creator has a 'joined' status record for this campaign
      const { data: existingSub, error: findErr } = await supabase
        .from('submissions')
        .select('id, status, campaign_id, social_account_id, campaign:campaigns(channels), social_account:social_accounts(platform, handle)')
        .eq('campaign_id', campaignId)
        .eq('creator_id', userProfile.profile.id)
        .maybeSingle();

      if (findErr || !existingSub) {
        return NextResponse.json({ error: 'You must join this campaign before submitting a post link.' }, { status: 400 });
      }

      if (existingSub.status !== 'joined') {
        return NextResponse.json({ error: 'Post link has already been submitted for this campaign.' }, { status: 400 });
      }

      // Anti-Fraud Handle Ownership & URL Verification
      const connectedHandle = (existingSub as any)?.social_account?.handle;
      const connectedPlatform = (existingSub as any)?.social_account?.platform;

      const ownershipCheck = validatePostUrlOwnership(cleanPostUrl, connectedHandle, connectedPlatform);
      if (!ownershipCheck.isValid) {
        return NextResponse.json({ error: ownershipCheck.error }, { status: 400 });
      }

      // Anti-Fraud Constraint: Ensure no two creators submit the same post URL
      const { data: dupCheck } = await supabase
        .from('submissions')
        .select('id, creator_id, campaign_id')
        .eq('post_url', cleanPostUrl)
        .neq('id', existingSub.id)
        .maybeSingle();

      if (dupCheck) {
        return NextResponse.json({
          error: 'This post URL has already been submitted by another creator. Each submitted video URL must be unique.'
        }, { status: 400 });
      }

      const platform = ownershipCheck.platform;

      const campaignChannels = (existingSub as any)?.campaign?.channels;
      if (campaignChannels && campaignChannels.length > 0) {
        const normalizedAllowed = campaignChannels.map((ch: string) => {
          const c = ch.toLowerCase().trim();
          if (c.includes('twitter') || c === 'x') return 'x';
          if (c.includes('instagram') || c.includes('ig') || c.includes('insta')) return 'instagram';
          if (c.includes('tiktok')) return 'tiktok';
          if (c.includes('youtube') || c.includes('shorts') || c.includes('yt')) return 'youtube';
          if (c.includes('facebook') || c.includes('fb')) return 'facebook';
          if (c.includes('linkedin')) return 'linkedin';
          return c;
        });

        if (!normalizedAllowed.includes(platform)) {
          const allowedDisplay = campaignChannels.join(', ');
          const platformDisplay = platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1);
          return NextResponse.json(
            { error: `This campaign only accepts submissions for ${allowedDisplay}. Your link is from ${platformDisplay}.` },
            { status: 400 }
          );
        }
      }

      const now = new Date();

      // Update the submission record
      const { data: submission, error: subErr } = await supabase
        .from('submissions')
        .update({
          post_url: cleanPostUrl,
          screenshot_url: screenshotUrl || 'https://via.placeholder.com/150',
          status: 'pending',
          auto_approve_at: null,
          submitted_at: now.toISOString()
        })
        .eq('id', existingSub.id)
        .select('*, campaigns(id, title, advertiser_id), social_accounts(platform)')
        .single();

      if (subErr) {
        console.error('[Submissions API] Error updating submission link:', subErr);
        return NextResponse.json({ error: 'Failed to submit post link.' }, { status: 500 });
      }

      // Trigger Submission Link Notifications (Creator + Advertiser)
      const { notifyCreatorPostSubmitted, notifyAdvertiserCreatorSubmitted } = await import('@/lib/notifications');
      const campaignData = (submission as any)?.campaigns;
      const socialData = (submission as any)?.social_accounts;

      notifyCreatorPostSubmitted({
        clerkId: userProfile.profile.clerk_id,
        email: userProfile.profile.email,
        campaignTitle: campaignData?.title || 'Campaign',
        postUrl,
        campaignId: submission.campaign_id,
        profileId: userProfile.profile.id,
      }).catch(err => console.error('[Submissions API] Creator submit link notify error:', err));

      if (campaignData?.advertiser_id) {
        supabase
          .from('profiles')
          .select('clerk_id, email')
          .eq('id', campaignData.advertiser_id)
          .maybeSingle()
          .then(({ data: advProfile }) => {
            if (advProfile) {
              notifyAdvertiserCreatorSubmitted({
                clerkId: advProfile.clerk_id,
                email: advProfile.email,
                creatorHandle: userProfile.creatorProfile?.display_name || userProfile.profile.full_name || 'Creator',
                platform: socialData?.platform || 'social',
                postUrl,
                campaignTitle: campaignData?.title || 'Campaign',
                campaignId: submission.campaign_id,
                profileId: campaignData.advertiser_id,
              }).catch(err => console.error('[Submissions API] Advertiser submit link notify error:', err));
            }
          });
      }

      return NextResponse.json({ success: true, action: 'submit_link', submission });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err) {
    console.error('[Submissions API] Server error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
