export type BroadcastTag =
  | 'new_feature'
  | 'update'
  | 'action_required'
  | 'maintenance'
  | 'promotion'
  | 'tip';

export type TargetAudience = 'all' | 'creators' | 'brands';

export type BroadcastChannel = 'dashboard_banner' | 'in_app' | 'email';

export type BroadcastStatus = 'draft' | 'active' | 'paused' | 'archived';

export type CtaStyle = 'primary' | 'success' | 'outline';

export interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  tag: BroadcastTag;
  target_audience: TargetAudience;
  channels: BroadcastChannel[];
  has_cta: boolean;
  cta_label?: string | null;
  cta_url?: string | null;
  cta_style: CtaStyle;
  status: BroadcastStatus;
  email_subject?: string | null;
  email_preview_text?: string | null;
  sent_count: number;
  click_count: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export interface TagMetadata {
  label: string;
  emoji: string;
  badgeClass: string;
  borderClass: string;
  accentClass: string;
}

export const TAG_METADATA: Record<BroadcastTag, TagMetadata> = {
  new_feature: {
    label: 'New Feature',
    emoji: '🚀',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    accentClass: 'text-emerald-400',
  },
  update: {
    label: 'Platform Update',
    emoji: '📢',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    borderClass: 'border-indigo-500/30',
    accentClass: 'text-indigo-400',
  },
  action_required: {
    label: 'Action Required',
    emoji: '⚠️',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500/30',
    accentClass: 'text-amber-400',
  },
  maintenance: {
    label: 'Maintenance',
    emoji: '🛠️',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    borderClass: 'border-rose-500/30',
    accentClass: 'text-rose-400',
  },
  promotion: {
    label: 'Special Offer',
    emoji: '🎁',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderClass: 'border-purple-500/30',
    accentClass: 'text-purple-400',
  },
  tip: {
    label: 'Pro Tip',
    emoji: '💡',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    borderClass: 'border-cyan-500/30',
    accentClass: 'text-cyan-400',
  },
};

export const DEFAULT_SEED_BROADCASTS: BroadcastItem[] = [
  {
    id: 'broadcast-001',
    title: 'Instant Payout Settlements Are Now Live!',
    message: 'We have upgraded our payment infrastructure with Paystack. Approved video submission earnings can now be withdrawn directly to your Nigerian bank account with zero delay.',
    tag: 'new_feature',
    target_audience: 'creators',
    channels: ['dashboard_banner', 'in_app'],
    has_cta: true,
    cta_label: 'View Wallet & Payouts',
    cta_url: '/wallet',
    cta_style: 'primary',
    status: 'active',
    email_subject: '🚀 Instant Payout Settlements Are Now Live on Kpugi',
    email_preview_text: 'Withdraw your campaign earnings directly to your bank account with zero delay.',
    sent_count: 142,
    click_count: 38,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'broadcast-002',
    title: 'High-Velocity Video Verification Engine Deployed',
    message: 'Brands can now track live creator TikTok, Instagram Reels, and YouTube Shorts view velocity in real time directly from the campaign dashboard.',
    tag: 'update',
    target_audience: 'brands',
    channels: ['dashboard_banner'],
    has_cta: true,
    cta_label: 'Explore Active Campaigns',
    cta_url: '/b/dashboard',
    cta_style: 'primary',
    status: 'active',
    sent_count: 28,
    click_count: 12,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];
