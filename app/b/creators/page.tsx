import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserCreatorsDirectoryView from '@/components/advertiser/AdvertiserCreatorsDirectoryView';

export default async function BrandCreatorsDirectoryPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  return <AdvertiserCreatorsDirectoryView />;
}
