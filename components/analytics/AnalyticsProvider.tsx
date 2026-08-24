'use client';

import { GoogleAnalytics } from './GoogleAnalytics';
import { MicrosoftClarity } from './MicrosoftClarity';

export function AnalyticsProvider() {
  return (
    <>
      <GoogleAnalytics />
      <MicrosoftClarity />
    </>
  );
}

export { GoogleAnalytics, MicrosoftClarity };
