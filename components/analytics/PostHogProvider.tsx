'use client';

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import { ReactNode } from 'react';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false, // Pageviews are captured manually or via Router event
    });
  }
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return <Provider client={posthog}>{children}</Provider>;
}
