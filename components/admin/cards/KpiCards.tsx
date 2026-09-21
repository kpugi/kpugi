"use client";

import React from "react";
import Badge from "../components/ui/badge/Badge";
import {
  BoxIconLine,
  GroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DollarLineIcon,
  CheckCircleIcon,
  AlertIcon,
} from "../icons";

interface KpiCardsProps {
  totalCampaigns: number;
  liveCampaigns: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  totalPlatformBalance: number;
  activeWalletsCount: number;
  totalPendingPayoutAmount: number;
  pendingPayoutsCount: number;
}

export default function KpiCards({
  totalCampaigns,
  liveCampaigns,
  totalSubmissions,
  pendingSubmissions,
  totalPlatformBalance,
  activeWalletsCount,
  totalPendingPayoutAmount,
  pendingPayoutsCount,
}: KpiCardsProps) {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* 1. Campaigns Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
          <BoxIconLine className="size-6" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Campaigns
            </span>
            <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {totalCampaigns}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon className="w-3 h-3" />
            {liveCampaigns} live
          </Badge>
        </div>
      </div>

      {/* 2. Submissions Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <CheckCircleIcon className="size-6" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Submissions
            </span>
            <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {totalSubmissions}
            </h4>
          </div>

          <Badge color="warning">
            <AlertIcon className="w-3 h-3" />
            {pendingSubmissions} review
          </Badge>
        </div>
      </div>

      {/* 3. Platform Escrow Balance */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
          <DollarLineIcon className="size-6" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Escrow Balance
            </span>
            <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatNaira(totalPlatformBalance)}
            </h4>
          </div>

          <Badge color="primary">
            {activeWalletsCount} wallets
          </Badge>
        </div>
      </div>

      {/* 4. Pending Payout Requests */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
          <GroupIcon className="size-6" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending Payouts
            </span>
            <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatNaira(totalPendingPayoutAmount)}
            </h4>
          </div>

          <Badge color={pendingPayoutsCount > 0 ? "error" : "light"}>
            {pendingPayoutsCount} requests
          </Badge>
        </div>
      </div>
    </div>
  );
}
