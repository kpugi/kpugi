import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { BrandCampaignWizardView } from '@/components/campaign/BrandCampaignWizardView';

export const metadata: Metadata = {
  title: 'Create Campaign',
};

interface PageProps {
  searchParams: Promise<{
    draftId?: string;
    step?: string;
    reference?: string;
    session_id?: string;
    processor?: string;
  }>;
}

export default async function BrandNewCampaignPage({ searchParams }: PageProps) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (userProfile.role !== 'advertiser' && !userProfile.advertiserProfile) {
    redirect('/c/dashboard');
  }

  const resolvedParams = await searchParams;
  const draftId = resolvedParams?.draftId;
  const advertiserEmail = userProfile.profile.email || '';

  const supabase = createAdminClient();
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'advertiser_funding')
    .maybeSingle();

  const walletBalance = Number(wallet?.balance ?? 0);

  let initialData = null;
  if (draftId) {
    const { data: draft } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', draftId)
      .eq('advertiser_id', userProfile.profile.id)
      .single();

    if (draft) {
      if (draft.status === 'live') {
        redirect(`/b/campaigns/${draft.id}/success`);
      }

      let payRef = draft.requirements?.paystack_reference || draft.paystack_reference || '';
      let payMethod = draft.requirements?.payment_method || draft.payment_method || 'wallet';

      // Verify returning Bachs checkout session
      if (resolvedParams?.processor === 'bachs' && (resolvedParams?.session_id || resolvedParams?.reference)) {
        const incomingRef = resolvedParams?.session_id || resolvedParams?.reference;
        if (incomingRef) {
          try {
            const { retrieveBachsCheckoutSession } = await import('@/lib/bachs/checkout');
            const session = await retrieveBachsCheckoutSession(incomingRef);
            const isPaid =
              session.status === 'complete' ||
              session.payment_status === 'paid' ||
              session.charge?.status === 'successful';

            if (isPaid) {
              const paidAmount = Number(session.charge?.amount_paid || session.amount || draft.total_budget);
              const receiptNum = `KPG-BCH-${session.reference.replace(/^KPG-BCH-/, '').slice(0, 6).toUpperCase()}`;

              await supabase.from('payment_receipts').upsert(
                {
                  receipt_number: receiptNum,
                  advertiser_id: userProfile.profile.id,
                  campaign_id: draft.id,
                  campaign_title: draft.title,
                  total_amount: paidAmount,
                  escrow_budget: Number(draft.total_budget),
                  featured_fee: draft.is_featured ? 2500 : 0,
                  is_featured: Boolean(draft.is_featured),
                  payment_method: 'bachs',
                  paystack_reference: session.reference,
                  status: 'paid',
                  issued_at: new Date().toISOString(),
                },
                { onConflict: 'receipt_number' }
              );

              // Update draft record with verified payment
              await supabase
                .from('campaigns')
                .update({
                  paystack_reference: session.reference,
                  payment_method: 'bachs',
                  requirements: {
                    ...(draft.requirements || {}),
                    paystack_reference: session.reference,
                    payment_method: 'bachs',
                  },
                })
                .eq('id', draft.id);

              payRef = session.reference;
              payMethod = 'bachs';
            }
          } catch (e) {
            console.error('[BrandNewCampaignPage] Error verifying Bachs session:', e);
          }
        }
      }

      initialData = {
        id: draft.id,
        title: draft.title || '',
        objective: draft.objective || 'Brand Awareness',
        description: draft.description || '',
        cover_image_url: draft.cover_image_url || '',
        voice_transcript: draft.voice_transcript || '',
        cpm_rate: Number(draft.cpm_rate || 2000),
        min_view_threshold: Number(draft.min_view_threshold || 1000),
        total_budget: Number(draft.total_budget || 100000),
        required_live_duration_hours: Number(draft.required_live_duration_hours || 72),
        ad_format: draft.ad_format || 'Video Asset',
        channels: draft.channels || ['TikTok', 'Instagram'],
        is_featured: Boolean(draft.is_featured),
        payment_method: payMethod,
        paystack_reference: payRef,
        is_paid: Boolean(payRef),
        requirements: draft.requirements || {
          creative_text_copy: '',
          google_drive_url: '',
          google_doc_url: '',
          target_niche: ['Lifestyle', 'Tech & Innovation'],
          min_followers: 1000,
          hashtags: ['#KpugiLaunch'],
          mentions: ['@KpugiApp'],
        },
      };
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink">
          {draftId ? 'Resume & Finish Campaign Draft' : 'Launch New Ad Campaign'}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
          {draftId
            ? 'Continue editing your saved draft, set Campaign Budget, and publish to creators.'
            : 'Provide ready-to-post creatives, set CPM payout rates, and configure Campaign Budget allocation.'}
        </p>
      </div>
      <BrandCampaignWizardView
        walletBalance={walletBalance}
        advertiserEmail={advertiserEmail}
        initialData={initialData}
      />
    </div>
  );
}
