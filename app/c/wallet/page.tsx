import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getCreatorEarningsData } from '@/lib/supabase/creator';
import CreatorEarningsView from '@/components/creator/earnings/CreatorEarningsView';

export const metadata: Metadata = {
  title: 'Earnings & Wallet',
};

export default async function CreatorWalletPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const data = await getCreatorEarningsData(userProfile.profile.id);

  return <CreatorEarningsView data={data} />;
}
