import React from 'react';
import type { Metadata } from 'next';
import EscrowPageClient from '@/components/marketing/EscrowPageClient';

export const metadata: Metadata = {
  title: 'Escrow & Settlement Policy | Kpugi',
  description:
    'How automated escrow protects brand budgets, guarantees creator earnings, and ensures friction-free Friday bank payouts on Kpugi.',
  alternates: {
    canonical: '/escrow-policy',
  },
  openGraph: {
    title: 'Escrow & Settlement Policy | Kpugi',
    description:
      '100% upfront escrow protection, unspent campaign refunds, and automated Friday bank payouts for Nigerian creators and brands.',
    url: 'https://kpugi.com/escrow-policy',
    siteName: 'Kpugi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escrow & Settlement Policy | Kpugi',
    description:
      '100% upfront escrow protection, unspent campaign refunds, and automated Friday bank payouts for Nigerian creators and brands.',
  },
};

export default function EscrowPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Escrow & Settlement Policy | Kpugi',
    description:
      'Official escrow and settlement policy outlining upfront budget locks, the 1,000-view milestone, and weekly Friday bank settlements on Kpugi.',
    url: 'https://kpugi.com/escrow-policy',
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
      <EscrowPageClient />
    </>
  );
}
