import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import AdvertiserCampaignDetailsView from '@/components/advertiser/AdvertiserCampaignDetailsView';
import { getBrandCampaignDetails } from '@/lib/supabase/advertiser';

export default async function BrandSingleCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  // Only advertisers can access brand campaign management
  if (userProfile.profile.role !== 'advertiser' && !userProfile.advertiserProfile) {
    notFound();
  }

  const { id } = await params;
  const data = await getBrandCampaignDetails(id, userProfile.profile.id);

  // If the campaign doesn't exist or is not owned by this advertiser, trigger 404
  if (!data || !data.campaign) {
    notFound();
  }

  return <AdvertiserCampaignDetailsView data={data} campaignId={id} />;
}
