import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import KnockProviderWrapper from '@/components/providers/KnockProviderWrapper';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NetworkStatusBanner } from '@/components/common/NetworkStatusBanner';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kpugi — Where a Post Turns into a Payout',
    template: '%s | Kpugi',
  },
 description: "Kpugi connects Nigerian brands with creators for paid ad placements on Instagram, TikTok, Facebook & more. Launch a campaign or get paid to post.",
keywords: [
  'Kpugi',
  'Creator Marketplace Nigeria',
  'Influencer Marketplace Nigeria',
  'Nigeria Creators',
  'Paid Ad Placements',
  'WhatsApp Status Monetization',
  'TikTok Influencer Marketing Nigeria',
  'Instagram Creators Nigeria',
  'Find Influencers Nigeria',
  'Get Paid to Post',
  'Brand Creator Collaboration Nigeria',
  'Micro Influencer Marketing Nigeria',
],
  authors: [{ name: 'Kpugi' }],
  creator: 'Kpugi',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    title: 'Kpugi — Where a Post Turns into a Payout',
    description: 'Nigeria-first marketplace connecting advertisers with creators for paid ad placements.',
    siteName: 'Kpugi',
    images: [
      {
        url: '/kpugi_logo.png',
        width: 1200,
        height: 630,
        alt: 'Kpugi Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kpugi — Where a Post Turns into a Payout',
    description: 'Nigeria-first marketplace connecting advertisers with creators for paid ad placements.',
    images: ['/kpugi_logo.png'],
    creator: '@kpugiapp',
  },
  icons: {
    icon: '/kpugi_favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kpugi',
  },
};

export const viewport: Viewport = {
  themeColor: '#090A0F',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="stylesheet"
            href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          />
        </head>
        <body className="min-h-screen bg-kpugi-paper text-kpugi-ink dark:bg-[#090A0F] dark:text-white antialiased overflow-x-hidden transition-colors duration-200">
          <AnalyticsProvider />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <NetworkStatusBanner />
            <KnockProviderWrapper>
              {children}
            </KnockProviderWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
