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

const KNOCK_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY || 'pk_test_ebTRznjWO9-C1KZMr_dmMTq4EkAo0l9sqYH-EJV1Amo';
const KNOCK_FEED_CHANNEL_ID = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID || '8070d4af-f05a-4722-8472-98123478c5cf';

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
      <KnockFeedProvider feedId={KNOCK_FEED_CHANNEL_ID} autoMarkAsSeen={false}>
        {children}
      </KnockFeedProvider>
    </KnockProvider>
  );
}
