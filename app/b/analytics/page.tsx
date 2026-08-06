import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserAnalyticsView from '@/components/advertiser/AdvertiserAnalyticsView';
import { getAdvertiserDashboardData } from '@/lib/supabase/advertiser';

export default async function BrandAnalyticsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const data = await getAdvertiserDashboardData(userProfile.profile.id);

  return <AdvertiserAnalyticsView data={data} />;
}
