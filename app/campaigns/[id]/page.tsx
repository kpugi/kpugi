import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';

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
