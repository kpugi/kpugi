'use client';

declare global {
  interface Window {
    fdWidget?: {
      init: (config: {
        token: string;
        host: string;
        widgetId: string;
        jwtAuthToken?: string;
        config?: Record<string, any>;
      }) => void;
      open: () => void;
      close: () => void;
      hide: () => void;
      show: () => void;
      user?: {
        setProperties: (props: Record<string, any>) => void;
      };
      track?: (eventName: string, data?: Record<string, any>) => void;
    };
    fcWidgetMessengerConfig?: Record<string, any>;
    FreshworksWidget?: {
      (action: 'open' | 'close' | 'show' | 'hide' | 'destroy'): void;
      (action: 'identify', entity: 'user', data: { name?: string; email?: string }): void;
      (action: 'set', entity: string, data: Record<string, any>): void;
      q?: any[];
    };
    fwSettings?: {
      widget_id?: string;
    };
  }
}

import { FRESHDESK_PORTAL_URL, FRESHDESK_LINKS, STATUS_PAGE_URL } from './freshdesk-constants';
export { FRESHDESK_PORTAL_URL, FRESHDESK_LINKS, STATUS_PAGE_URL };

/**
 * Opens the Live Support chat widget programmatically (Tawk.to, with Freshdesk fallback).
 */
export function openFreshdeskWidget() {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;

    // 1. Prioritize Tawk.to if available
    if (w.Tawk_API && typeof w.Tawk_API.maximize === 'function') {
      try {
        if (typeof w.Tawk_API.showWidget === 'function') {
          w.Tawk_API.showWidget();
        }
        w.Tawk_API.maximize();
        return;
      } catch (err) {
        console.warn('[Support] Failed to open Tawk chat:', err);
      }
    }

    if (typeof w.openKpugiLiveChat === 'function') {
      w.openKpugiLiveChat();
      return;
    }

    // If Tawk is script-injected but still loading, queue it and fire custom event
    w.__openTawkOnLoad = true;
    window.dispatchEvent(new CustomEvent('kpugi:open-chat'));

    const widget = w.fdWidget || w.fcWidget || w.fwWidget;

    if (widget) {
      if (typeof widget.show === 'function') {
        widget.show();
      }
      if (typeof widget.open === 'function') {
        widget.open();
        // If widget is still loading its internal iframe, also open once ready
        if (typeof widget.isLoaded === 'function' && !widget.isLoaded() && typeof widget.on === 'function') {
          widget.on('widget:loaded', () => {
            try {
              widget.show();
              widget.open();
            } catch {}
          });
        }
        return;
      }
    }

    if (typeof w.FreshworksWidget === 'function') {
      w.FreshworksWidget('show');
      w.FreshworksWidget('open');
      return;
    }

    // Only fallback to external URL if Tawk script is not present
    if (!document.getElementById('tawk-script')) {
      window.open(FRESHDESK_LINKS.home, '_blank', 'noopener,noreferrer');
    }
  } catch (err) {
    console.warn('[Support] Failed to open widget:', err);
  }
}

export const openLiveChat = openFreshdeskWidget;

/**
 * Hides the floating launcher bubble of the support widget (Tawk / Freshdesk).
 */
export function hideFreshdeskWidget() {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;
    if (w.Tawk_API && typeof w.Tawk_API.hideWidget === 'function') {
      w.Tawk_API.hideWidget();
    }
    if (typeof w.hideKpugiLiveChat === 'function') {
      w.hideKpugiLiveChat();
    }
    if (window.fdWidget && typeof window.fdWidget.hide === 'function') {
      window.fdWidget.hide();
    } else if (typeof window.FreshworksWidget === 'function') {
      window.FreshworksWidget('hide');
    }
  } catch (err) {
    console.warn('[Freshdesk] Failed to hide widget:', err);
  }
}

export const hideLiveChat = hideFreshdeskWidget;

/**
 * Closes the Freshdesk in-app widget window.
 */
export function closeFreshdeskWidget() {
  if (typeof window === 'undefined') return;
  try {
    if (window.fdWidget && typeof window.fdWidget.close === 'function') {
      window.fdWidget.close();
      if (typeof window.fdWidget.hide === 'function') {
        window.fdWidget.hide();
      }
    } else if (typeof window.FreshworksWidget === 'function') {
      window.FreshworksWidget('close');
      window.FreshworksWidget('hide');
    }
  } catch (err) {
    console.warn('[Freshdesk] Failed to close widget:', err);
  }
}

/**
 * Identifies the authenticated Clerk user in Freshdesk.
 */
export function setFreshdeskUser(name: string, email: string, externalId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;
    const parts = name.trim().split(' ');
    const firstName = parts[0] || name;
    const lastName = parts.slice(1).join(' ') || '';

    if (w.fdWidget && w.fdWidget.user) {
      if (typeof w.fdWidget.user.update === 'function') {
        w.fdWidget.user.update({
          firstName,
          lastName,
          email,
          ...(externalId ? { externalId } : {}),
        });
      }
      if (typeof w.fdWidget.user.setProperties === 'function') {
        w.fdWidget.user.setProperties({
          firstName,
          lastName,
          email,
          ...(externalId ? { externalId } : {}),
        });
      }
    } else if (typeof w.FreshworksWidget === 'function') {
      w.FreshworksWidget('identify', 'user', {
        name,
        email,
      });
    }
  } catch (err) {
    console.warn('[Freshdesk] Failed to identify user:', err);
  }
}

/**
 * Authenticates the user with Freshdesk using a signed JWT token.
 */
export function authenticateFreshdeskUser(jwtToken: string) {
  if (typeof window === 'undefined' || !jwtToken) return;
  try {
    if (typeof (window.fdWidget?.user as any)?.authenticate === 'function') {
      (window.fdWidget!.user as any).authenticate({ token: jwtToken });
    } else if (typeof (window as any).fcWidget?.user?.authenticate === 'function') {
      (window as any).fcWidget.user.authenticate({ token: jwtToken });
    }
  } catch (err) {
    console.warn('[Freshdesk] Failed to authenticate user with JWT:', err);
  }
}

