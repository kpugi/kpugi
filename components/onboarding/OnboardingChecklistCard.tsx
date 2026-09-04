'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  Compass,
  Link2,
  Building,
  PlusCircle,
  Trophy,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
  icon: React.ElementType;
}

const CREATOR_CHECKLIST_TASKS: ChecklistTask[] = [
  {
    id: 'creator_profile',
    title: 'Complete Creator Profile',
    description: 'Set your display name and bio so brands understand your niche.',
    actionUrl: '/c/settings',
    actionLabel: 'Edit Profile',
    icon: CheckCircle2,
  },
  {
    id: 'creator_social',
    title: 'Connect at least 1 Social Account',
    description: 'Link your Instagram, TikTok, or YouTube to verify post metrics.',
    actionUrl: '/c/accounts',
    actionLabel: 'Connect Accounts',
    icon: Link2,
  },
  {
    id: 'creator_browse',
    title: 'Browse Live Campaign Catalogue',
    description: 'Explore available brand campaigns and check submission criteria.',
    actionUrl: '/browse',
    actionLabel: 'Explore Briefs',
    icon: Compass,
  },
  {
    id: 'creator_bank',
    title: 'Add Bank Account for Payouts',
    description: 'Add your Nigerian bank account to receive direct Friday payout deposits.',
    actionUrl: '/c/wallet',
    actionLabel: 'Add Bank Account',
    icon: CreditCard,
  },
  {
    id: 'creator_first_submission',
    title: 'Submit your First Post Link',
    description: 'Join a campaign, post on your feed, and submit the link to start counting views.',
    actionUrl: '/c/campaigns',
    actionLabel: 'View Campaigns',
    icon: Zap,
  },
];

const ADVERTISER_CHECKLIST_TASKS: ChecklistTask[] = [
  {
    id: 'advertiser_profile',
    title: 'Complete Brand Setup',
    description: 'Confirm your company details, website, and agree to platform guidelines.',
    actionUrl: '/b/settings',
    actionLabel: 'Brand Settings',
    icon: Building,
  },
  {
    id: 'advertiser_settings',
    title: 'Complete Company & Billing Info',
    description: 'Add your official website and billing email to customize campaign invoices.',
    actionUrl: '/b/settings',
    actionLabel: 'Brand Settings',
    icon: ShieldCheck,
  },
  {
    id: 'advertiser_wallet',
    title: 'Add Campaign Budget',
    description: 'Fund your wallet with 100% money-back protection and guaranteed payouts.',
    actionUrl: '/b/wallet',
    actionLabel: 'Fund Wallet',
    icon: CreditCard,
  },
  {
    id: 'advertiser_create_campaign',
    title: 'Create Your First Campaign Brief',
    description: 'Set your budget, target creators, and write your campaign requirements.',
    actionUrl: '/b/campaigns/new',
    actionLabel: 'Create Campaign',
    icon: PlusCircle,
  },
  {
    id: 'advertiser_review_posts',
    title: 'Review Creator Submissions',
    description: 'Approve delivered post links and monitor verified real-time views.',
    actionUrl: '/b/campaigns',
    actionLabel: 'Track Submissions',
    icon: Zap,
  },
];

interface OnboardingChecklistCardProps {
  role: 'creator' | 'advertiser';
  initialState?: Record<string, boolean>;
  onStartTour?: () => void;
  className?: string;
}

export default function OnboardingChecklistCard({
  role,
  initialState = {},
  onStartTour,
  className = '',
}: OnboardingChecklistCardProps) {
  const isCreator = role === 'creator';
  const tasks = isCreator ? CREATOR_CHECKLIST_TASKS : ADVERTISER_CHECKLIST_TASKS;

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    [tasks[0].id]: true,
    ...initialState,
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`kpugi_quest_dismissed_${role}`) === 'true';
    }
    return false;
  });
  const [isForceExpanded, setIsForceExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Sync initialState prop changes
  useEffect(() => {
    if (initialState && Object.keys(initialState).length > 0) {
      setCompletedSteps((prev) => ({
        ...prev,
        ...initialState,
        [tasks[0].id]: true,
      }));
    }
  }, [initialState, tasks]);

  // Fetch persisted and live computed checklist state on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchState() {
      try {
        const res = await fetch('/api/onboarding/progress');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.onboarding_checklist_dismissed) {
              setIsDismissed(true);
            }
            if (data.onboarding_checklist_state) {
              setCompletedSteps((prev) => ({
                ...prev,
                ...data.onboarding_checklist_state,
                [tasks[0].id]: true,
              }));
            }
          }
        }
      } catch (err) {
        console.error('[OnboardingChecklistCard] Failed to fetch state:', err);
      }
    }
    fetchState();
    return () => {
      isMounted = false;
    };
  }, [tasks]);

  const completedCount = tasks.filter((t) => completedSteps[t.id]).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const isAllComplete = completedCount === tasks.length;

  // Trigger celebration on 100% completion
  useEffect(() => {
    if (isAllComplete && !hasCelebrated) {
      setHasCelebrated(true);
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#2F49E8', '#17A75B', '#FFD700', '#7B96FF'],
        });
      } catch {}
    }
  }, [isAllComplete, hasCelebrated]);

  const handleDismiss = async () => {
    setIsDismissed(true);
    localStorage.setItem(`kpugi_quest_dismissed_${role}`, 'true');
    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss-checklist', role }),
      });
    } catch (err) {
      console.error('[OnboardingChecklistCard] Failed to dismiss checklist:', err);
    }
  };

  const toggleTask = async (taskId: string) => {
    const nextVal = !completedSteps[taskId];
    const newSteps = { ...completedSteps, [taskId]: nextVal };
    setCompletedSteps(newSteps);

    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-checklist-step',
          stepId: taskId,
          completed: nextVal,
        }),
      });
    } catch (err) {
      console.error('[OnboardingChecklistCard] Failed to persist task toggle:', err);
    }
  };

  // If dismissed, remove completely from view
  if (isDismissed) {
    return null;
  }

  // Option A Completed State: Compact 1-line achievement ribbon
  if (isAllComplete && !isForceExpanded) {
    return (
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20 text-kpugi-ink dark:text-white transition-all ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs sm:text-sm font-bold text-kpugi-ink dark:text-white">
                {isCreator ? 'Creator Setup Quest Complete! 🎉' : 'Brand Launch Quest Complete! 🎉'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                5/5 Ready
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-kpugi-slate dark:text-slate-400 mt-0.5">
              {isCreator
                ? "You're 100% primed to join brand campaigns and earn weekly payouts."
                : 'Your workspace is ready to launch high-reach creator campaigns.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setIsForceExpanded(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            Review Steps
          </button>
          <button
            onClick={handleDismiss}
            title="Dismiss from dashboard"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <X className="w-4 h-4" />
            <span className="sm:hidden">Dismiss</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-[#0D1017] shadow-sm overflow-hidden transition-all ${className}`}
    >
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-white/[0.03] border-b border-kpugi-border dark:border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-kpugi-blue/10 dark:bg-kpugi-blue/20 text-kpugi-blue dark:text-[#7B96FF] flex items-center justify-center shrink-0">
            {isAllComplete ? <Trophy className="w-5 h-5 text-amber-500" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg text-kpugi-ink dark:text-white">
                {isCreator ? 'Setup Quest' : 'Launch Quest'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-kpugi-blue dark:text-blue-400">
                {completedCount}/{tasks.length} Completed
              </span>
            </div>
            <p className="text-xs text-kpugi-slate dark:text-slate-400 mt-0.5">
              {isAllComplete
                ? 'All set! You are primed to earn & collaborate on Kpugi.'
                : 'Complete these quick milestones to maximize your campaign reach.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-kpugi-slate dark:text-slate-300 border border-kpugi-border dark:border-white/10 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-kpugi-blue" />
              <span>Take Tour</span>
            </button>
          )}

          {isForceExpanded && (
            <button
              onClick={() => setIsForceExpanded(false)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Collapse
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Clean Solid Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-kpugi-blue"
        />
      </div>

      {/* Task List */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-6 space-y-3"
          >
            {tasks.map((task, index) => {
              const done = !!completedSteps[task.id];

              return (
                <div
                  key={task.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                    done
                      ? 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 opacity-75'
                      : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/10 hover:border-kpugi-blue/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 sm:mt-0 p-0.5 rounded-lg text-kpugi-slate hover:text-kpugi-blue transition-colors shrink-0"
                    >
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600 hover:text-kpugi-blue" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-sans text-xs sm:text-sm font-bold ${
                            done
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-kpugi-ink dark:text-white'
                          }`}
                        >
                          {index + 1}. {task.title}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-kpugi-slate dark:text-slate-400 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Link
                      href={task.actionUrl}
                      {...((!task.actionUrl.startsWith('/c/') && !task.actionUrl.startsWith('/b/'))
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      onClick={() => {
                        if (!done) toggleTask(task.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        done
                          ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                          : 'bg-kpugi-blue text-white hover:bg-blue-700 shadow-sm'
                      }`}
                    >
                      <span>{task.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
