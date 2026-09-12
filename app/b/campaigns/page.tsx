import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserCampaignsView from '@/components/advertiser/AdvertiserCampaignsView';
import { getAdvertiserDashboardData } from '@/lib/supabase/advertiser';

export const metadata: Metadata = {
  title: 'Campaigns',
};

export default async function BrandCampaignsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  const data = await getAdvertiserDashboardData(userProfile.profile.id);

  return <AdvertiserCampaignsView campaigns={data.campaigns} />;
}
