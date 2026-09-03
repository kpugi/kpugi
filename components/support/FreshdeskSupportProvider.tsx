'use client';

import React, { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { hideFreshdeskWidget } from '@/lib/support/freshdesk';

interface FreshdeskSupportProviderProps {
  children?: React.ReactNode;
}

export function FreshdeskSupportProvider({ children }: FreshdeskSupportProviderProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const initializedRef = useRef(false);
  const activeUserIdRef = useRef<string | null>(null);

  const defaultToken =
    process.env.NEXT_PUBLIC_FRESHDESK_TOKEN || '01M1KZVMSR6Q129HM6JJ46T1M2';
  const host =
    process.env.NEXT_PUBLIC_FRESHDESK_HOST || 'https://kpugi.freshdesk.com';
  const widgetId =
    process.env.NEXT_PUBLIC_FRESHDESK_WIDGET_ID || '01M1KZVQP766MJY5699WDYB1D8';

  const baseConfig = {
    host,
    token: defaultToken,
    widgetId,
    config: {
      headerProperty: {
        hideChatButton: true,
      },
    },
  };

  useEffect(() => {
    // Wait until Clerk finishes loading so we know the user identity before initializing
    if (!isLoaded || typeof window === 'undefined') return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Pre-configure Freshworks to hide default floating launcher bubble
    window.fcWidgetMessengerConfig = {
      config: {
        headerProperty: {
          hideChatButton: true,
        },
      },
    };

    const initFreshdesk = async () => {
      let jwtToken: string | null = null;
      let userName = 'Kpugi User';
      let userEmail = '';

      if (isSignedIn && user) {
        try {
          const res = await fetch('/api/support/freshdesk-jwt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.token) {
              jwtToken = data.token;
              userName = data.name || userName;
              userEmail = data.email || userEmail;
            }
          }
        } catch (e) {
          console.warn('[Freshdesk] JWT initial load notice:', e);
        }
      }

      const w = window as any;
      if (w.fdWidget && typeof w.fdWidget.init === 'function') {
        const initPayload: Record<string, any> = {
          ...baseConfig,
        };

        if (jwtToken) {
          initPayload.jwtAuthToken = jwtToken;
          initPayload.contactProperties = {
            name: userName,
            email: userEmail,
          };
          activeUserIdRef.current = user?.id || null;
        } else {
          activeUserIdRef.current = 'guest';
        }

        w.fdWidget.init(initPayload);

        // Completely hide the widget launcher so it only opens from the dashboard UI
        try {
          w.fdWidget.hide();
        } catch {
          hideFreshdeskWidget();
        }
      }
    };

    const scriptId = 'Freshdesk-js-sdk';
    const existing = document.getElementById(scriptId);

    if (existing) {
      initFreshdesk();
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `${host}/webchat/js/widget.js`;
      script.onload = () => {
        initFreshdesk();
      };
      document.head.appendChild(script);
    }
  }, [isLoaded, user, isSignedIn, defaultToken, host, widgetId]);

  // Handle subsequent login / logout / user switches cleanly without session thrashing
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    if (!initializedRef.current) return;

    const w = window as any;
    if (!w.fdWidget) return;

    const targetUserId = isSignedIn && user ? user.id : 'guest';
    if (activeUserIdRef.current === targetUserId) return;

    const updateSession = async () => {
      if (isSignedIn && user) {
        try {
          const res = await fetch('/api/support/freshdesk-jwt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!res.ok) return;

          const data = await res.json();
          if (data.authenticated && data.token) {
            activeUserIdRef.current = user.id;

            if (typeof w.fdWidget.reInit === 'function') {
              w.fdWidget.reInit({
                ...baseConfig,
                jwtAuthToken: data.token,
                contactProperties: {
                  name: data.name,
                  email: data.email,
                },
              });
            }

            try {
              w.fdWidget.hide();
            } catch {
              hideFreshdeskWidget();
            }
          }
        } catch (err) {
          console.warn('[Freshdesk] Session update notice:', err);
        }
      } else if (!isSignedIn && activeUserIdRef.current && activeUserIdRef.current !== 'guest') {
        // User explicitly logged out: clear stored credentials and re-init as guest
        activeUserIdRef.current = 'guest';
        try {
          if (typeof w.fdWidget.user?.clear === 'function') {
            await w.fdWidget.user.clear();
          }
          if (typeof w.fdWidget.reInit === 'function') {
            w.fdWidget.reInit(baseConfig);
          }
          try {
            w.fdWidget.hide();
          } catch {
            hideFreshdeskWidget();
          }
        } catch (err) {
          console.warn('[Freshdesk] Sign-out clear notice:', err);
        }
      }
    };

    updateSession();
  }, [isLoaded, isSignedIn, user]);

  return <>{children}</>;
}
