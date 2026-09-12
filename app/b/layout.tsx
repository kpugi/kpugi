import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';
import DashboardLayoutShell from '@/components/dashboard/DashboardLayoutShell';

export const metadata: Metadata = {
  title: {
    default: 'Brand Dashboard',
    template: '%s | Kpugi',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  const userProfile = await getOrCreateUserProfile();

  if (!userProfile || !userProfile.profile) {
    redirect('/sign-in');
  }

  if (!userProfile.onboardingComplete) {
    redirect('/onboarding/role');
  }

  if (userProfile.role !== 'advertiser') {
    redirect('/c/dashboard');
  }

  return (
    <DashboardLayoutShell role="advertiser">
      {children}
    </DashboardLayoutShell>
  );
}
