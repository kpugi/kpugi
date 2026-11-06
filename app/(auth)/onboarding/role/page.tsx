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
  let userProfile = null;
  try {
    userProfile = await getOrCreateUserProfile();
  } catch (err) {
    console.warn('[OnboardingRolePage] Clerk auth error in local env:', err);
  }

  // In local development, if live Clerk keys prevent sign-in on localhost,
  // provide a mock user session so the onboarding wizard can be fully tested!
  const isDev = process.env.NODE_ENV === 'development';
  if (!userProfile || !userProfile.profile) {
    if (isDev) {
      return (
        <KpugiOnboardingWizard
          initialUser={{
            id: 'dev-preview-user',
            fullName: 'Alex Rivera',
            email: 'creator@kpugi.com',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            role: 'creator',
          }}
        />
      );
    }
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
