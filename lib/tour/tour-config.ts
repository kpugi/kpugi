import { DriveStep } from 'driver.js';

export interface RoleTourConfig {
  role: 'creator' | 'advertiser';
  steps: DriveStep[];
}

/**
 * Checks if a tour step targets an element inside the mobile navigation drawer
 */
export function isDrawerStep(element?: string | Element | (() => Element) | null): boolean {
  if (typeof element === 'string') {
    return element.startsWith('#mobile-');
  }
  if (typeof element === 'function') {
    try {
      const el = element();
      return !!el && 'id' in el && typeof el.id === 'string' && el.id.startsWith('mobile-');
    } catch {
      return false;
    }
  }
  if (element && 'id' in element && typeof element.id === 'string') {
    return element.id.startsWith('mobile-');
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// DESKTOP TOUR STEPS (Width >= 768px)
// ─────────────────────────────────────────────────────────────

export const CREATOR_DESKTOP_STEPS: DriveStep[] = [
  {
    element: '#tour-creator-overview-greeting',
    popover: {
      title: '👋 Welcome to your Creator Hub!',
      description: 'This is your central command center. Track your active campaigns, see your live view counts update, and watch your weekly earnings grow.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-creator-hourly-timer',
    popover: {
      title: '⏱️ Live Hourly View Updates',
      description: 'Kpugi automatically checks your post views every 60 minutes. As more people watch your videos or posts, your earnings climb automatically!',
      side: 'bottom',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-creator-campaigns-nav',
    popover: {
      title: '🎯 Explore Paid Campaigns',
      description: 'Browse paid gigs from Nigerian brands on Instagram, TikTok, YouTube, and X. Pick campaigns you like and join in seconds.',
      side: 'right',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-creator-submissions-nav',
    popover: {
      title: '🔗 Submit Your Post Links',
      description: 'Once your content is live on your social feed, paste the link here. We will start counting your views immediately.',
      side: 'right',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-creator-accounts-nav',
    popover: {
      title: '✨ Connect Your Socials',
      description: 'Link your Instagram, TikTok, or YouTube channels so brands can discover your reach and approve you for high-paying deals.',
      side: 'right',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-creator-wallet-nav',
    popover: {
      title: '💸 Guaranteed Weekly Payouts',
      description: 'Brand budgets are 100% pre-funded and safe. Your earnings are transferred straight to your Nigerian bank account every Friday!',
      side: 'right',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-header-help-btn',
    popover: {
      title: '💡 Need Help? We Got You!',
      description: 'Click this help button anytime to replay this tour, check quick guides, or chat with our AI assistant.',
      side: 'bottom',
      align: 'end',
      popoverClass: 'kpugi-tour-popover',
    },
  },
];

export const ADVERTISER_DESKTOP_STEPS: DriveStep[] = [
  {
    element: '#tour-brand-overview-greeting',
    popover: {
      title: '🏢 Welcome to Brand Headquarters',
      description: 'Launch creator campaigns in minutes, reach millions of active Nigerian customers, and only pay for real, verified views.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-brand-create-btn',
    popover: {
      title: '🚀 Launch a Campaign in 2 Minutes',
      description: 'Set your target audience, pick content types (Reels, TikToks, WhatsApp status, Posts), and set your budget with ease.',
      side: 'bottom',
      align: 'end',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-brand-campaigns-nav',
    popover: {
      title: '📊 Manage Live Campaigns & Posts',
      description: 'See creator posts the moment they go live, monitor real-time view growth, and track your brand reach effortlessly.',
      side: 'right',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-brand-wallet-nav',
    popover: {
      title: '🔒 100% Protected Ad Budget',
      description: 'Your budget is completely protected and only released when creators deliver real, verified views matching your brief requirements.',
      side: 'right',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-header-help-btn',
    popover: {
      title: '💡 Help & Quickstart Guides',
      description: 'Click here anytime to replay this product tour, explore campaign tips, or chat with support.',
      side: 'bottom',
      align: 'end',
      popoverClass: 'kpugi-tour-popover',
    },
  },
];

// ─────────────────────────────────────────────────────────────
// MOBILE TOUR STEPS (Width < 768px)
// Seamlessly opens navigation slide-over drawer to highlight links
// ─────────────────────────────────────────────────────────────

export const CREATOR_MOBILE_STEPS: DriveStep[] = [
  {
    element: '#tour-creator-overview-greeting',
    popover: {
      title: '👋 Welcome to Creator Hub!',
      description: 'Your command center on mobile. Track campaigns, view live hourly view counts, and check Friday payouts.',
      side: 'bottom',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-creator-hourly-timer',
    popover: {
      title: '⏱️ Live Hourly View Updates',
      description: 'Kpugi checks your views every 60 minutes automatically. As views climb, your earnings rise!',
      side: 'bottom',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-mobile-menu-btn',
    popover: {
      title: '📱 Main Navigation Menu',
      description: 'Tap this icon anytime to access all your pages. Next, let’s slide it open to see what’s inside!',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#mobile-tour-creator-campaigns-nav',
    popover: {
      title: '🎯 Explore Paid Campaigns',
      description: 'Browse paid drops from verified Nigerian brands on TikTok, Reels, YouTube, and X. Claim slots in seconds.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#mobile-tour-creator-submissions-nav',
    popover: {
      title: '🔗 Submit Your Post Links',
      description: 'Once you post on social media, paste your URL here so automated 60-minute audits start tracking views.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#mobile-tour-creator-accounts-nav',
    popover: {
      title: '✨ Connect Your Channels',
      description: 'Verify your TikTok, Instagram, or YouTube handles using our zero-password Code-in-Bio protocol.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#mobile-tour-creator-wallet-nav',
    popover: {
      title: '💸 Guaranteed Friday Payouts',
      description: 'Budgets are 100% pre-funded in escrow. Earnings disburse straight to your Nigerian bank account every Friday.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-header-help-btn',
    popover: {
      title: '💡 Need Help? We Got You!',
      description: 'Tap this icon anytime to replay this tour, check compliance rules, or chat with KpugiBot AI support.',
      side: 'bottom',
      align: 'end',
      popoverClass: 'kpugi-tour-popover',
    },
  },
];

export const ADVERTISER_MOBILE_STEPS: DriveStep[] = [
  {
    element: '#tour-brand-overview-greeting',
    popover: {
      title: '🏢 Brand Headquarters',
      description: 'Launch creator campaigns in minutes, reach active Nigerian audiences, and only pay for verified views.',
      side: 'bottom',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-brand-create-btn',
    popover: {
      title: '🚀 Launch a Campaign',
      description: 'Set your target audience, choose video/image formats, and set your budget cap with ease.',
      side: 'bottom',
      align: 'center',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-mobile-menu-btn',
    popover: {
      title: '📱 Brand Navigation Menu',
      description: 'Tap here anytime to manage live campaigns, escrow balances, and settings. Let’s open it!',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#mobile-tour-brand-campaigns-nav',
    popover: {
      title: '📊 Manage Live Campaigns',
      description: 'See creator submissions the moment they go live, track view growth, and review post performance.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#mobile-tour-brand-wallet-nav',
    popover: {
      title: '🔒 100% Protected Escrow',
      description: 'Your budget is locked securely and only released when creators deliver real, verified views exceeding 1k.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'kpugi-tour-popover',
    },
  },
  {
    element: '#tour-header-help-btn',
    popover: {
      title: '💡 Help & Quickstart Guides',
      description: 'Tap here anytime to replay this tour, explore campaign tips, or chat with human support.',
      side: 'bottom',
      align: 'end',
      popoverClass: 'kpugi-tour-popover',
    },
  },
];

// Backwards-compatible aliases
export const CREATOR_TOUR_STEPS = CREATOR_DESKTOP_STEPS;
export const ADVERTISER_TOUR_STEPS = ADVERTISER_DESKTOP_STEPS;

/**
 * Returns the appropriate tour steps according to role and device viewport
 */
export function getTourSteps(role: 'creator' | 'advertiser', isMobile: boolean): DriveStep[] {
  if (role === 'creator') {
    return isMobile ? CREATOR_MOBILE_STEPS : CREATOR_DESKTOP_STEPS;
  }
  return isMobile ? ADVERTISER_MOBILE_STEPS : ADVERTISER_DESKTOP_STEPS;
}
