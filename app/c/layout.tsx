import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  if (userProfile.role === 'advertiser') {
    redirect('/b/dashboard');
  }

  return (
    <DashboardLayoutShell role="creator">
      {children}
    </DashboardLayoutShell>
  );
}
