import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserDashboardView from '@/components/dashboard/AdvertiserDashboardView';
import { getAdvertiserDashboardData } from '@/lib/supabase/advertiser';

export default async function BrandDashboardPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  if (userProfile.role === 'creator') {
    redirect('/c/dashboard');
  }

  const data = await getAdvertiserDashboardData(userProfile.profile.id);

  return <AdvertiserDashboardView companyName={data.companyName} data={data} />;
}
