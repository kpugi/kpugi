import React from 'react';
import type { Metadata } from 'next';
import PrivacyPageClient from '@/components/marketing/PrivacyPageClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kpugi',
  description:
    'How Kpugi protects your personal data, handles read-only social media permissions, and safeguards bank payout details under the Nigeria Data Protection Act (NDPA).',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Kpugi',
    description:
      'Clear, honest privacy rules for creators and brands on Kpugi. Read-only social access, encrypted bank details, and zero data selling.',
    url: 'https://kpugi.com/privacy',
    siteName: 'Kpugi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Kpugi',
    description:
      'Clear, honest privacy rules for creators and brands on Kpugi. Read-only social access, encrypted bank details, and zero data selling.',
  },
};

export default function PrivacyPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy | Kpugi',
    description:
      'Official data privacy policy detailing collection, usage, OAuth permissions, and deletion rights under NDPA for Kpugi creators and brands.',
    url: 'https://kpugi.com/privacy',
    publisher: {
      '@type': 'Organization',
      name: 'Kpugi Technologies',
      url: 'https://kpugi.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrivacyPageClient />
    </>
  );
}
