import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export default async function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  const userProfile = await getOrCreateUserProfile();

  // Route Guard: redirect to onboarding if missing profile or role setup
  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete || !userProfile.advertiserProfile) {
    if (userProfile.role === 'creator') {
      redirect('/dashboard');
    } else {
      redirect('/onboarding/advertiser');
    }
  }

  return (
    <DashboardLayoutShell role="advertiser" title="Brand Console">
      {children}
    </DashboardLayoutShell>
  );
}

