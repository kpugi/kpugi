import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOrCreateUserProfile } from '@/lib/clerk/auth';

export const metadata: Metadata = {
  title: 'Wallet',
  robots: { index: false, follow: false },
};

export default async function LegacyWalletRedirect() {
  const userProfile = await getOrCreateUserProfile();

  if (userProfile?.role === 'advertiser') {
    redirect('/b/wallet');
  }

  redirect('/c/wallet');
}
