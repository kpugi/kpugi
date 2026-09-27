import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import FreebiesHubView from '@/components/creator/freebies/FreebiesHubView';
import { getPerksForCreator, getCreatorPerkBonusTotal } from '@/lib/supabase/perks';

export const metadata: Metadata = {
  title: 'Freebies & Perks | Kpugi Creator Hub',
  description:
    'Unlock exclusive challenges, cash bonuses, partner coupons, software deals, and creator freebies — curated by Kpugi.',
};

export const revalidate = 0;

export default async function CreatorFreebiesPage() {
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

  const displayName =
    userProfile.creatorProfile?.display_name ||
    userProfile.profile.full_name ||
    'Creator';

  // Total lifetime earnings drives the rank calculation
  const totalEarned =
    (userProfile.creatorProfile as any)?.total_earned ?? 0;

  const [perks, totalBonusClaimed] = await Promise.all([
    getPerksForCreator(userProfile.profile.id),
    getCreatorPerkBonusTotal(userProfile.profile.id),
  ]);

  return (
    <FreebiesHubView
      displayName={displayName}
      totalEarned={totalEarned}
      totalBonusClaimed={totalBonusClaimed}
      initialPerks={perks}
    />
  );
}
