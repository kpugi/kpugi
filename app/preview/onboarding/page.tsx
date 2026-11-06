import React from 'react';
import { Metadata } from 'next';
import KpugiOnboardingWizard from '@/components/onboarding/KpugiOnboardingWizard';

export const metadata: Metadata = {
  title: 'Onboarding Preview | Kpugi',
  description: 'Interactive test preview of Kpugi onboarding wizard.',
};

export default function OnboardingPreviewPage() {
  return (
    <KpugiOnboardingWizard
      initialUser={{
        id: 'dev-preview-user',
        fullName: 'Alex Rivera',
        email: 'creator@kpugi.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: 'creator',
      }}
    />
  );
}

