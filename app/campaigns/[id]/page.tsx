import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';

export const metadata: Metadata = {
  title: 'Campaign Details',
  robots: { index: false, follow: false },
};

export default async function LegacySingleCampaignRedirect({ params }: { params: Promise<{ id: string }> }) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  const { id } = await params;

  if (userProfile.role === 'advertiser' || userProfile.advertiserProfile) {
    redirect(`/b/campaigns/${id}`);
  }

  redirect(`/c/campaigns/${id}`);
}
