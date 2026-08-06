import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import CreatorCampaignsView from '@/components/creator/campaigns/CreatorCampaignsView';
import { getCreatorCampaigns } from '@/lib/supabase/creator';

export default async function CreatorCampaignsPage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  const campaigns = await getCreatorCampaigns(userProfile.profile.id);
  return <CreatorCampaignsView campaigns={campaigns} />;
}
