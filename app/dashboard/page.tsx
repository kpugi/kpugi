import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';
import AdvertiserDashboardView from '@/components/dashboard/AdvertiserDashboardView';
import CreatorDashboardView from '@/components/dashboard/CreatorDashboardView';
import { getCreatorDashboardData, getAdvertiserDashboardData } from '@/lib/supabase/dashboard';

export default async function DashboardPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  if (userProfile.role === 'advertiser' || userProfile.advertiserProfile) {
    const companyName = userProfile.advertiserProfile?.company_name || 'Brand Partner';
    const data = await getAdvertiserDashboardData(userProfile.profile.id);
    return (
      <DashboardLayoutShell role="advertiser" title="Brand Console">
        <AdvertiserDashboardView companyName={companyName} data={data} />
      </DashboardLayoutShell>
    );
  }

  const displayName = userProfile.creatorProfile?.display_name || userProfile.profile.full_name || 'Creator';
  const data = await getCreatorDashboardData(userProfile.profile.id);
  return (
    <DashboardLayoutShell role="creator" title="Creator Console">
      <CreatorDashboardView displayName={displayName} data={data} />
    </DashboardLayoutShell>
  );
}


