"use client";

import React from "react";
import { NairaIcon } from "../../icons";
import { ShieldCheck, Wallet, ArrowUpRight, Sparkles, Layers } from "lucide-react";
import Badge from "../ui/badge/Badge";

interface PlatformFinancesProps {
  totalLiquidity?: number;
  campaignPool?: number;
  liveCampaigns?: number;
  platformPurse?: number;
  fee10Percent?: number;
  featuredAddonFees?: number;
  featuredCampaignsCount?: number;
  totalSettledPayouts?: number;
  totalPendingPayouts?: number;
}

export const PlatformFinances: React.FC<PlatformFinancesProps> = ({
  totalLiquidity = 0,
  campaignPool = 0,
  liveCampaigns = 0,
  platformPurse = 0,
  fee10Percent = 0,
  featuredAddonFees = 0,
  featuredCampaignsCount = 0,
  totalSettledPayouts = 0,
  totalPendingPayouts = 0,
}) => {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Platform Treasury &amp; Financials
          </h3>
        </div>
        <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 hidden sm:inline-block">
          Reconciled via Double-Entry Escrow Ledger
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {/* Card 1: Total Liquidity */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <Badge color="success">
                Escrow Secured
              </Badge>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Liquidity
              </span>
              <h4 className="mt-1 text-2xl font-bold font-display text-gray-900 dark:text-white truncate">
                {formatNaira(totalLiquidity)}
              </h4>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 font-sans border-t border-gray-100 dark:border-gray-800/60 pt-2">
            100% custodial balance across all user wallets
          </p>
        </div>

        {/* Card 2: Active Campaign Pool */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/10 dark:text-blue-light-400">
                <Layers className="size-5" />
              </div>
              <Badge color="info">
                {liveCampaigns} Active
              </Badge>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Active Campaign Pool
              </span>
              <h4 className="mt-1 text-2xl font-bold font-display text-gray-900 dark:text-white truncate">
                {formatNaira(campaignPool)}
              </h4>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 font-sans border-t border-gray-100 dark:border-gray-800/60 pt-2">
            Committed pool awaiting creator claims &amp; views
          </p>
        </div>

        {/* Card 3: Platform Purse (10% Commission + ₦2,500 Featured Add-on) */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
                <Wallet className="size-5" />
              </div>
              <Badge color="success">
                Purse Net
              </Badge>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Platform Purse
              </span>
              <h4 className="mt-1 text-2xl font-bold font-display text-gray-900 dark:text-white truncate">
                {formatNaira(platformPurse)}
              </h4>
            </div>
          </div>

          <div className="mt-3 border-t border-gray-100 dark:border-gray-800/60 pt-2 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-500 dark:text-gray-400">10% Platform Cut:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">{formatNaira(fee10Percent)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                Featured Slots ({featuredCampaignsCount}):
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{formatNaira(featuredAddonFees)}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Creator Payouts Dispatched */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <ArrowUpRight className="size-5" />
              </div>
              <Badge color="light">
                Dispatched
              </Badge>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Dispatched Payouts
              </span>
              <h4 className="mt-1 text-2xl font-bold font-display text-gray-900 dark:text-white truncate">
                {formatNaira(totalSettledPayouts)}
              </h4>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 font-sans border-t border-gray-100 dark:border-gray-800/60 pt-2 truncate">
            {totalPendingPayouts > 0
              ? `${formatNaira(totalPendingPayouts)} pending in clearing queue`
              : "All creator requests cleared & settled"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformFinances;
