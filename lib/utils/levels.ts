export interface CreatorLevelDef {
  level: number;
  title: string;
  icon: string;
  minEarnings: number;
  maxEarnings: number | null;
  cpmBonusPercent: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  gradient: string;
  description: string;
}

export const CREATOR_LEVELS: CreatorLevelDef[] = [
  {
    level: 1,
    title: 'Novice',
    icon: '⚪',
    minEarnings: 0,
    maxEarnings: 4999,
    cpmBonusPercent: 0,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    gradient: 'from-slate-500 to-slate-700',
    description: 'Standard Platform Access & Basic Campaigns',
  },
  {
    level: 2,
    title: 'Amateur',
    icon: '🔹',
    minEarnings: 5000,
    maxEarnings: 14999,
    cpmBonusPercent: 0,
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    gradient: 'from-blue-400 to-blue-600',
    description: 'Basic Rank Badge & Verified Creator Status',
  },
  {
    level: 3,
    title: 'Senior',
    icon: '🔷',
    minEarnings: 15000,
    maxEarnings: 34999,
    cpmBonusPercent: 2,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    gradient: 'from-indigo-500 to-blue-600',
    description: '+2% Bonus CPM Payout boost across campaigns',
  },
  {
    level: 4,
    title: 'Enthusiast',
    icon: '🎯',
    minEarnings: 35000,
    maxEarnings: 69999,
    cpmBonusPercent: 3,
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
    gradient: 'from-teal-500 to-emerald-600',
    description: '+3% Bonus CPM Payout & Campaign Priority',
  },
  {
    level: 5,
    title: 'Professional',
    icon: '🚀',
    minEarnings: 70000,
    maxEarnings: 99999,
    cpmBonusPercent: 5,
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
    gradient: 'from-sky-500 to-indigo-600',
    description: '+5% Bonus CPM & Accelerated Submissions Queue',
  },
  {
    level: 6,
    title: 'Expert',
    icon: '⚡',
    minEarnings: 100000,
    maxEarnings: 174999,
    cpmBonusPercent: 7,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    gradient: 'from-amber-400 to-orange-500',
    description: '100K Milestone! +7% Bonus CPM & Preferred Creator Badge',
  },
  {
    level: 7,
    title: 'Leader',
    icon: '🏅',
    minEarnings: 175000,
    maxEarnings: 274999,
    cpmBonusPercent: 9,
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-300',
    gradient: 'from-orange-500 to-amber-600',
    description: '+9% Bonus CPM & Fast-Track Instant Post Audits',
  },
  {
    level: 8,
    title: 'Veteran',
    icon: '🎖️',
    minEarnings: 275000,
    maxEarnings: 399999,
    cpmBonusPercent: 11,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    gradient: 'from-purple-500 to-indigo-600',
    description: '+11% Bonus CPM & High-Budget Escrow Access',
  },
  {
    level: 9,
    title: 'Master',
    icon: '🔥',
    minEarnings: 400000,
    maxEarnings: 549999,
    cpmBonusPercent: 13,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    gradient: 'from-rose-500 to-red-600',
    description: '+13% Bonus CPM & Exclusive Brand Direct Invites',
  },
  {
    level: 10,
    title: 'Ultimate',
    icon: '👑',
    minEarnings: 550000,
    maxEarnings: 699999,
    cpmBonusPercent: 15,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-400',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    description: '+15% Bonus CPM & 1-Click Express Bank Payouts',
  },
  {
    level: 11,
    title: 'Sapphire',
    icon: '💙',
    minEarnings: 700000,
    maxEarnings: 849999,
    cpmBonusPercent: 17,
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-400',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    description: '+17% Bonus CPM & Sapphire Elite Status',
  },
  {
    level: 12,
    title: 'Emerald',
    icon: '💚',
    minEarnings: 850000,
    maxEarnings: 999999,
    cpmBonusPercent: 19,
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-400',
    gradient: 'from-emerald-500 via-teal-600 to-green-600',
    description: '+19% Bonus CPM & Emerald Elite Status',
  },
  {
    level: 13,
    title: 'Ruby',
    icon: '❤️',
    minEarnings: 1000000,
    maxEarnings: 1499999,
    cpmBonusPercent: 22,
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-900',
    badgeBorder: 'border-red-400',
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    description: '1 Million Milestone! +22% Bonus CPM & Priority Support',
  },
  {
    level: 14,
    title: 'Diamond',
    icon: '💎',
    minEarnings: 1500000,
    maxEarnings: null,
    cpmBonusPercent: 25,
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-950',
    badgeBorder: 'border-cyan-400',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    description: 'Top Tier 15M+ Platform Rank! +25% Bonus CPM & VIP Dedicated Account Manager',
  },
];

export interface CreatorLevelCalculated {
  currentLevelNumber: number;
  levelInfo: CreatorLevelDef;
  nextLevelInfo: CreatorLevelDef | null;
  progressPercent: number;
  amountNeededForNextLevel: number;
  badgeLabel: string;
  cpmBonusPercent: number;
}

export function getCreatorLevel(totalEarned: number = 0): CreatorLevelCalculated {
  const earned = Math.max(0, totalEarned || 0);

  // Find level index where minEarnings <= earned
  let levelIdx = 0;
  for (let i = CREATOR_LEVELS.length - 1; i >= 0; i--) {
    if (earned >= CREATOR_LEVELS[i].minEarnings) {
      levelIdx = i;
      break;
    }
  }

  const levelInfo = CREATOR_LEVELS[levelIdx];
  const nextLevelInfo = levelIdx < CREATOR_LEVELS.length - 1 ? CREATOR_LEVELS[levelIdx + 1] : null;

  let progressPercent = 100;
  let amountNeededForNextLevel = 0;

  if (nextLevelInfo) {
    const range = nextLevelInfo.minEarnings - levelInfo.minEarnings;
    const currentDiff = earned - levelInfo.minEarnings;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentDiff / range) * 100)));
    amountNeededForNextLevel = nextLevelInfo.minEarnings - earned;
  }

  return {
    currentLevelNumber: levelInfo.level,
    levelInfo,
    nextLevelInfo,
    progressPercent,
    amountNeededForNextLevel,
    badgeLabel: `Lvl ${levelInfo.level} • ${levelInfo.title}`,
    cpmBonusPercent: levelInfo.cpmBonusPercent,
  };
}
