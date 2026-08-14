import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { CampaignSuccessView } from '@/components/campaign/CampaignSuccessView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignSuccessPage({ params }: PageProps) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile || !userProfile.profile) redirect('/sign-in');

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, campaign_code, total_budget, cpm_rate, channels, ad_format, is_featured, status, created_at')
    .eq('id', id)
    .eq('advertiser_id', userProfile.profile.id)
    .maybeSingle();

  if (!campaign) redirect('/b/campaigns');

  const { data: receipt } = await supabase
    .from('payment_receipts')
    .select('receipt_number, total_amount, payment_method, issued_at, transaction_type')
    .eq('campaign_id', id)
    .eq('advertiser_id', userProfile.profile.id)
    .order('issued_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <CampaignSuccessView
      campaign={{
        id: campaign.id,
        title: campaign.title,
        campaign_code: campaign.campaign_code,
        total_budget: Number(campaign.total_budget),
        cpm_rate: Number(campaign.cpm_rate),
        channels: campaign.channels || [],
        ad_format: campaign.ad_format,
        is_featured: campaign.is_featured,
        created_at: campaign.created_at,
      }}
      receipt={receipt ? {
        receipt_number: receipt.receipt_number,
        total_amount: Number(receipt.total_amount),
        payment_method: receipt.payment_method,
        issued_at: receipt.issued_at,
      } : null}
    />
  );
}
