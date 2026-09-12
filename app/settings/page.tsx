import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
};

export default async function LegacySettingsRedirect() {
  const userProfile = await getOrCreateUserProfile();

  if (userProfile?.role === 'advertiser') {
    redirect('/b/settings');
  }

  redirect('/c/settings');
}
