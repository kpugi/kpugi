import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { BrandCampaignWizardView } from '@/components/campaign/BrandCampaignWizardView';

export default async function BrandNewCampaignPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (userProfile.role !== 'advertiser' && !userProfile.advertiserProfile) {
    redirect('/c/dashboard');
  }

  const supabase = createAdminClient();
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'advertiser_funding')
    .maybeSingle();

  const walletBalance = Number(wallet?.balance ?? 0);

  return (
    <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink">
          Launch New Ad Campaign
        </h1>
        <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
          Provide ready-to-post creatives, set CPM payout rates, and configure escrow budget allocation.
        </p>
      </div>
      <BrandCampaignWizardView walletBalance={walletBalance} />
    </div>
  );
}
