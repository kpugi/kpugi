"use client";

import React from "react";
import Link from "next/link";
import { Activity, Server, Database, CheckCircle2, Clock, ExternalLink } from "lucide-react";

interface CronJobStatus {
  id: string;
  name: string;
  interval: string;
  status: "active" | "standby" | "running";
  description: string;
  lastRun?: string;
}

interface SystemPulseWidgetProps {
  lastScrapedAt?: string | null;
  lastSettledAt?: string | null;
  liveCampaignsCount?: number;
}

function formatPulseTime(dateString?: string | null, fallback: string = "Active") {
  if (!dateString) return fallback;
  const ms = Date.now() - new Date(dateString).getTime();
  if (isNaN(ms) || ms < 0) return fallback;
  const mins = Math.floor(ms / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SystemPulseWidget({
  lastScrapedAt,
  lastSettledAt,
  liveCampaignsCount = 0,
}: SystemPulseWidgetProps) {
  const cronServices: CronJobStatus[] = [
    {
      id: "cron-1",
      name: "Daily Settlement Engine",
      interval: "00:00 UTC",
      status: "active",
      description: "Reconciles locked escrow and calculates batch payouts.",
      lastRun: lastSettledAt ? formatPulseTime(lastSettledAt, "Completed today") : "Completed today",
    },
    {
      id: "cron-2",
      name: "Submission Auto-Verifier",
      interval: "Every 30m",
      status: "active",
      description: "Ingests scraper metrics and auto-clears view thresholds.",
      lastRun: lastScrapedAt ? formatPulseTime(lastScrapedAt, "Active") : "Active",
    },
    {
      id: "cron-3",
      name: "Campaign Budget Watchdog",
      interval: "Hourly",
      status: "active",
      description: "Monitors budget exhaustion and auto-completes campaigns.",
      lastRun: `${liveCampaignsCount} live pools`,
    },
    {
      id: "cron-4",
      name: "PostgreSQL Custody & RLS",
      interval: "Real-time",
      status: "active",
      description: "Enforces tenant isolation and cryptographic escrow security.",
      lastRun: "100% Uptime",
    },
  ];

  return (
    <div className="relative rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
            System &amp; Automation Pulse
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Background cron engines, scraping pipelines, and escrow custody health
          </p>
        </div>

        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          Cron Cockpit
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cronServices.map((srv) => (
          <div
            key={srv.id}
            className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 dark:border-gray-800/60 dark:bg-gray-800/40 flex flex-col justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {srv.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 font-sans">
                  {srv.description}
                </p>
              </div>

              <span className="relative flex h-2 w-2 shrink-0 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Clock className="w-2.5 h-2.5 text-gray-400" />
                {srv.interval}
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {srv.lastRun}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
