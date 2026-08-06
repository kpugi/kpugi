import { redirect } from 'next/navigation';

export default function LegacyEarningsRedirect() {
  redirect('/c/wallet');
}
