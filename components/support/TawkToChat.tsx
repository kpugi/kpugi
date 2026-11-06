'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

const TAWK_PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || '6ae5d760896a4b3c363002f4';
const TAWK_WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || '1k68tbtg3';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: any;
    openKpugiLiveChat?: () => void;
    hideKpugiLiveChat?: () => void;
    __openTawkOnLoad?: boolean;
  }
}

/**
 * Programmatically shows and maximizes the Tawk.to live chat window.
 */
export function openTawkChat() {
  if (typeof window === 'undefined') return;
  const tawk = window.Tawk_API;

  if (tawk && typeof tawk.maximize === 'function') {
    try {
      if (typeof tawk.showWidget === 'function') {
        tawk.showWidget();
      }
      tawk.maximize();
      return;
    } catch (e) {
      console.warn('[Tawk] Failed to maximize chat:', e);
    }
  }

  // Queue open request if script is still downloading or initializing
  window.__openTawkOnLoad = true;
}

/**
 * Programmatically hides the Tawk.to widget completely from view.
 */
export function hideTawkChat() {
  if (typeof window === 'undefined') return;
  const tawk = window.Tawk_API;

  if (tawk && typeof tawk.hideWidget === 'function') {
    try {
      tawk.hideWidget();
    } catch (e) {
      console.warn('[Tawk] Failed to hide widget:', e);
    }
  }
}

export function TawkToChat() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Register global helpers
    window.openKpugiLiveChat = openTawkChat;
    window.hideKpugiLiveChat = hideTawkChat;

    const setAttrs = () => {
      try {
        if (isSignedIn && user && typeof window.Tawk_API?.setAttributes === 'function') {
          window.Tawk_API.setAttributes(
            {
              name: user.fullName || user.username || 'Kpugi User',
              email: user.primaryEmailAddress?.emailAddress || '',
              id: user.id,
            },
            (error: any) => {
              if (error) console.error('[Tawk] setAttributes error:', error);
            }
          );
        }
      } catch {
        // ignore
      }
    };

    // Pre-load hook: prepare hidden state
    window.Tawk_API.onBeforeLoad = function () {
      try {
        if (!window.__openTawkOnLoad && typeof window.Tawk_API?.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
      } catch {}
    };

    // On Load hook: hide widget unless user explicitly queued an open action
    window.Tawk_API.onLoad = function () {
      try {
        if (window.__openTawkOnLoad) {
          window.__openTawkOnLoad = false;
          if (typeof window.Tawk_API?.showWidget === 'function') {
            window.Tawk_API.showWidget();
          }
          if (typeof window.Tawk_API?.maximize === 'function') {
            window.Tawk_API.maximize();
          }
        } else {
          if (typeof window.Tawk_API?.hideWidget === 'function') {
            window.Tawk_API.hideWidget();
          }
        }
      } catch (e) {
        console.warn('[Tawk] onLoad handling error:', e);
      }
      setAttrs();
    };

    // When the user minimizes or closes the chat window, re-hide the launcher bubble
    window.Tawk_API.onChatMinimized = function () {
      try {
        if (typeof window.Tawk_API?.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
      } catch {}
    };

    window.Tawk_API.onChatHidden = function () {
      try {
        if (typeof window.Tawk_API?.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
      } catch {}
    };

    window.Tawk_API.onChatEnded = function () {
      try {
        if (typeof window.Tawk_API?.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
      } catch {}
    };

    // If script is already in memory from previous navigation
    if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
      const isMax = typeof window.Tawk_API.isChatMaximized === 'function' && window.Tawk_API.isChatMaximized();
      if (!isMax && !window.__openTawkOnLoad) {
        window.Tawk_API.hideWidget();
      }
      setAttrs();
    }

    // Listen for custom trigger events across the app
    const handleTrigger = () => openTawkChat();
    window.addEventListener('kpugi:open-chat', handleTrigger);

    // Inject Tawk.to script if not already present
    if (!document.getElementById('tawk-script')) {
      const s1 = document.createElement('script');
      s1.id = 'tawk-script';
      s1.async = true;
      s1.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      document.head.appendChild(s1);
    }

    return () => {
      window.removeEventListener('kpugi:open-chat', handleTrigger);
    };
  }, [user, isSignedIn]);

  return null;
}
