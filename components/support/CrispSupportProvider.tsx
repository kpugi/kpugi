'use client';

import React, { useEffect, useRef } from 'react';
import { Crisp } from 'crisp-sdk-web';
import { useUser } from '@clerk/nextjs';
import { setCrispUserData } from '@/lib/support/crisp';

interface CrispSupportProviderProps {
  children?: React.ReactNode;
}

export function CrispSupportProvider({ children }: CrispSupportProviderProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const configuredRef = useRef(false);

  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

    if (!websiteId) {
      // Crisp website ID not provided yet; skip initialization
      return;
    }

    if (!configuredRef.current) {
      try {
        Crisp.configure(websiteId, {
          autoload: true,
        });
        configuredRef.current = true;
      } catch (err) {
        console.warn('[CrispSupportProvider] Initialization error:', err);
      }
    }

    if (isLoaded && isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || '';
      const name = user.fullName || user.firstName || 'Kpugi User';
      const avatar = user.imageUrl || undefined;
      const role = (user.publicMetadata?.role as string) || 'creator';

      setCrispUserData({
        email,
        name,
        avatar,
        role,
        userId: user.id,
        customData: {
          account_type: role,
          auth_provider: 'clerk',
        },
      });
    }
  }, [isLoaded, isSignedIn, user]);

  return <>{children}</>;
}
