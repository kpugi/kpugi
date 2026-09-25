import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import KnockProviderWrapper from '@/components/providers/KnockProviderWrapper';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NetworkStatusBanner } from '@/components/common/NetworkStatusBanner';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { FreshdeskSupportProvider } from '@/components/support/FreshdeskSupportProvider';
import './globals.css';
import '@/styles/kpugi-tour.css';
import Script from 'next/script';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';
const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-NLS2FH5C';

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
    creator: '@kpugi_hq'
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
          {/* Google Tag Manager */}
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
          {/* End Google Tag Manager */}
          <link
            rel="stylesheet"
            href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          />
        </head>
        <body className="min-h-screen bg-kpugi-paper text-kpugi-ink dark:bg-[#090A0F] dark:text-white antialiased overflow-x-hidden">
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
          {/* End Google Tag Manager (noscript) */}
          <Script
            id="dd-rum-sync"
            src="https://www.datadoghq-browser-agent.com/us1/v6/datadog-rum.js"
            type="text/javascript"
            strategy="beforeInteractive"
          />
          <Script id="datadog-rum">
            {`window.DD_RUM && window.DD_RUM.init({
              applicationId: '${process.env.NEXT_PUBLIC_DD_RUM_APPLICATION_ID || ''}',
              clientToken: '${process.env.NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN || ''}',
              site: '${process.env.NEXT_PUBLIC_DD_SITE || ''}',
              service: '${process.env.NEXT_PUBLIC_DD_SERVICE || ''}',
              env: '${process.env.NEXT_PUBLIC_DD_ENV || ''}',
              version: '${process.env.NEXT_PUBLIC_DD_VERSION || ''}',
              sessionSampleRate: 100,
              sessionReplaySampleRate: 20,
              trackUserInteractions: true,
              trackResources: true,
              trackLongTasks: true,
              defaultPrivacyLevel: 'mask-user-input',
            });`}
          </Script>
          <Script id="trustpilot-invite" strategy="afterInteractive">
            {`(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
            a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
            f.parentNode.insertBefore(a,f)})(window,document,'script', 'https://invitejs.trustpilot.com/tp.min.js', 'tp');
            tp('register', 'dT6PBJ5gQ0ZiEkPY');`}
          </Script>
          <AnalyticsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NetworkStatusBanner />
              <KnockProviderWrapper>
                <FreshdeskSupportProvider>
                  {children}
                </FreshdeskSupportProvider>
              </KnockProviderWrapper>
            </ThemeProvider>
          </AnalyticsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
