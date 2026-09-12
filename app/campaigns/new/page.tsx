import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';

export const metadata: Metadata = {
  title: 'New Campaign',
  robots: { index: false, follow: false },
};

export default async function LegacyNewCampaignRedirect() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  redirect('/b/campaigns/new');
}
