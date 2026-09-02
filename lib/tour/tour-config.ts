import { DriveStep } from 'driver.js';

export interface RoleTourConfig {
  role: 'creator' | 'advertiser';
  steps: DriveStep[];
}

export const CREATOR_TOUR_STEPS: DriveStep[] = [
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

export const ADVERTISER_TOUR_STEPS: DriveStep[] = [
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
