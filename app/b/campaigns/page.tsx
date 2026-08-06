import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserCampaignsView from '@/components/advertiser/AdvertiserCampaignsView';
import { getAdvertiserDashboardData } from '@/lib/supabase/dashboard';

export default async function BrandCampaignsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  const dashboardData = await getAdvertiserDashboardData(userProfile.profile.id);
  const campaigns = dashboardData.campaigns || [];
  return <AdvertiserCampaignsView campaigns={campaigns} />;
}
