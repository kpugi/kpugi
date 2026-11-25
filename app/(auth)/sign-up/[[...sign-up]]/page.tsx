import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Sign Up | Kpugi',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-kpugi-paper p-4">
      <SignUp fallbackRedirectUrl="/onboarding/role" />
    </div>
  );
}

