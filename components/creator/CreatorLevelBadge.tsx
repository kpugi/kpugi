'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCreatorLevel, CREATOR_LEVELS, CreatorLevelCalculated } from '@/lib/utils/levels';
import { formatCompactCurrency } from '@/lib/utils/format';
import { ShieldCheck, Zap, Sparkles, ChevronRight, Award, Trophy, Lock, CheckCircle2 } from 'lucide-react';

interface CreatorLevelBadgeProps {
  totalEarned?: number;
  variant?: 'pill' | 'widget' | 'badge-only';
  className?: string;
}

export default function CreatorLevelBadge({
  totalEarned = 0,
  variant = 'pill',
  className = '',
}: CreatorLevelBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const levelData: CreatorLevelCalculated = getCreatorLevel(totalEarned);
  const { levelInfo, nextLevelInfo, progressPercent, amountNeededForNextLevel, badgeLabel } = levelData;

  if (variant === 'pill') {
    return (
      <>
        <button
          onClick={() => setShowMatrixModal(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono font-bold transition-all shadow-2xs hover:scale-105 ${levelInfo.badgeBg} ${levelInfo.badgeText} ${levelInfo.badgeBorder} ${className}`}
          title={`Click to view all 14 Creator Levels (Current Rank: ${levelInfo.title})`}
        >
          <span>{levelInfo.icon}</span>
          <span>{badgeLabel}</span>
        </button>

        {showMatrixModal && mounted && <CreatorMatrixModal levelData={levelData} totalEarned={totalEarned} onClose={() => setShowMatrixModal(false)} />}
      </>
    );
  }

  if (variant === 'badge-only') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold border ${levelInfo.badgeBg} ${levelInfo.badgeText} ${levelInfo.badgeBorder} ${className}`}>
        <span>{levelInfo.icon}</span>
        <span>Lvl {levelInfo.level}</span>
      </span>
    );
  }

  // Dashboard Card Widget Variant
  return (
    <>
      <div className={`p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4 transition-colors duration-200 ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border ${levelInfo.badgeBg} ${levelInfo.badgeBorder}`}>
              {levelInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider font-mono">
                  Creator Rank Level {levelInfo.level}
                </span>
              </div>
              <h3 className="font-display font-extrabold text-xl text-kpugi-ink dark:text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                <span>{levelInfo.title}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowMatrixModal(true)}
            className="px-3 py-1.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-kpugi-ink dark:text-white text-xs font-bold font-sans transition-all flex items-center gap-1"
          >
            <span>All Ranks</span>
            <ChevronRight className="w-3.5 h-3.5 text-kpugi-slate dark:text-slate-400" />
          </button>
        </div>

        {/* Progress Bar to Next Level */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-kpugi-slate dark:text-slate-400 font-bold">
              Progress: <span className="text-kpugi-ink dark:text-white font-extrabold">{progressPercent}%</span>
            </span>
            {nextLevelInfo ? (
              <span className="text-kpugi-blue dark:text-blue-400 font-bold">
                Next: {nextLevelInfo.icon} {nextLevelInfo.title} ({formatCompactCurrency(amountNeededForNextLevel)} left)
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">💎 Max Rank Achieved!</span>
            )}
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${levelInfo.gradient}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Level Perk Note */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-kpugi-slate dark:text-slate-300 leading-snug">{levelInfo.description}</span>
          <Award className="w-4 h-4 text-kpugi-blue dark:text-blue-400 shrink-0 ml-2" />
        </div>
      </div>

      {showMatrixModal && mounted && <CreatorMatrixModal levelData={levelData} totalEarned={totalEarned} onClose={() => setShowMatrixModal(false)} />}
    </>
  );
}

function CreatorMatrixModal({
  levelData,
  totalEarned,
  onClose,
}: {
  levelData: CreatorLevelCalculated;
  totalEarned: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-[#0D111D] rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-kpugi-border dark:border-white/10 max-h-[90vh] overflow-y-auto font-sans text-kpugi-ink dark:text-white">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-kpugi-border dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-kpugi-blue/10 border border-kpugi-blue/20 flex items-center justify-center text-2xl shrink-0">
              <Trophy className="w-6 h-6 text-kpugi-blue dark:text-blue-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-kpugi-blue dark:text-blue-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                Kpugi Creator Gamification Ranks
              </div>
              <h3 className="font-display font-extrabold text-2xl text-kpugi-ink dark:text-white">
                14 Creator Levels & Platform Perks
              </h3>
              <p className="text-xs text-kpugi-slate dark:text-slate-400 mt-0.5">
                Earn platform payouts to level up from <span className="font-bold text-kpugi-ink dark:text-white">Novice</span> to <span className="font-bold text-cyan-600 dark:text-cyan-400">Diamond</span> and unlock priority audits, express payouts, and VIP brand retainers.
              </p>
            </div>
          </div>
        </div>

        {/* Current User Level Overview Card */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${levelData.levelInfo.badgeBg} ${levelData.levelInfo.badgeBorder}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{levelData.levelInfo.icon}</span>
            <div>
              <span className="text-[10px] font-mono font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider block">Your Current Status</span>
              <h4 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">
                Level {levelData.currentLevelNumber}: {levelData.levelInfo.title}
              </h4>
              <span className="text-xs text-kpugi-slate dark:text-slate-400 font-mono block mt-0.5">
                Total Platform Earnings: <strong className="text-kpugi-ink dark:text-white">{formatCompactCurrency(totalEarned)}</strong>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-kpugi-blue text-white font-mono font-extrabold text-xs inline-block shadow-xs">
              Rank Lvl {levelData.currentLevelNumber}
            </span>
          </div>
        </div>

        {/* Matrix Grid of 14 Levels */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          <span className="text-xs font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider font-mono block">
            All 14 Level Progression Tiers:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CREATOR_LEVELS.map((lvl) => {
              const isUnlocked = totalEarned >= lvl.minEarnings;
              const isCurrent = levelData.currentLevelNumber === lvl.level;

              return (
                <div
                  key={lvl.level}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isCurrent
                      ? 'bg-white dark:bg-[#161B2E] border-kpugi-blue dark:border-blue-500 ring-2 ring-kpugi-blue/20 shadow-md'
                      : isUnlocked
                      ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-90'
                      : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl shrink-0 mt-0.5">{lvl.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-extrabold text-sm text-kpugi-ink dark:text-white">
                          Lvl {lvl.level} • {lvl.title}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-kpugi-blue text-white uppercase font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-kpugi-slate dark:text-slate-400 block mt-0.5">
                        {formatCompactCurrency(lvl.minEarnings)}
                        {lvl.maxEarnings ? ` - ${formatCompactCurrency(lvl.maxEarnings)}` : '+'}
                      </span>
                      <p className="text-[11px] text-kpugi-slate dark:text-slate-400 leading-tight mt-1">
                        {lvl.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-kpugi-ink dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black font-sans text-xs font-bold transition-all shadow-sm"
          >
            Close Ranks Matrix
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
