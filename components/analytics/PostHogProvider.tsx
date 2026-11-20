'use client';

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import { ReactNode, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false, // Pageviews are captured manually or via Router event
      capture_exceptions: true, // Enables PostHog Error Tracking autocapture for unhandled errors and rejections
    });
  }
}

function PostHogAuthSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (user?.id) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || undefined,
        username: user.username || undefined,
      });
    } else {
      posthog.reset();
    }
  }, [user, isLoaded]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <Provider client={posthog}>
      <PostHogAuthSync />
      {children}
    </Provider>
  );
}

export { posthog };
