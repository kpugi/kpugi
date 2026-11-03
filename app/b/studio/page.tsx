import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserBrandStudioView from '@/components/advertiser/AdvertiserBrandStudioView';

export const metadata: Metadata = {
  title: 'Brand Studio',
};

export default async function BrandStudioPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  return <AdvertiserBrandStudioView />;
}
