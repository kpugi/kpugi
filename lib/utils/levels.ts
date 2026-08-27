export interface CreatorLevelDef {
  level: number;
  title: string;
  icon: string;
  minEarnings: number;
  maxEarnings: number | null;
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
    maxEarnings: 24999,
    badgeBg: 'bg-slate-100 dark:bg-white/10',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-300 dark:border-white/10',
    gradient: 'from-slate-500 to-slate-700',
    description: 'Standard Platform Access & Open Campaigns',
  },
  {
    level: 2,
    title: 'Amateur',
    icon: '🔹',
    minEarnings: 25000,
    maxEarnings: 74999,
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-500/30',
    gradient: 'from-blue-400 to-blue-600',
    description: 'Verified Creator Rank Badge & Campaign Access',
  },
  {
    level: 3,
    title: 'Enthusiast',
    icon: '🎯',
    minEarnings: 75000,
    maxEarnings: 199999,
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-300',
    badgeBorder: 'border-teal-200 dark:border-teal-500/30',
    gradient: 'from-teal-500 to-emerald-600',
    description: 'Accelerated Submission Verification Queue',
  },
  {
    level: 4,
    title: 'Senior',
    icon: '🔷',
    minEarnings: 200000,
    maxEarnings: 499999,
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-500/30',
    gradient: 'from-indigo-500 to-blue-600',
    description: 'Senior Creator Rank Status & Standard Post Audits',
  },
  {
    level: 5,
    title: 'Professional',
    icon: '🚀',
    minEarnings: 500000,
    maxEarnings: 999999,
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200 dark:border-sky-500/30',
    gradient: 'from-sky-500 to-indigo-600',
    description: 'Priority Audit Queue & Preferred Campaign Access',
  },
  {
    level: 6,
    title: 'Expert',
    icon: '⚡',
    minEarnings: 1000000,
    maxEarnings: 1999999,
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-500/30',
    gradient: 'from-amber-400 to-orange-500',
    description: '1 Million Milestone! Expert Badge & Fast Audit Clearance',
  },
  {
    level: 7,
    title: 'Leader',
    icon: '🏅',
    minEarnings: 2000000,
    maxEarnings: 3499999,
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-800 dark:text-orange-300',
    badgeBorder: 'border-orange-300 dark:border-orange-500/30',
    gradient: 'from-orange-500 to-amber-600',
    description: 'Fast-Track Verification & Leader Rank Badge',
  },
  {
    level: 8,
    title: 'Veteran',
    icon: '🎖️',
    minEarnings: 3500000,
    maxEarnings: 4999999,
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-500/30',
    gradient: 'from-purple-500 to-indigo-600',
    description: 'High-Budget Escrow Campaign Access & Veteran Badge',
  },
  {
    level: 9,
    title: 'Master',
    icon: '🔥',
    minEarnings: 5000000,
    maxEarnings: 7499999,
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-500/30',
    gradient: 'from-rose-500 to-red-600',
    description: 'Direct Brand Invites & Top Creator Directory Listing',
  },
  {
    level: 10,
    title: 'Ultimate',
    icon: '👑',
    minEarnings: 7500000,
    maxEarnings: 9999999,
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-900 dark:text-amber-200',
    badgeBorder: 'border-amber-400 dark:border-amber-500/40',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    description: '1-Click Express Bank Payouts & Priority Verification',
  },
  {
    level: 11,
    title: 'Sapphire',
    icon: '💙',
    minEarnings: 10000000,
    maxEarnings: 14999999,
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-900 dark:text-blue-200',
    badgeBorder: 'border-blue-400 dark:border-blue-500/40',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    description: 'Sapphire Elite Status & Featured Creator Spotlight',
  },
  {
    level: 12,
    title: 'Emerald',
    icon: '💚',
    minEarnings: 15000000,
    maxEarnings: 19999999,
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-900 dark:text-emerald-200',
    badgeBorder: 'border-emerald-400 dark:border-emerald-500/40',
    gradient: 'from-emerald-500 via-teal-600 to-green-600',
    description: 'Emerald Elite Status & High-Tier Sponsorship Access',
  },
  {
    level: 13,
    title: 'Ruby',
    icon: '❤️',
    minEarnings: 20000000,
    maxEarnings: 29999999,
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeText: 'text-red-900 dark:text-red-200',
    badgeBorder: 'border-red-400 dark:border-red-500/40',
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    description: 'Ruby VIP Badge & Dedicated Campaign Allocations',
  },
  {
    level: 14,
    title: 'Diamond',
    icon: '💎',
    minEarnings: 30000000,
    maxEarnings: null,
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    badgeText: 'text-cyan-950 dark:text-cyan-200',
    badgeBorder: 'border-cyan-400 dark:border-cyan-500/40',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    description: 'Top Tier Diamond Rank! Dedicated Account Specialist & Brand Retainers',
  },
];

export interface CreatorLevelCalculated {
  currentLevelNumber: number;
  levelInfo: CreatorLevelDef;
  nextLevelInfo: CreatorLevelDef | null;
  progressPercent: number;
  amountNeededForNextLevel: number;
  badgeLabel: string;
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
  };
}
