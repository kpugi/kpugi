import { redirect } from 'next/navigation';

export default function LegacyAccountsRedirect() {
  redirect('/c/accounts');
}
