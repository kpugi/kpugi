import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import CreatorCampaignDetailsView from '@/components/dashboard/CreatorCampaignDetailsView';
import { getCampaignDetailsForCreator } from '@/lib/supabase/dashboard';

export default async function BrandSingleCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const campaignData = await getCampaignDetailsForCreator(id, userProfile.profile.id);

  if (!campaignData || !campaignData.campaign) {
    notFound();
  }

  return (
    <CreatorCampaignDetailsView
      data={campaignData}
      campaignId={id}
      userRole="advertiser"
    />
  );
}
