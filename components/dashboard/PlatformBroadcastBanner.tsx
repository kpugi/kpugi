"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  BroadcastItem,
  TAG_METADATA,
} from "@/lib/admin/platform-broadcasts-types";
import {
  getActiveDashboardBannersAction,
  trackBroadcastClickAction,
} from "@/app/actions/admin-broadcasts";

interface PlatformBroadcastBannerProps {
  role: "creator" | "advertiser";
}

export default function PlatformBroadcastBanner({
  role,
}: PlatformBroadcastBannerProps) {
  const [banners, setBanners] = useState<BroadcastItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Read dismissed banners from localStorage
    try {
      const stored = localStorage.getItem("kpugi_dismissed_broadcasts");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }

    // Fetch active banners
    getActiveDashboardBannersAction(role)
      .then((data) => {
        setBanners(data || []);
      })
      .catch((err) => {
        console.warn("[PlatformBroadcastBanner] Fetch error:", err);
      })
      .finally(() => {
        setLoaded(true);
      });
  }, [role]);

  const handleDismiss = (id: string) => {
    const nextDismissed = [...dismissedIds, id];
    setDismissedIds(nextDismissed);
    try {
      localStorage.setItem(
        "kpugi_dismissed_broadcasts",
        JSON.stringify(nextDismissed)
      );
    } catch {
      // Ignore
    }
  };

  const handleCtaClick = (id: string) => {
    trackBroadcastClickAction(id).catch(() => {});
  };

  if (!loaded) return null;

  // Filter out dismissed banners
  const visibleBanners = banners.filter((b) => !dismissedIds.includes(b.id));

  if (visibleBanners.length === 0) return null;

  // Display top banner
  const activeBanner = visibleBanners[0];
  const tagInfo = TAG_METADATA[activeBanner.tag] || TAG_METADATA.update;

  const getCtaButtonClasses = () => {
    switch (activeBanner.cta_style) {
      case "success":
        return "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs";
      case "outline":
        return "bg-transparent border border-slate-700 dark:border-slate-500 text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5";
      default:
        return "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs";
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0E1528] to-slate-900 border ${tagInfo.borderClass} text-white shadow-xl relative overflow-hidden`}
      >
        {/* Top Meta Row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${tagInfo.badgeClass}`}
            >
              <span>{tagInfo.emoji}</span>
              <span>{tagInfo.label}</span>
            </span>

            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded">
              Platform Notice
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleDismiss(activeBanner.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5 pr-6">
          <h3 className="text-sm sm:text-base font-bold font-display text-white tracking-tight">
            {activeBanner.title}
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {activeBanner.message}
          </p>
        </div>

        {/* CTA Button */}
        {activeBanner.has_cta && activeBanner.cta_label && activeBanner.cta_url && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            {activeBanner.cta_url.startsWith("http") ? (
              <a
                href={activeBanner.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleCtaClick(activeBanner.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${getCtaButtonClasses()}`}
              >
                <span>{activeBanner.cta_label}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Link
                href={activeBanner.cta_url}
                onClick={() => handleCtaClick(activeBanner.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${getCtaButtonClasses()}`}
              >
                <span>{activeBanner.cta_label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
