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
      const rawSession = resolvedParams?.session_id;
      const validSession = rawSession && !rawSession.includes('{CHECKOUT_SESSION_ID}') && !rawSession.includes('%7BCHECKOUT_SESSION_ID%7D') ? rawSession : null;
      const incomingRef = resolvedParams?.reference || validSession;

      if (resolvedParams?.processor === 'bachs' && incomingRef) {
        try {
            const { retrieveBachsCheckoutSession } = await import('@/lib/bachs/checkout');
            const session = await retrieveBachsCheckoutSession(incomingRef);
            const isPaid =
              session.status === 'complete' ||
              session.payment_status === 'paid' ||
              session.charge?.status === 'successful';

            if (isPaid) {
              const expectedTotal = Number(draft.total_budget || 0) + (draft.is_featured ? 2500 : 0);
              const paidAmount = Number(
                session.metadata?.amount ||
                session.settlement_amount ||
                (expectedTotal > 0 ? expectedTotal : (session.charge?.amount_paid || session.amount || 0))
              );
              const receiptNum = `KPG-BCH-${session.reference.replace(/^KPG-BCH-/, '').slice(0, 6).toUpperCase()}`;

              const receiptRes = await supabase.from('payment_receipts').upsert(
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

              // Gracefully handle database check constraint if 'bachs' enum is still pending
              if (receiptRes.error && receiptRes.error.message.includes('check constraint')) {
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
                    payment_method: 'paystack',
                    paystack_reference: session.reference,
                    status: 'paid',
                    issued_at: new Date().toISOString(),
                    notes: 'Paid via Bachs.io Gateway',
                  },
                  { onConflict: 'receipt_number' }
                );
              }

              // Update draft record with verified payment in requirements JSONB
              await supabase
                .from('campaigns')
                .update({
                  requirements: {
                    ...(draft.requirements || {}),
                    paystack_reference: session.reference,
                    payment_method: 'bachs',
                  },
                })
                .eq('id', draft.id);

              // Ensure dual ledger entries exist in wallet_transactions for brand wallet history
              try {
                let { data: advWallet } = await supabase
                  .from('wallets')
                  .select('id')
                  .eq('profile_id', userProfile.profile.id)
                  .eq('wallet_type', 'advertiser_funding')
                  .maybeSingle();

                if (!advWallet) {
                  const { data: newW } = await supabase
                    .from('wallets')
                    .insert({ profile_id: userProfile.profile.id, wallet_type: 'advertiser_funding', balance: 0 })
                    .select('id')
                    .single();
                  advWallet = newW;
                }

                if (advWallet) {
                  const { data: existingTx } = await supabase
                    .from('wallet_transactions')
                    .select('id, type')
                    .eq('paystack_reference', session.reference);

                  const hasDeposit = existingTx?.some((t) => t.type === 'deposit');
                  const hasDebit = existingTx?.some((t) => t.type === 'campaign_funding');

                  if (!hasDeposit) {
                    await supabase.from('wallet_transactions').insert({
                      wallet_id: advWallet.id,
                      type: 'deposit',
                      amount: paidAmount,
                      paystack_reference: session.reference,
                      status: 'completed',
                      created_at: new Date(Date.now() - 1000).toISOString(),
                    });
                  }

                  if (!hasDebit) {
                    await supabase.from('wallet_transactions').insert({
                      wallet_id: advWallet.id,
                      type: 'campaign_funding',
                      amount: Number(draft.total_budget || paidAmount),
                      campaign_id: draft.id,
                      paystack_reference: session.reference,
                      status: 'completed',
                      created_at: new Date().toISOString(),
                    });
                  }
                }
              } catch (txErr) {
                console.error('[BrandNewCampaignPage] Error recording Bachs dual ledger entries:', txErr);
              }

              payRef = session.reference;
              payMethod = 'bachs';
            }
          } catch (e) {
            console.error('[BrandNewCampaignPage] Error verifying Bachs session:', e);
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
