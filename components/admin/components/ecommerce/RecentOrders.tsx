"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ExternalLink, Sparkles, Pin } from "lucide-react";

export interface CampaignItem {
  id: string;
  title: string;
  campaign_code?: string | null;
  status: string;
  cover_image_url?: string | null;
  company_logo?: string | null;
  cpm_rate?: number | null;
  total_budget?: number | null;
  spent_budget?: number | null;
  is_featured?: boolean;
  is_hero_pinned?: boolean;
  created_at?: string;
}

export interface SubmissionItem {
  id: string;
  campaign_id: string;
  creator_id?: string;
  status: string;
  post_url?: string | null;
  reserved_amount?: number | null;
  payout_amount?: number | null;
  submitted_at?: string | null;
  campaign_title?: string;
}

interface RecentOrdersProps {
  campaigns?: CampaignItem[];
  submissions?: any[]; // Kept for backward compatibility
}

const fallbackCampaigns: CampaignItem[] = [
  {
    id: "cmp-chowdeck-01",
    title: "Chowdeck Midnight Fast Delivery",
    campaign_code: "KPG-CHOWD",
    status: "live",
    cover_image_url: "/chowdeck_creative.png",
    cpm_rate: 4500,
    total_budget: 1200000,
    spent_budget: 450000,
    is_featured: true,
    is_hero_pinned: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "cmp-piggyvest-02",
    title: "PiggyVest SafeLock 15% APY Drive",
    campaign_code: "KPG-PGVST",
    status: "live",
    cover_image_url: "/piggyvest_creative.png",
    cpm_rate: 3500,
    total_budget: 850000,
    spent_budget: 280000,
    is_featured: true,
    is_hero_pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "cmp-infinix-03",
    title: "Infinix Note 40 Gaming Speed",
    campaign_code: "KPG-INFNX",
    status: "live",
    cover_image_url: "/infinix_creative.png",
    cpm_rate: 5000,
    total_budget: 2000000,
    spent_budget: 890000,
    is_featured: false,
    is_hero_pinned: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "cmp-zaron-04",
    title: "Zaron Cosmetics Glossy Glow",
    campaign_code: "KPG-ZARON",
    status: "live",
    cover_image_url: "/zaron_creative.png",
    cpm_rate: 3000,
    total_budget: 650000,
    spent_budget: 190000,
    is_featured: false,
    is_hero_pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
];

export default function RecentOrders({ campaigns }: RecentOrdersProps) {
  const data = campaigns && campaigns.length > 0 ? campaigns : fallbackCampaigns;

  const formatNaira = (val?: number | null) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  const renderStatusIndicator = (status?: string) => {
    const s = (status || "draft").toLowerCase().replace(/_/g, " ").trim();

    if (s === "live" || s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shadow-2xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          Live
        </span>
      );
    }

    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          Completed
        </span>
      );
    }

    if (s === "archived") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
          Archived
        </span>
      );
    }

    if (s === "paused") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Paused
        </span>
      );
    }

    if (s === "funding pending" || s === "funding") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
          Funding
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 dark:bg-gray-800/80 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/50 capitalize">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
        {s}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white px-5 pt-5 pb-4 sm:px-6 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
            Recent Campaigns
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Active brand campaigns, CPM view payout rates, and budget allocations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-brand-400 transition-colors"
          >
            Manage All Campaigns →
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Campaign
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-500 text-start text-xs dark:text-gray-400"
              >
                CPM
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Budget
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-500 text-end text-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.slice(0, 6).map((item) => {
              const coverSrc = item.cover_image_url || item.company_logo || "/chowdeck_creative.png";
              const displayId = item.campaign_code || `#${item.id.slice(0, 8).toUpperCase()}`;

              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50/60 dark:hover:bg-white/3 transition-colors"
                >
                  {/* Campaign Info + Cover Image + Real Campaign ID */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 shrink-0">
                        <img
                          src={coverSrc}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/kpugi_logo.png";
                          }}
                        />
                      </div>
                      <div className="min-w-0 max-w-[240px]">
                        <Link
                          href={`/admin/campaigns/${item.id}`}
                          className="font-semibold text-xs text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 truncate block transition-colors"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200/70 dark:border-gray-700/60 tracking-wider">
                            {displayId}
                          </span>
                          {item.is_hero_pinned && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold font-mono text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded">
                              <Pin className="w-2.5 h-2.5" /> Hero
                            </span>
                          )}
                          {item.is_featured && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold font-mono text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded">
                              <Sparkles className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* CPM Rate */}
                  <TableCell className="py-3.5 font-mono text-xs font-semibold text-gray-800 dark:text-white/90">
                    {formatNaira(item.cpm_rate)}
                    <span className="text-[10px] text-gray-400 font-normal ml-1"></span>
                  </TableCell>

                  {/* Total Budget */}
                  <TableCell className="py-3.5 font-mono text-xs font-semibold text-gray-800 dark:text-white/90">
                    {formatNaira(item.total_budget)}
                  </TableCell>

                  {/* Status Indicator Column */}
                  <TableCell className="py-3.5">
                    {renderStatusIndicator(item.status)}
                  </TableCell>

                  {/* Action: Open button */}
                  <TableCell className="py-3.5 text-end">
                    <Link
                      href={`/admin/campaigns/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-semibold px-2.5 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                    >
                      Open
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
