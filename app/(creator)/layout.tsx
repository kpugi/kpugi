import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const userProfile = await getOrCreateUserProfile();

  // Route Guard: redirect to onboarding if missing profile or role setup
  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete || !userProfile.creatorProfile) {
    if (userProfile.role === 'advertiser') {
      redirect('/dashboard');
    } else {
      redirect('/onboarding/creator');
    }
  }

  return (
    <DashboardLayoutShell role="creator" title="Creator Console">
      {children}
    </DashboardLayoutShell>
  );
}

