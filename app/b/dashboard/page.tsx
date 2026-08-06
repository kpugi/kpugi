import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserDashboardView from '@/components/dashboard/AdvertiserDashboardView';
import { getAdvertiserDashboardData } from '@/lib/supabase/dashboard';

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

  const companyName = userProfile.advertiserProfile?.company_name || 'Brand Partner';
  const data = await getAdvertiserDashboardData(userProfile.profile.id);

  return <AdvertiserDashboardView companyName={companyName} data={data} />;
}
