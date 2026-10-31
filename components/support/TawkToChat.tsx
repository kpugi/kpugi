'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

const TAWK_PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || '6ae5d760896a4b3c363002f4';
const TAWK_WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || '1k68tbtg3';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: any;
  }
}

export function TawkToChat() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    if (!document.getElementById('tawk-script')) {
      const s1 = document.createElement('script');
      s1.id = 'tawk-script';
      s1.async = true;
      s1.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      document.head.appendChild(s1);
    }

    if (isSignedIn && user) {
      const setAttrs = () => {
        try {
          if (typeof window.Tawk_API?.setAttributes === 'function') {
            window.Tawk_API.setAttributes(
              {
                name: user.fullName || user.username || 'Kpugi User',
                email: user.primaryEmailAddress?.emailAddress || '',
                id: user.id,
              },
              (error: any) => {
                if (error) console.error('Tawk setAttributes error:', error);
              }
            );
          }
        } catch {
          // ignore
        }
      };

      if (window.Tawk_API?.isChatMaximized !== undefined) {
        setAttrs();
      } else {
        window.Tawk_API.onLoad = setAttrs;
      }
    }
  }, [user, isSignedIn]);

  return null;
}

