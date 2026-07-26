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
  const creatorId = userProfile?.profile?.id || null;

  // If user is logged in, check role & onboarding
  if (userProfile && userProfile.profile) {
    if (!userProfile.onboardingComplete) {
      redirect('/onboarding/role');
    }
    if (userProfile.role !== 'creator' && !userProfile.creatorProfile) {
      redirect('/dashboard');
    }
  }

  const { campaignId } = await params;
  const campaignData = await getCampaignDetailsForCreator(campaignId, creatorId);

  if (!campaignData.campaign) {
    redirect('/browse');
  }

  return (
    <CreatorCampaignDetailsView data={campaignData} campaignId={campaignId} />
  );
}
