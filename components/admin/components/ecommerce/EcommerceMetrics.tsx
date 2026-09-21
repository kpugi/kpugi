"use client";

import React from "react";
import { ArrowUpIcon, MegaphoneIcon, LayersIcon, NairaIcon, CheckCircleIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

interface EcommerceMetricsProps {
  totalCampaigns?: number;
  liveCampaigns?: number;
  totalSubmissions?: number;
  pendingSubmissions?: number;
  verifiedSubmissions?: number;
  automatedPassRate?: number;
  totalUsers?: number;
  creatorCount?: number;
  brandCount?: number;
  adminCount?: number;
}

export const EcommerceMetrics: React.FC<EcommerceMetricsProps> = ({
  totalCampaigns = 0,
  liveCampaigns = 0,
  totalSubmissions = 0,
  pendingSubmissions = 0,
  verifiedSubmissions = 0,
  automatedPassRate = 0,
  totalUsers = 0,
  creatorCount = 0,
  brandCount = 0,
  adminCount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 font-sans">
      {/* <!-- Card 1: Live Campaigns --> */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
          <MegaphoneIcon className="size-5" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Live Campaigns
            </span>
            <h4 className="mt-1.5 text-2xl font-bold font-display text-gray-900 dark:text-white">
              {liveCampaigns}{" "}
              <span className="text-sm font-sans font-normal text-gray-400">
                / {totalCampaigns}
              </span>
            </h4>
          </div>
          <Badge color={liveCampaigns > 0 ? "success" : "light"}>
            <ArrowUpIcon className="w-3 h-3 mr-1" />
            Active CPM
          </Badge>
        </div>
      </div>

      {/* <!-- Card 2: Submissions Queue --> */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
          <LayersIcon className="size-5" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Submissions Queue
            </span>
            <h4 className="mt-1.5 text-2xl font-bold font-display text-gray-900 dark:text-white">
              {pendingSubmissions}{" "}
              <span className="text-sm font-sans font-normal text-gray-400">pending</span>
            </h4>
          </div>

          <Badge color={pendingSubmissions > 0 ? "warning" : "success"}>
            {totalSubmissions} Total
          </Badge>
        </div>
      </div>

      {/* <!-- Card 3: Verified Content / Posts --> */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircleIcon className="size-5" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Verified Posts
            </span>
            <h4 className="mt-1.5 text-2xl font-bold font-display text-gray-900 dark:text-white">
              {verifiedSubmissions}{" "}
              <span className="text-sm font-sans font-normal text-gray-400">posts</span>
            </h4>
          </div>
          <Badge color="success">
            {automatedPassRate}% Pass
          </Badge>
        </div>
      </div>

      {/* <!-- Card 4: Platform Users (Creators & Brands) --> */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        <div className="mt-5 flex items-end justify-between gap-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Users
            </span>
            <h4 className="mt-1.5 text-2xl font-bold font-display text-gray-900 dark:text-white truncate">
              {totalUsers > 0 ? totalUsers : creatorCount + brandCount}
            </h4>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              {creatorCount} Creators
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
              {brandCount} Brands
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceMetrics;
