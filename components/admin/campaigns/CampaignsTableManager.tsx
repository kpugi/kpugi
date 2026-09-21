"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Megaphone,
  Pin,
  Sparkles,
  ExternalLink,
  Coins,
  CheckCircle2,
  TrendingUp,
  X,
  Layers,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  RotateCcw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/components/ui/table";
import Pagination from "@/components/admin/components/tables/Pagination";
import CampaignRowToggles from "@/components/admin/CampaignRowToggles";

export interface AdminCampaignItem {
  id: string;
  campaign_code?: string | null;
  title: string;
  description?: string | null;
  ad_format?: string | null;
  status: string;
  cpm_rate: number;
  total_budget: number;
  reserved_budget: number;
  spent_budget: number;
  is_featured: boolean;
  is_hero_pinned: boolean;
  created_at: string;
  advertiser_id?: string;
  advertiser_name?: string;
  advertiser_email?: string;
  cover_image_url?: string | null;
  submissions_count?: number;
}

interface CampaignsTableManagerProps {
  campaigns: AdminCampaignItem[];
}

type SortField = "title" | "advertiser" | "status" | "cpm" | "budget" | "spent" | "created";
type SortDirection = "asc" | "desc";

export default function CampaignsTableManager({ campaigns = [] }: CampaignsTableManagerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [filterHeroOnly, setFilterHeroOnly] = useState(false);
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filter, sort or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, filterHeroOnly, filterFeaturedOnly, sortField, sortDirection, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setFilterHeroOnly(false);
    setFilterFeaturedOnly(false);
    setSortField("created");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  const isFiltered = searchQuery || selectedStatus !== "all" || filterHeroOnly || filterFeaturedOnly || sortField !== "created" || sortDirection !== "desc";

  // Overall metric computations
  const totalCount = campaigns.length;
  const liveCount = campaigns.filter((c) => c.status === "live" || c.status === "active").length;
  const pausedCount = campaigns.filter((c) => c.status === "paused").length;
  const completedCount = campaigns.filter((c) => c.status === "completed").length;
  const archivedCount = campaigns.filter((c) => c.status === "archived").length;
  const heroPinnedCount = campaigns.filter((c) => c.is_hero_pinned).length;
  const featuredCount = campaigns.filter((c) => c.is_featured).length;

  const totalCapitalAllocated = useMemo(() => {
    return campaigns.reduce((sum, c) => sum + Number(c.total_budget || 0), 0);
  }, [campaigns]);

  const totalCapitalSpent = useMemo(() => {
    return campaigns.reduce((sum, c) => sum + Number(c.spent_budget || 0), 0);
  }, [campaigns]);

  // Filter & Sort campaigns
  const filteredCampaigns = useMemo(() => {
    const list = campaigns.filter((c) => {
      // Status filter
      if (selectedStatus !== "all") {
        const s = (c.status || "").toLowerCase();
        if (selectedStatus === "live" && s !== "live" && s !== "active") return false;
        if (selectedStatus === "paused" && s !== "paused") return false;
        if (selectedStatus === "completed" && s !== "completed") return false;
        if (selectedStatus === "archived" && s !== "archived") return false;
      }

      // Hero only filter
      if (filterHeroOnly && !c.is_hero_pinned) return false;

      // Featured only filter
      if (filterFeaturedOnly && !c.is_featured) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const titleMatch = (c.title || "").toLowerCase().includes(q);
      const codeMatch = (c.campaign_code || "").toLowerCase().includes(q);
      const idMatch = c.id.toLowerCase().includes(q);
      const advertiserMatch =
        (c.advertiser_name || "").toLowerCase().includes(q) ||
        (c.advertiser_email || "").toLowerCase().includes(q);

      return titleMatch || codeMatch || idMatch || advertiserMatch;
    });

    // Sort
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "advertiser":
          comparison = (a.advertiser_name || "").localeCompare(b.advertiser_name || "");
          break;
        case "status":
          comparison = (a.status || "").localeCompare(b.status || "");
          break;
        case "cpm":
          comparison = Number(a.cpm_rate || 0) - Number(b.cpm_rate || 0);
          break;
        case "budget":
          comparison = Number(a.total_budget || 0) - Number(b.total_budget || 0);
          break;
        case "spent":
          comparison = Number(a.spent_budget || 0) - Number(b.spent_budget || 0);
          break;
        case "created":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [campaigns, selectedStatus, filterHeroOnly, filterFeaturedOnly, searchQuery, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / itemsPerPage));
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(start, start + itemsPerPage);
  }, [filteredCampaigns, currentPage, itemsPerPage]);

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

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
        {status || "Draft"}
      </span>
    );
  };

  const statusFilters = [
    { id: "all", label: "All Campaigns", count: totalCount },
    { id: "live", label: "Live", count: liveCount },
    { id: "paused", label: "Paused", count: pausedCount },
    { id: "completed", label: "Completed", count: completedCount },
    { id: "archived", label: "Archived", count: archivedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Platform KPI Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white">
                Campaign Operations
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Inspect platform campaigns, hero pinned placements, CPM rates, and audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Platform Operational Metrics */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-mono flex items-center gap-2 text-indigo-600 dark:text-indigo-400 shadow-2xs">
            <Pin className="w-3.5 h-3.5" />
            <span className="font-semibold">Hero Slots:</span>
            <span className="bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded text-[11px] font-bold">
              {heroPinnedCount}/5
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-mono flex items-center gap-2 text-amber-600 dark:text-amber-400 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">Featured:</span>
            <span className="bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded text-[11px] font-bold">
              {featuredCount}
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-mono flex items-center gap-2 text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-semibold">Capital:</span>
            <span className="text-gray-900 dark:text-white font-bold">
              {formatNaira(totalCapitalAllocated)}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs mb-1 font-medium">
            <span>Total Registered</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
            {totalCount}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Across all platform brands
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs mb-1 font-medium">
            <span>Active Live</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {liveCount}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Currently accepting submissions
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs mb-1 font-medium">
            <span>Paused / Concluded</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
            {pausedCount + completedCount}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            {pausedCount} paused • {completedCount} settled
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-brand-600 dark:text-brand-400 text-xs mb-1 font-medium">
            <span>Capital Deployed</span>
            <Coins className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
            {formatNaira(totalCapitalSpent)}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            {totalCapitalAllocated > 0
              ? `${Math.round((totalCapitalSpent / totalCapitalAllocated) * 100)}% budget consumed`
              : "0% budget consumed"}
          </div>
        </div>
      </div>

      {/* Main Table Card (TailAdmin Basic Table 1 & 2 standard) */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
        {/* Toolbar: Status Filter Tabs, Hero/Featured Chips, Page Size, Search */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
              {statusFilters.map((tab) => {
                const isActive = selectedStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedStatus(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                        isActive
                          ? "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400"
                          : "bg-gray-200/70 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Quick Toggles, Page Size & Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Quick Filter Chips */}
              <button
                type="button"
                onClick={() => setFilterHeroOnly((prev) => !prev)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  filterHeroOnly
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700"
                    : "bg-white dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${filterHeroOnly ? "fill-indigo-500 text-indigo-500" : ""}`} />
                <span>Hero Only</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterFeaturedOnly((prev) => !prev)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  filterFeaturedOnly
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                    : "bg-white dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${filterFeaturedOnly ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>Featured Only</span>
              </button>

              {/* Reset Filter button */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset all filters & sorting"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              {/* Per Page Selector */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="h-9 px-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className="h-9 w-full rounded-lg border appearance-none ps-8 pe-8 py-1.5 text-xs shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
              <TableRow>
                {/* Campaign Header (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("title")}
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Campaign</span>
                    {sortField === "title" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </TableCell>

                {/* Advertiser Header (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("advertiser")}
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Advertiser</span>
                    {sortField === "advertiser" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </TableCell>

                {/* Status Header (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("status")}
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === "status" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </TableCell>

                {/* CPM Header (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("cpm")}
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>CPM</span>
                    {sortField === "cpm" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </TableCell>

                {/* Budget Header (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("budget")}
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Budget & Spent</span>
                    {sortField === "budget" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </TableCell>

                {/* Hero / Featured Header */}
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 select-none"
                >
                  Hero / Featured
                </TableCell>

                {/* Created Header (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("created")}
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created</span>
                    {sortField === "created" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </TableCell>

                {/* Action Header */}
                <TableCell
                  isHeader
                  className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5 font-sans">
              {paginatedCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        No campaigns found
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {searchQuery
                          ? `No campaigns match your search for "${searchQuery}".`
                          : `No campaigns currently match the "${selectedStatus}" status filter.`}
                      </p>
                      {(searchQuery || selectedStatus !== "all") && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedStatus("all");
                          }}
                          className="mt-3 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCampaigns.map((c) => {
                  const coverSrc = c.cover_image_url || "/chowdeck_creative.png";
                  const displayCode = c.campaign_code || `#${c.id.slice(0, 8).toUpperCase()}`;
                  const spentPercent = c.total_budget > 0
                    ? Math.min(100, Math.round((Number(c.spent_budget || 0) / Number(c.total_budget)) * 100))
                    : 0;

                  return (
                    <TableRow
                      key={c.id}
                      onClick={() => router.push(`/admin/campaigns/${c.id}`)}
                      className="hover:bg-gray-50/70 dark:hover:bg-white/3 transition-colors cursor-pointer group"
                    >
                      {/* Campaign Cover + Title + Code */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 shrink-0">
                            <img
                              src={coverSrc}
                              alt={c.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/kpugi_logo.png";
                              }}
                            />
                          </div>
                          <div className="min-w-0 max-w-[220px]">
                            <span className="font-semibold text-xs text-gray-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 truncate block transition-colors">
                              {c.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 rounded border border-gray-200/70 dark:border-gray-700/60 tracking-wider">
                                {displayCode}
                              </span>
                              {c.is_hero_pinned && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold font-mono text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded">
                                  <Pin className="w-2.5 h-2.5" /> Hero
                                </span>
                              )}
                              {c.is_featured && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold font-mono text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded">
                                  <Sparkles className="w-2.5 h-2.5" /> Feat
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Advertiser Info */}
                      <TableCell className="py-3.5 px-4">
                        <div className="min-w-0 max-w-[170px]">
                          <span className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate block">
                            {c.advertiser_name || "Platform Direct"}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate block font-sans">
                            {c.advertiser_email || "Verified Brand"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status Indicator */}
                      <TableCell className="py-3.5 px-4">
                        {renderStatusIndicator(c.status)}
                      </TableCell>

                      {/* CPM Rate */}
                      <TableCell className="py-3.5 px-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                        {formatNaira(c.cpm_rate)}
                      </TableCell>

                      {/* Budget & Spent Bar */}
                      <TableCell className="py-3.5 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">
                              {formatNaira(c.spent_budget)}
                            </span>
                            <span className="text-gray-400 text-[10px]">
                              / {formatNaira(c.total_budget)}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded-full transition-all duration-300"
                              style={{ width: `${spentPercent}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Hero & Featured Operations (Row Toggles) */}
                      <TableCell
                        className="py-3.5 px-4"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <CampaignRowToggles
                          campaignId={c.id}
                          isHeroPinned={!!c.is_hero_pinned}
                          isFeatured={!!c.is_featured}
                        />
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                        {new Date(c.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>

                      {/* Action: Open details view */}
                      <TableCell className="py-3.5 px-4 text-end">
                        <Link
                          href={`/admin/campaigns/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* TailAdmin Pagination Footer */}
        {filteredCampaigns.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div>
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white font-mono">
                {filteredCampaigns.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900 dark:text-white font-mono">
                {Math.min(filteredCampaigns.length, currentPage * itemsPerPage)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white font-mono">
                {filteredCampaigns.length}
              </span>{" "}
              campaigns
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
