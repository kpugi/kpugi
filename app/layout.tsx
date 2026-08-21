import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import KnockProviderWrapper from '@/components/providers/KnockProviderWrapper';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NetworkStatusBanner } from '@/components/common/NetworkStatusBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kpugi — Where a Post Turns into a Payout',
  description: 'Nigeria-first marketplace connecting advertisers with creators for paid ad placements.',
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
