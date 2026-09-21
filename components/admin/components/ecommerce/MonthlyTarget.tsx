"use client";

import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Link from "next/link";

interface MonthlyTargetProps {
  automatedPassRate?: number;
  avgResolutionTime?: string;
  flaggedRate?: number;
  clearedRate?: number;
  totalEscrow?: number;
  dispatchedPayouts?: number;
  pendingPayouts?: number;
}

export default function MonthlyTarget({
  automatedPassRate = 88.5,
  avgResolutionTime = "< 18m",
  flaggedRate = 1.2,
  clearedRate = 98.8,
}: MonthlyTargetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Circumference calculation for radial gauge (semi-circle radius 80)
  // Arc length = PI * 80 ≈ 251.2
  const progressRatio = Math.min(100, Math.max(0, automatedPassRate)) / 100;
  const strokeDashoffset = 251.2 * (1 - progressRatio);

  return (
    <div className="relative rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
            Verification &amp; Pipeline Health
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Automated verification efficiency &amp; scraper resolution rate
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-white/5 transition-colors"
            aria-label="Settlement Options"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="w-48 p-1.5"
          >
            <DropdownItem onItemClick={() => setIsOpen(false)}>
              <Link href="/admin/system" className="block w-full px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:text-brand-500 font-medium">
                System Diagnostics
              </Link>
            </DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}>
              <Link href="/admin/submissions" className="block w-full px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:text-brand-500 font-medium">
                Submissions Queue
              </Link>
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="relative my-6 flex flex-col items-center justify-center">
        <svg className="w-56 h-32" viewBox="0 0 200 110">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#E4E7EC"
            strokeWidth="18"
            strokeLinecap="round"
            className="dark:stroke-gray-800"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#2F49E8"
            strokeWidth="18"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="text-center -mt-6">
          <h4 className="text-3xl font-bold font-display text-gray-900 dark:text-white">
            {automatedPassRate}%
          </h4>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full mt-1 inline-block">
            Auto-Verified
          </span>
        </div>
        <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          Automated scrapers successfully verified post views without operator intervention.
        </p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4 dark:divide-gray-800 dark:border-gray-800 text-center">
        <div className="px-2">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Avg Speed</span>
          <h5 className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1">
            {avgResolutionTime}
          </h5>
        </div>
        <div className="px-2">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Flagged</span>
          <h5 className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {flaggedRate}%
          </h5>
        </div>
        <div className="px-2">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Settled</span>
          <h5 className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {clearedRate}%
          </h5>
        </div>
      </div>
    </div>
  );
}
