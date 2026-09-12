import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Accounts',
  robots: { index: false, follow: false },
};

export default function LegacyAccountsRedirect() {
  redirect('/c/accounts');
}
