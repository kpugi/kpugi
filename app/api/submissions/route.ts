import { NextResponse } from 'next/server';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { calculateBudgetReservation } from '@/lib/utils/budget';

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
    const { campaignId, socialAccountId, postUrl, screenshotUrl } = body;

    if (!campaignId || !socialAccountId || !postUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch Campaign and lock/verify budget
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('id, cpm_rate, total_budget, reserved_budget, spent_budget, status')
      .eq('id', campaignId)
      .single();

    if (campErr || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'live') {
      return NextResponse.json({ error: 'Campaign is not currently accepting submissions' }, { status: 400 });
    }

    // 2. Fetch Creator Social Account and verify conversion
    const { data: socialAccount, error: accErr } = await supabase
      .from('social_accounts')
      .select('id, follower_count')
      .eq('id', socialAccountId)
      .eq('creator_id', userProfile.profile.id)
      .single();

    if (accErr || !socialAccount) {
      return NextResponse.json({ error: 'Social account not found or unauthorized' }, { status: 404 });
    }

    // Check if creator already has a submission for this campaign
    const { data: existingSub } = await supabase
      .from('submissions')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('creator_id', userProfile.profile.id)
      .maybeSingle();

    if (existingSub) {
      return NextResponse.json({ error: 'You have already submitted a post for this campaign' }, { status: 400 });
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

    // 4. Update campaign reserved budget and create submission
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
        post_url: postUrl,
        screenshot_url: screenshotUrl || 'https://via.placeholder.com/150',
        reserved_amount: reservedAmount,
        status: 'pending',
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

      return NextResponse.json({ error: 'Failed to create submission record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission });
  } catch (err) {
    console.error('[Submissions API] Server error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
