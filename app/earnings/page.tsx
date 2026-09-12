import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Earnings',
  robots: { index: false, follow: false },
};

export default function LegacyEarningsRedirect() {
  redirect('/c/wallet');
}
