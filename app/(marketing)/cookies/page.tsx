import React from 'react';
import type { Metadata } from 'next';
import CookiesPageClient from '@/components/marketing/CookiesPageClient';

export const metadata: Metadata = {
  title: 'Cookie Policy | Kpugi',
  description:
    'How Kpugi uses cookies and browser storage for session authentication, theme persistence, and security. Zero third-party advertising trackers.',
  alternates: {
    canonical: '/cookies',
  },
  openGraph: {
    title: 'Cookie Policy | Kpugi',
    description:
      'Clear, honest cookie rules on Kpugi. Session authentication, theme persistence, and zero third-party ad tracking.',
    url: 'https://kpugi.com/cookies',
    siteName: 'Kpugi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | Kpugi',
    description:
      'Clear, honest cookie rules on Kpugi. Session authentication, theme persistence, and zero third-party ad tracking.',
  },
};

export default function CookiesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Cookie Policy | Kpugi',
    description:
      'Official cookie policy detailing session authentication, theme storage, and anti-fraud protections on Kpugi.',
    url: 'https://kpugi.com/cookies',
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
      <CookiesPageClient />
    </>
  );
}
