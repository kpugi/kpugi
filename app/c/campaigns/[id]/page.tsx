import React from 'react';
import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import CreatorCampaignWorkspaceView from '@/components/creator/campaigns/CreatorCampaignWorkspaceView';
import { getCampaignDetailsForCreator } from '@/lib/supabase/dashboard';
import { createAdminClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('title')
    .eq('id', id)
    .maybeSingle();

  return {
    title: campaign?.title ? `${campaign.title} — Workspace` : 'Campaign Workspace',
  };
}

export default async function CreatorSingleCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  // Only creators can access creator campaign workspaces
  if (userProfile.profile.role !== 'creator') {
    redirect('/browse');
  }

  const { id } = await params;
  const campaignData = await getCampaignDetailsForCreator(id, userProfile.profile.id);

  if (!campaignData || !campaignData.campaign) {
    notFound();
  }

  // CONSTRAINT: If the creator has not joined this campaign yet, redirect them to the browse brief page to claim a slot
  if (!campaignData.submission) {
    redirect(`/browse/${id}`);
  }

  return <CreatorCampaignWorkspaceView data={campaignData} campaignId={id} />;
}
