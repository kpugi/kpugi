import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import CreatorDashboardView from '@/components/dashboard/CreatorDashboardView';
import { getCreatorOverviewData } from '@/lib/supabase/creator';

export default async function CreatorDashboardPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  if (userProfile.role === 'advertiser') {
    redirect('/b/dashboard');
  }

  const displayName = userProfile.creatorProfile?.display_name || userProfile.profile.full_name || 'Creator';
  const data = await getCreatorOverviewData(userProfile.profile.id);

  return <CreatorDashboardView displayName={displayName} data={data as any} />;
}
