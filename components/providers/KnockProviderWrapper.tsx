'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import {
  KnockProvider,
  KnockFeedProvider,
} from '@knocklabs/react';

interface KnockProviderWrapperProps {
  children: React.ReactNode;
}

const KNOCK_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY || '';
const KNOCK_FEED_CHANNEL_ID = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID || 'fc_in-app';

export default function KnockProviderWrapper({ children }: KnockProviderWrapperProps) {
  const { user, isLoaded } = useUser();

  // If Knock is not configured or user isn't loaded, render children without Knock context
  if (!KNOCK_PUBLIC_API_KEY || !isLoaded || !user) {
    return <>{children}</>;
  }

  return (
    <KnockProvider
      apiKey={KNOCK_PUBLIC_API_KEY}
      userId={user.id}
    >
      <KnockFeedProvider feedId={KNOCK_FEED_CHANNEL_ID}>
        {children}
      </KnockFeedProvider>
    </KnockProvider>
  );
}
