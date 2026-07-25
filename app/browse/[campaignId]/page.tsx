import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import { getCampaignDetailsForCreator } from '@/lib/supabase/dashboard';
import CreatorCampaignDetailsView from '@/components/dashboard/CreatorCampaignDetailsView';

export default async function BrowseCampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  // Ensure user is onboarding complete
  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  // Ensure they are creator
  if (userProfile.role !== 'creator' && !userProfile.creatorProfile) {
    redirect('/dashboard');
  }

  const { campaignId } = await params;
  const campaignData = await getCampaignDetailsForCreator(campaignId, userProfile.profile.id);

  if (!campaignData.campaign) {
    redirect('/browse');
  }

  return (
    <CreatorCampaignDetailsView data={campaignData} campaignId={campaignId} />
  );
}
