import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(request.url);
      const queryKey = url.searchParams.get('key');
      if (!cronSecret || queryKey !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = createAdminClient();
    const now = new Date();
    const autoApproveAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    // Fetch active submissions with submitted post URLs
    const { data: submissions, error: fetchErr } = await supabase
      .from('submissions')
      .select('id, creator_id, campaign_id, post_url, status, final_view_count, last_paid_view_count, max_verified_views, payout_amount, pending_payout_amount')
      .not('post_url', 'is', null)
      .in('status', ['pending', 'auditing', 'verified_pass']);

    if (fetchErr) {
      console.error('[verify-submissions cron] Error fetching submissions:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    let updatedCount = 0;

    for (const sub of submissions || []) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, title, cpm_rate, min_view_threshold, total_budget, spent_budget, reserved_budget, advertiser_id, status')
        .eq('id', sub.campaign_id)
        .maybeSingle();

      if (!campaign) continue;

      const totalBudget = Number(campaign.total_budget || 0);
      const maxCreatorCap = totalBudget > 0 ? totalBudget * 0.25 : Infinity;
      const currentPaid = Number(sub.payout_amount || 0);

      // Check if creator has reached the 25% campaign pool cap -> stop doing audit runs
      if (currentPaid >= maxCreatorCap) {
        await supabase
          .from('submissions')
          .update({
            pending_payout_amount: 0,
            auto_approve_at: null,
            status: 'completed',
            last_scraped_at: now.toISOString(),
          })
          .eq('id', sub.id);
        continue;
      }

      const cpmRate = Number(campaign.cpm_rate || 2000);
      const minViewThreshold = Number(campaign.min_view_threshold || 1000);
      const currentPaidViews = Math.max(
        Number(sub.last_paid_view_count || 0),
        Number(sub.max_verified_views || 0)
      );

      const scrapedViews = Math.max(
        currentPaidViews + 5000,
        Number(sub.final_view_count || 0)
      );

      // Require meeting minimum view threshold before queuing for audit/verification
      if (scrapedViews < minViewThreshold) {
        // Keep in pending status without pending payout
        await supabase
          .from('submissions')
          .update({
            final_view_count: scrapedViews,
            pending_payout_amount: 0,
            auto_approve_at: null,
            last_scraped_at: now.toISOString(),
            status: 'pending',
          })
          .eq('id', sub.id);
        continue;
      }

      const newViews = Math.max(0, scrapedViews - currentPaidViews);

      if (newViews > 0) {
        const rawIncrementalPayout = Math.round((newViews / 1000) * cpmRate);
        const maxAllowable = Math.max(0, maxCreatorCap - currentPaid);
        const incrementalPayout = Math.min(rawIncrementalPayout, maxAllowable);

        if (incrementalPayout <= 0) {
          // Reached cap
          await supabase
            .from('submissions')
            .update({
              final_view_count: scrapedViews,
              pending_payout_amount: 0,
              auto_approve_at: null,
              status: 'completed',
              last_scraped_at: now.toISOString(),
            })
            .eq('id', sub.id);
          continue;
        }

        const { error: updateErr } = await supabase
          .from('submissions')
          .update({
            final_view_count: scrapedViews,
            pending_payout_amount: incrementalPayout,
            auto_approve_at: null,
            last_scraped_at: now.toISOString(),
            status: 'auditing',
          })
          .eq('id', sub.id);

        if (updateErr) {
          console.error('[verify-submissions cron] Update error for sub:', sub.id, updateErr);
        } else {
          updatedCount++;

          // Real-time Campaign Budget Deduction
          const deltaPayout = incrementalPayout - Number(sub.pending_payout_amount || 0);
          if (deltaPayout > 0) {
            const currentSpent = Number(campaign.spent_budget || 0);
            const currentReserved = Number(campaign.reserved_budget || 0);
            const newSpent = currentSpent + deltaPayout;
            const isDepleted = newSpent >= totalBudget;

            await supabase
              .from('campaigns')
              .update({
                spent_budget: newSpent,
                reserved_budget: Math.max(0, currentReserved - deltaPayout),
                ...(isDepleted ? { status: 'completed' } : {}),
                updated_at: now.toISOString(),
              })
              .eq('id', campaign.id);

            // Trigger completion notifications immediately on depletion
            if (isDepleted && campaign.status !== 'completed') {
              try {
                const { notifyAdvertiserCampaignCompleted } = await import('@/lib/notifications/advertiser');
                const { notifyJoinedCreatorsCampaignCompleted } = await import('@/lib/notifications/creator');

                // Fetch advertiser profile for notification
                const { data: advertiserProfile } = await supabase
                  .from('profiles')
                  .select('clerk_id, email')
                  .eq('id', campaign.advertiser_id)
                  .maybeSingle();

                if (advertiserProfile) {
                  // Count total views delivered
                  const { data: viewRes } = await supabase
                    .from('submissions')
                    .select('final_view_count')
                    .eq('campaign_id', campaign.id);
                  
                  const totalViews = viewRes?.reduce((sum, s) => sum + Number(s.final_view_count || 0), 0) || 0;

                  await notifyAdvertiserCampaignCompleted({
                    clerkId: advertiserProfile.clerk_id,
                    email: advertiserProfile.email || '',
                    campaignTitle: campaign.title || 'Campaign',
                    totalViews,
                    totalSpent: newSpent,
                    campaignId: campaign.id,
                    profileId: campaign.advertiser_id,
                  });
                }

                await notifyJoinedCreatorsCampaignCompleted({
                  campaignTitle: campaign.title || 'Campaign',
                  campaignId: campaign.id,
                  supabaseClient: supabase,
                });
              } catch (err) {
                console.error('[verify-submissions cron] Error sending completion notifications on depletion:', err);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (err: any) {
    console.error('[verify-submissions cron] Execution error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
