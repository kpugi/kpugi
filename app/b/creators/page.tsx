import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserCreatorsDirectoryView from '@/components/advertiser/AdvertiserCreatorsDirectoryView';
import { getBrandCreatorsDirectory } from '@/lib/supabase/advertiser';

export default async function BrandCreatorsDirectoryPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const creators = await getBrandCreatorsDirectory();

  return <AdvertiserCreatorsDirectoryView creators={creators} />;
}
