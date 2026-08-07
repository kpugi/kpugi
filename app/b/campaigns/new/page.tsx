import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { BrandCampaignWizardView } from '@/components/campaign/BrandCampaignWizardView';

export default async function BrandNewCampaignPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (userProfile.role !== 'advertiser' && !userProfile.advertiserProfile) {
    redirect('/c/dashboard');
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-kpugi-ink">Launch New Ad Campaign</h1>
        <p className="font-sans text-xs text-kpugi-slate mt-1">
          Provide ready-to-post creatives, set CPM payout rates, and configure escrow budget allocation.
        </p>
      </div>
      <BrandCampaignWizardView />
    </div>
  );
}
