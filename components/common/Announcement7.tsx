'use client';

import React from 'react';
import { Button } from '@/components/base-ui/button';
import {
  HiSparkles,
  HiXMark,
  HiWrenchScrewdriver,
  HiExclamationTriangle,
  HiSpeakerWave,
  HiGift,
  HiLightBulb,
  HiBellAlert,
} from 'react-icons/hi2';

export interface Announcement7Props {
  title?: string;
  message?: string;
  tag?: string;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  onDismiss?: () => void;
  showCta?: boolean;
  className?: string;
}

interface TagConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}

function getTagConfig(tag?: string): TagConfig {
  if (!tag) {
    return {
      label: 'Announcement',
      icon: HiSpeakerWave,
      iconClass: 'text-brand-500 dark:text-brand-400',
    };
  }
  const normalized = tag.toLowerCase().replace(/[\s-]/g, '_');

  switch (normalized) {
    case 'maintenance':
      return {
        label: 'Maintenance',
        icon: HiWrenchScrewdriver,
        iconClass: 'text-amber-500 dark:text-amber-400',
      };
    case 'new_feature':
    case 'feature':
      return {
        label: 'New Feature',
        icon: HiSparkles,
        iconClass: 'text-brand-500 dark:text-brand-400',
      };
    case 'action_required':
    case 'action':
      return {
        label: 'Action Required',
        icon: HiExclamationTriangle,
        iconClass: 'text-rose-500 dark:text-rose-400',
      };
    case 'promotion':
    case 'promo':
    case 'offer':
      return {
        label: 'Promotion',
        icon: HiGift,
        iconClass: 'text-purple-500 dark:text-purple-400',
      };
    case 'tip':
      return {
        label: 'Pro Tip',
        icon: HiLightBulb,
        iconClass: 'text-cyan-500 dark:text-cyan-400',
      };
    case 'alert':
      return {
        label: 'System Alert',
        icon: HiBellAlert,
        iconClass: 'text-rose-500 dark:text-rose-400',
      };
    case 'update':
    default:
      return {
        label:
          normalized === 'update'
            ? 'Platform Update'
            : normalized
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()),
        icon: HiSpeakerWave,
        iconClass: 'text-brand-500 dark:text-brand-400',
      };
  }
}

export default function Announcement7({
  title,
  message = 'Stay tuned for new platform updates and announcements.',
  tag,
  ctaText = 'Learn More',
  ctaLink,
  onCtaClick,
  onDismiss,
  showCta = true,
  className = '',
}: Announcement7Props) {
  const tagConfig = getTagConfig(tag);
  const TagIcon = tagConfig.icon;

  // Tag is the title as requested:
  const displayTitle = tag ? tagConfig.label : (title || 'Announcement');

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (ctaLink) {
      if (ctaLink.startsWith('http')) {
        window.open(ctaLink, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = ctaLink;
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gray-50/90 dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 rounded-xl px-4 py-3 text-sm shadow-xs font-sans">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Tag icon sits where sparkles was */}
            <TagIcon className={`${tagConfig.iconClass} mt-1 size-5 shrink-0`} />

            <div className="space-y-1">
              <p className="font-display font-medium tracking-tight text-gray-900 dark:text-white">
                {displayTitle}
              </p>
              <p className="text-gray-600 dark:text-gray-300 font-sans leading-relaxed text-xs sm:text-sm">
                {message}
              </p>
            </div>
          </div>

          {/* Action buttons pinned to bottom right */}
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-end mt-2 sm:mt-0">
            {showCta && (
              <Button
                variant="default"
                onClick={handleCta}
                className="flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-sans text-xs sm:text-sm px-3.5 py-1.5 shadow-xs cursor-pointer transition-colors"
              >
                {ctaText}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/60 flex items-center gap-1.5 rounded-lg font-sans text-xs sm:text-sm px-3 py-1.5 cursor-pointer transition-colors"
            >
              <HiXMark className="size-4" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
