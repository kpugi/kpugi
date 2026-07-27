import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';
import AdvertiserCampaignsView from '@/components/advertiser/AdvertiserCampaignsView';
import CreatorCampaignsView from '@/components/creator/campaigns/CreatorCampaignsView';
import { getAdvertiserDashboardData } from '@/lib/supabase/dashboard';
import { getCreatorCampaigns } from '@/lib/supabase/creator';

export default async function CampaignsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  if (userProfile.role === 'advertiser' || userProfile.advertiserProfile) {
    const dashboardData = await getAdvertiserDashboardData(userProfile.profile.id);
    const campaigns = dashboardData.campaigns || [];
    return (
      <DashboardLayoutShell role="advertiser" title="Brand Campaigns">
        <AdvertiserCampaignsView campaigns={campaigns} />
      </DashboardLayoutShell>
    );
  }

  const campaigns = await getCreatorCampaigns(userProfile.profile.id);
  return (
    <DashboardLayoutShell role="creator" title="Creator Campaigns">
      <CreatorCampaignsView campaigns={campaigns} />
    </DashboardLayoutShell>
  );
}
