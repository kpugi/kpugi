"use client";

import React, { useState, useEffect } from "react";
import Announcement7 from "@/components/common/Announcement7";
import {
  BroadcastItem,
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

  return (
    <div className="w-full animate-fadeIn mb-6">
      <Announcement7
        title={activeBanner.title}
        message={activeBanner.message}
        tag={activeBanner.tag}
        ctaText={activeBanner.cta_label || "Try it now"}
        ctaLink={activeBanner.cta_url || undefined}
        showCta={!!(activeBanner.has_cta && activeBanner.cta_label && activeBanner.cta_url)}
        onCtaClick={() => handleCtaClick(activeBanner.id)}
        onDismiss={() => handleDismiss(activeBanner.id)}
      />
    </div>
  );
}
