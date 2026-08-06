import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserSettingsView from '@/components/advertiser/AdvertiserSettingsView';

export default async function BrandSettingsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const companyName = userProfile.advertiserProfile?.company_name || userProfile.profile.full_name || 'Brand Partner';

  return (
    <AdvertiserSettingsView
      companyName={companyName}
      advertiserAvatarUrl={userProfile.profile.avatar_url}
    />
  );
}
