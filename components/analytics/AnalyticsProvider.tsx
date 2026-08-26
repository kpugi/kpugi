'use client';

import { GoogleAnalytics } from './GoogleAnalytics';
import { MicrosoftClarity } from './MicrosoftClarity';
import { PostHogProvider } from './PostHogProvider';
import { ReactNode } from 'react';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <GoogleAnalytics />
      <MicrosoftClarity />
      {children}
    </PostHogProvider>
  );
}

export { GoogleAnalytics, MicrosoftClarity };
