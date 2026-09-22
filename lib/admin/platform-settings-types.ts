export interface MarketplaceSettings {
  maintenanceMode: boolean;
  commissionRate: number; // e.g. 0.10 for 10%
  minViewsThreshold: number; // e.g. 100 views
  minWithdrawalAmount: number; // in NGN (e.g. 5000)
  minCampaignBudget: number; // in NGN (e.g. 10000)
  featuredFee: number; // in NGN (e.g. 2500)
  defaultCurrency: string; // NGN
  currencySymbol: string; // ₦
  supportEmail: string; // support@kpugi.com
}

export interface BrowseDiscoverySettings {
  heroMaxSlots: number; // e.g. 5
  heroAutoSlideIntervalSec: number; // e.g. 6
  defaultSortAlgorithm: 'trending' | 'newest' | 'cpm' | 'budget';
  activeCategories: string[];
  announcementBanner: {
    enabled: boolean;
    message: string;
    theme: 'info' | 'success' | 'warning';
    linkUrl?: string;
  };
  emptyStateTitle: string;
  emptyStateDescription: string;
}

export interface CampaignGovernanceSettings {
  approvalPolicy: 'admin_review' | 'instant_launch';
  autoCloseDepleted: boolean;
  allowedSocialPlatforms: {
    tiktok: boolean;
    instagram: boolean;
    youtube: boolean;
    twitter: boolean;
  };
  verificationWindowHours: number; // e.g. 48
  maxSubmissionsPerCreator: number; // e.g. 3
}

export interface CreatorUserPolicySettings {
  kycPolicy: 'strict' | 'threshold' | 'relaxed';
  kycThresholdAmount: number; // e.g. 50000 NGN
  followerMinimums: {
    tiktok: number;
    instagram: number;
    youtube: number;
  };
  requireOnboardingChecklist: boolean;
  flagViewVelocitySpikes: boolean;
  blockDuplicateBankAccounts: boolean;
}

export interface PlatformSettings {
  marketplace: MarketplaceSettings;
  browse: BrowseDiscoverySettings;
  campaigns: CampaignGovernanceSettings;
  users: CreatorUserPolicySettings;
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  marketplace: {
    maintenanceMode: false,
    commissionRate: 0.10,
    minViewsThreshold: 100,
    minWithdrawalAmount: 5000,
    minCampaignBudget: 10000,
    featuredFee: 2500,
    defaultCurrency: 'NGN',
    currencySymbol: '₦',
    supportEmail: 'support@kpugi.com',
  },
  browse: {
    heroMaxSlots: 5,
    heroAutoSlideIntervalSec: 6,
    defaultSortAlgorithm: 'trending',
    activeCategories: [
      'Tech',
      'Finance',
      'Lifestyle',
      'Fashion',
      'Food & Drink',
      'Gaming',
      'Beauty',
      'Sports',
    ],
    announcementBanner: {
      enabled: false,
      message: '',
      theme: 'info',
      linkUrl: '',
    },
    emptyStateTitle: 'No matching campaigns found',
    emptyStateDescription: 'Try adjusting your filters, searching for a different keyword, or check back soon for new briefs.',
  },
  campaigns: {
    approvalPolicy: 'admin_review',
    autoCloseDepleted: true,
    allowedSocialPlatforms: {
      tiktok: true,
      instagram: true,
      youtube: true,
      twitter: true,
    },
    verificationWindowHours: 48,
    maxSubmissionsPerCreator: 3,
  },
  users: {
    kycPolicy: 'strict',
    kycThresholdAmount: 50000,
    followerMinimums: {
      tiktok: 1000,
      instagram: 1000,
      youtube: 500,
    },
    requireOnboardingChecklist: true,
    flagViewVelocitySpikes: true,
    blockDuplicateBankAccounts: true,
  },
};
