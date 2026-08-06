import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import CreatorCampaignWorkspaceView from '@/components/creator/campaigns/CreatorCampaignWorkspaceView';
import { getCampaignDetailsForCreator } from '@/lib/supabase/dashboard';

export default async function CreatorSingleCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const campaignData = await getCampaignDetailsForCreator(id, userProfile.profile.id);

  if (!campaignData || !campaignData.campaign) {
    notFound();
  }

  return <CreatorCampaignWorkspaceView data={campaignData} campaignId={id} />;
}
