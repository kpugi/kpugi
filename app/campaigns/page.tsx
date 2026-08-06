import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';

export default async function LegacyCampaignsRedirect() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (userProfile.role === 'advertiser' || userProfile.advertiserProfile) {
    redirect('/b/campaigns');
  }

  redirect('/c/campaigns');
}
