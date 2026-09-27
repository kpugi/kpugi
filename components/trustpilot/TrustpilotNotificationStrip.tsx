'use client';

import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useTrustpilot } from '@/lib/trustpilot/useTrustpilot';

interface TrustpilotNotificationStripProps {
  role?: 'creator' | 'advertiser';
  badgeLabel?: string;
  title?: string;
  description?: string;
  className?: string;
  onDismiss?: () => void;
}

export default function TrustpilotNotificationStrip({
  role = 'creator',
  badgeLabel = 'Community Feedback',
  title = 'Love using Kpugi?',
  description,
  className = '',
  onDismiss,
}: TrustpilotNotificationStripProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { evaluateUrl } = useTrustpilot();

  if (isDismissed) return null;

  const defaultDescription =
    role === 'advertiser'
      ? "How is your brand experience with Kpugi's view auditing and escrow budget protection? Share your review on Trustpilot to help fellow marketers discover authentic creator performance."
      : "Enjoying the automated view tracking and reliable bank settlements on Kpugi? Share your honest review on Trustpilot to help more Nigerian creators discover real earning opportunities.";

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Banner Widget */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 p-5 relative overflow-hidden transition-all shadow-sm">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 rounded-full opacity-50 pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[#00b67a] flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0">
            ★
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                {title}
              </span>
              <span className="text-[10px] bg-white dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30 shadow-2xs">
                {badgeLabel}
              </span>
            </div>
            <p className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed mb-3 font-satoshi">
              {description || defaultDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={evaluateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#00b67a] hover:bg-[#009b67] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Rate on Trustpilot</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-medium text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 underline underline-offset-2 transition cursor-pointer"
              >
                Not right now
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-emerald-700/60 dark:text-emerald-400/60 hover:text-emerald-900 dark:hover:text-emerald-200 p-1 rounded-lg transition cursor-pointer"
            title="Dismiss"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
