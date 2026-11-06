import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import KpugiOnboardingWizard from '@/components/onboarding/KpugiOnboardingWizard';

export const metadata: Metadata = {
  title: 'Onboarding | Kpugi',
  description: 'Setup your creator media kit or advertiser workspace on Kpugi.',
};

export default async function OnboardingRolePage() {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  return (
    <KpugiOnboardingWizard
      initialUser={{
        id: userProfile.profile.id,
        fullName: userProfile.profile.full_name || '',
        email: userProfile.profile.email || '',
        avatarUrl: userProfile.profile.avatar_url || '',
        role: userProfile.profile.role,
      }}
    />
  );
}
