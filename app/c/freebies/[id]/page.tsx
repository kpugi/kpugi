import React from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import PerkDetailView from '@/components/creator/freebies/PerkDetailView';
import { getPerkDetail } from '@/lib/supabase/perks';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Perk Details | Kpugi Creator Hub`,
    description: 'View full details, eligibility, and claim this creator perk on Kpugi.',
  };
}

export default async function PerkDetailPage({ params }: Props) {
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

  const creatorId   = userProfile.profile.id;
  const totalEarned = (userProfile.creatorProfile as any)?.total_earned ?? 0;

  const { id } = await params;
  const perk = await getPerkDetail(id, creatorId);

  if (!perk) {
    notFound();
  }

  return (
    <PerkDetailView
      perk={perk}
      creatorId={creatorId}
      totalEarned={totalEarned}
    />
  );
}
