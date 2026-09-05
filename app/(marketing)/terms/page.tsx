import React from 'react';
import type { Metadata } from 'next';
import TermsPageClient from '@/components/marketing/TermsPageClient';

export const metadata: Metadata = {
  title: 'Terms of Service | Kpugi',
  description:
    'Terms of service and operational platform agreements for brands and creators on Kpugi. Built on verified views, guaranteed escrow, and automated weekly bank payouts.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service | Kpugi',
    description:
      'Clear, honest rules for brands and creators on Kpugi. Built on guaranteed escrow, verified views, and weekly bank payouts.',
    url: 'https://kpugi.com/terms',
    siteName: 'Kpugi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Kpugi',
    description:
      'Clear, honest rules for brands and creators on Kpugi. Built on guaranteed escrow, verified views, and weekly bank payouts.',
  },
};

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service | Kpugi',
    description:
      'Operational platform agreements for brands and creators on Kpugi, detailing escrow protection, the 1,000-view milestone, and weekly payouts.',
    url: 'https://kpugi.com/terms',
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
      <TermsPageClient />
    </>
  );
}
