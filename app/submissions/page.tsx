import { redirect } from 'next/navigation';

export default function LegacySubmissionsRedirect() {
  redirect('/c/submissions');
}
