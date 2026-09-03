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

export const FRESHDESK_PORTAL_URL =
  process.env.NEXT_PUBLIC_FRESHDESK_PORTAL_URL || 'https://support.kpugi.com';

/**
 * Direct links to Freshdesk hosted portals on custom domain
 */
export const FRESHDESK_LINKS = {
  home: `${FRESHDESK_PORTAL_URL}/support/home`,
  knowledgeBase: `${FRESHDESK_PORTAL_URL}/support/solutions`,
  communityForums: `${FRESHDESK_PORTAL_URL}/support/discussions`,
  submitTicket: `${FRESHDESK_PORTAL_URL}/support/tickets/new`,
  myTickets: `${FRESHDESK_PORTAL_URL}/support/tickets`,
};

/**
 * Opens the Freshdesk / Freshchat AI widget programmatically.
 */
export function openFreshdeskWidget() {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;
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

    window.open(FRESHDESK_LINKS.home, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.warn('[Freshdesk] Failed to open widget:', err);
    window.open(FRESHDESK_LINKS.home, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Hides the floating launcher bubble of the Freshdesk in-app widget.
 */
export function hideFreshdeskWidget() {
  if (typeof window === 'undefined') return;
  try {
    if (window.fdWidget && typeof window.fdWidget.hide === 'function') {
      window.fdWidget.hide();
    } else if (typeof window.FreshworksWidget === 'function') {
      window.FreshworksWidget('hide');
    }
  } catch (err) {
    console.warn('[Freshdesk] Failed to hide widget:', err);
  }
}

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

