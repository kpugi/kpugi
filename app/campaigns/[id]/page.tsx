import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';
import CreatorCampaignDetailsView from '@/components/dashboard/CreatorCampaignDetailsView';
import CreatorCampaignWorkspaceView from '@/components/creator/campaigns/CreatorCampaignWorkspaceView';
import { getCampaignDetailsForCreator } from '@/lib/supabase/dashboard';

export default async function SingleCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const campaignData = await getCampaignDetailsForCreator(id, userProfile.profile.id);

  if (!campaignData || !campaignData.campaign) {
    notFound();
  }

  const isAdvertiser = userProfile.role === 'advertiser';

  return (
    <DashboardLayoutShell role={isAdvertiser ? 'advertiser' : 'creator'} title={campaignData.campaign.title}>
      {isAdvertiser ? (
        <CreatorCampaignDetailsView
          data={campaignData}
          campaignId={id}
          userRole="advertiser"
        />
      ) : (
        <CreatorCampaignWorkspaceView
          data={campaignData}
          campaignId={id}
        />
      )}
    </DashboardLayoutShell>
  );
}
