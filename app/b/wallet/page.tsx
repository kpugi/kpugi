import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserWalletView from '@/components/advertiser/AdvertiserWalletView';
import { getBrandWalletData } from '@/lib/supabase/advertiser';

export default async function BrandWalletPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const data = await getBrandWalletData(userProfile.profile.id);

  return <AdvertiserWalletView data={data} />;
}
