import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Sign In | Kpugi',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-kpugi-paper p-4">
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  );
}

