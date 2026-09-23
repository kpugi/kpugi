"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/components/ui/table";
import Pagination from "@/components/admin/components/tables/Pagination";
import SubmissionStatusModal from "./modals/SubmissionStatusModal";
import ScreenshotPreviewModal from "./modals/ScreenshotPreviewModal";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  ExternalLink,
  ChevronRight,
  Eye,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  TwitterXIcon,
  FacebookIcon,
} from "@/components/ui/SocialIcons";

export interface SubmissionRowData {
  id: string;
  campaign_id: string;
  creator_id: string;
  status: string;
  post_url: string | null;
  screenshot_url: string | null;
  submitted_at: string;
  reserved_amount: number;
  payout_amount: number | null;
  final_view_count: number | null;
  failure_reason: string | null;
  verified_at: string | null;
  campaign?: {
    id: string;
    title: string;
    cpm_rate: number;
    platform?: string;
    channels?: string[];
    status?: string;
  } | null;
  creator?: {
    id: string;
    full_name?: string | null;
    email?: string;
    avatar_url?: string | null;
    display_name?: string | null;
    creator_handle?: string | null;
  } | null;
  social_account?: {
    platform?: string;
    handle?: string;
  } | null;
}

interface SubmissionsTableManagerProps {
  initialSubmissions: SubmissionRowData[];
}

type SortField = "submitted" | "creator" | "campaign" | "views" | "amount";
type SortDirection = "asc" | "desc";

// Platform detector helper
function getPlatformFromUrl(url: string | null | undefined, fallback?: string): string {
  if (!url) return fallback || "generic";
  const low = url.toLowerCase();
  if (low.includes("tiktok.com")) return "tiktok";
  if (low.includes("instagram.com")) return "instagram";
  if (low.includes("youtube.com") || low.includes("youtu.be")) return "youtube";
  if (low.includes("twitter.com") || low.includes("x.com")) return "x";
  if (low.includes("facebook.com")) return "facebook";
  return fallback || "generic";
}

function renderPlatformIcon(platform: string, className = "w-3.5 h-3.5") {
  switch (platform.toLowerCase()) {
    case "tiktok":
      return <TikTokIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "youtube":
      return <YouTubeIcon className={className} />;
    case "x":
    case "twitter":
      return <TwitterXIcon className={className} />;
    case "facebook":
      return <FacebookIcon className={className} />;
    default:
      return <ExternalLink className={className} />;
  }
}

export default function SubmissionsTableManager({
  initialSubmissions,
}: SubmissionsTableManagerProps) {
  const [submissions, setSubmissions] = useState<SubmissionRowData[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "verified_pass" | "verified_fail" | "paid" | "forfeited"
  >("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("submitted");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [statusModalTarget, setStatusModalTarget] = useState<SubmissionRowData | null>(null);
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [screenshotModalSubId, setScreenshotModalSubId] = useState<string | undefined>();
  const [screenshotModalCreator, setScreenshotModalCreator] = useState<string | undefined>();

  // Metrics computation
  const totalCount = submissions.length;
  const pendingCount = submissions.filter(
    (s) => s.status === "pending" || s.status === "joined"
  ).length;
  const passedCount = submissions.filter(
    (s) => s.status === "verified_pass" || s.status === "approved"
  ).length;
  const failedCount = submissions.filter(
    (s) => s.status === "verified_fail" || s.status === "rejected"
  ).length;
  const totalEscrowNgn = submissions.reduce(
    (sum, s) => sum + (Number(s.reserved_amount) || 0),
    0
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlatformFilter("all");
    setSortField("submitted");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  // Filter and Sort pipeline
  const filteredData = useMemo(() => {
    let result = [...submissions];

    // Status Filter
    if (statusFilter === "pending") {
      result = result.filter((s) => s.status === "pending" || s.status === "joined");
    } else if (statusFilter === "verified_pass") {
      result = result.filter((s) => s.status === "verified_pass" || s.status === "approved");
    } else if (statusFilter === "verified_fail") {
      result = result.filter((s) => s.status === "verified_fail" || s.status === "rejected");
    } else if (statusFilter === "paid") {
      result = result.filter((s) => s.status === "paid");
    } else if (statusFilter === "forfeited") {
      result = result.filter((s) => s.status === "forfeited");
    }

    // Platform Filter
    if (platformFilter !== "all") {
      result = result.filter((s) => {
        const detected = getPlatformFromUrl(
          s.post_url,
          s.social_account?.platform || s.campaign?.channels?.[0] || s.campaign?.platform
        );
        return detected.toLowerCase() === platformFilter.toLowerCase();
      });
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.campaign?.title?.toLowerCase().includes(q) ||
          s.creator?.full_name?.toLowerCase().includes(q) ||
          s.creator?.display_name?.toLowerCase().includes(q) ||
          s.creator?.creator_handle?.toLowerCase().includes(q) ||
          s.creator?.email?.toLowerCase().includes(q) ||
          s.post_url?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case "submitted":
          comp = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
          break;
        case "creator": {
          const nameA = (a.creator?.full_name || a.creator?.display_name || a.creator?.email || "").toLowerCase();
          const nameB = (b.creator?.full_name || b.creator?.display_name || b.creator?.email || "").toLowerCase();
          comp = nameA.localeCompare(nameB);
          break;
        }
        case "campaign": {
          const titleA = (a.campaign?.title || "").toLowerCase();
          const titleB = (b.campaign?.title || "").toLowerCase();
          comp = titleA.localeCompare(titleB);
          break;
        }
        case "views":
          comp = (a.final_view_count || 0) - (b.final_view_count || 0);
          break;
        case "amount":
          comp = Number(a.reserved_amount || 0) - Number(b.reserved_amount || 0);
          break;
      }
      return sortDirection === "asc" ? comp : -comp;
    });

    return result;
  }, [submissions, statusFilter, platformFilter, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const isFiltered =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    platformFilter !== "all" ||
    sortField !== "submitted" ||
    sortDirection !== "desc";

  // Handle local status override update
  const handleStatusOverrideSuccess = (newStatus: string) => {
    if (!statusModalTarget) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === statusModalTarget.id
          ? { ...s, status: newStatus, verified_at: new Date().toISOString() }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* 1. METRIC KPI CARDS STRIP */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Submissions */}
        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Total Submissions
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2">
            {totalCount}
          </p>
        </div>

        {/* Pending Verification */}
        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Pending Audit
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2">
            {pendingCount}
          </p>
        </div>

        {/* Verified Pass */}
        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Verified Pass
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2">
            {passedCount}
          </p>
        </div>

        {/* Failed / Flagged */}
        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Failed / Flagged
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2">
            {failedCount}
          </p>
        </div>

        {/* Total Escrow */}
        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Total Escrow Value
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2 truncate">
            ₦{totalEscrowNgn.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. SEARCH & MULTI-FACET FILTER CONTROLS */}
      {/* ---------------------------------------------------- */}
      <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs space-y-4">
        {/* Top bar: Search + Platform selector + Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search creator, campaign, post URL, ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Platform Filter Dropdown */}
            <div className="relative">
              <select
                value={platformFilter}
                onChange={(e) => {
                  setPlatformFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                <option value="all">All Platforms</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="x">X (Twitter)</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Category Segment Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-gray-100 dark:border-slate-800/80 pt-3">
          {[
            { id: "all", label: "All Submissions", count: totalCount },
            { id: "pending", label: "Pending", count: pendingCount },
            { id: "verified_pass", label: "Verified Pass", count: passedCount },
            { id: "verified_fail", label: "Failed / Flagged", count: failedCount },
            { id: "paid", label: "Paid & Released", count: submissions.filter((s) => s.status === "paid").length },
            { id: "forfeited", label: "Forfeited", count: submissions.filter((s) => s.status === "forfeited").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-brand-500 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  statusFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. TAILADMIN BASICTABLEONE TABLE VIEW */}
      {/* ---------------------------------------------------- */}
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/70 dark:bg-slate-900/40">
              <TableRow>
                {/* Creator / Submission */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("creator")}
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Creator / ID</span>
                    {sortField === "creator" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />
                    )}
                  </div>
                </TableCell>

                {/* Campaign */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("campaign")}
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Campaign</span>
                    {sortField === "campaign" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />
                    )}
                  </div>
                </TableCell>

                {/* Post Link & Media */}
                <TableCell
                  isHeader
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                >
                  Post &amp; Proof
                </TableCell>

                {/* Status */}
                <TableCell
                  isHeader
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                >
                  Status
                </TableCell>

                {/* Submitted Date */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("submitted")}
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted</span>
                    {sortField === "submitted" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />
                    )}
                  </div>
                </TableCell>

                {/* Action */}
                <TableCell
                  isHeader
                  className="px-5 py-2.5 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    No submissions match your selected search or filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((s) => {
                  const platform = getPlatformFromUrl(
                    s.post_url,
                    s.social_account?.platform || s.campaign?.channels?.[0] || s.campaign?.platform
                  );
                  const creatorName =
                    s.creator?.full_name ||
                    s.creator?.display_name ||
                    s.creator?.email ||
                    "Anonymous Creator";

                  return (
                    <TableRow
                      key={s.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Creator & ID */}
                      <TableCell className="px-5 py-3 text-start">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 shrink-0 relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300">
                            {s.creator?.avatar_url ? (
                              <Image
                                width={32}
                                height={32}
                                src={s.creator.avatar_url}
                                alt={creatorName}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              creatorName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-gray-900 dark:text-white truncate block">
                              {creatorName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                                #{s.id.slice(0, 8)}
                              </span>
                              {s.creator?.creator_handle && (
                                <span className="text-[10px] text-brand-500 font-mono">
                                  @{s.creator.creator_handle}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Campaign & Escrow */}
                      <TableCell className="px-5 py-3 text-start">
                        <div className="max-w-[200px]">
                          <span
                            className="font-semibold text-xs text-gray-800 dark:text-gray-200 block truncate"
                            title={s.campaign?.title || "Untitled Campaign"}
                          >
                            {s.campaign?.title || "Untitled Campaign"}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                            <span>CPM: ₦{Number(s.campaign?.cpm_rate || 0).toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">
                              ₦{Number(s.reserved_amount || 0).toLocaleString()}
                            </span>
                            {s.payout_amount !== null && Number(s.payout_amount) > 0 && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                (Pd: ₦{Number(s.payout_amount).toLocaleString()})
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Post Link & Proof */}
                      <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {s.post_url ? (
                            <a
                              href={s.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors"
                              title={s.post_url}
                            >
                              {renderPlatformIcon(platform)}
                              <span className="capitalize text-[11px]">{platform}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Awaiting Link</span>
                          )}

                          {s.screenshot_url && (
                            <button
                              type="button"
                              onClick={() => {
                                setScreenshotModalUrl(s.screenshot_url);
                                setScreenshotModalSubId(s.id);
                                setScreenshotModalCreator(creatorName);
                              }}
                              title="Inspect uploaded screenshot proof"
                              className="w-7 h-7 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 dark:text-brand-400 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Status & Views */}
                      <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              s.status === "verified_pass" || s.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                                : s.status === "verified_fail" || s.status === "rejected"
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60"
                                : s.status === "paid"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                                : s.status === "forfeited"
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60"
                            }`}
                          >
                            {s.status.replace(/_/g, " ")}
                          </span>
                          {s.final_view_count !== null && s.final_view_count !== undefined && (
                            <div className="flex items-center gap-1 font-mono text-[10px] text-gray-600 dark:text-gray-300 font-bold">
                              <Eye className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{(s.final_view_count || 0).toLocaleString()} views</span>
                            </div>
                          )}
                          {s.failure_reason && (
                            <span
                              className="block text-[10px] text-rose-500 truncate max-w-[130px]"
                              title={s.failure_reason}
                            >
                              {s.failure_reason}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Submitted Date (Stacked date + time) */}
                      <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {new Date(s.submitted_at).toLocaleDateString()}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(s.submitted_at).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="px-5 py-3 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Status Override Trigger */}
                          <button
                            type="button"
                            onClick={() => setStatusModalTarget(s)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer"
                          >
                            Override
                          </button>

                          {/* Deep Link to Detail Command Center */}
                          <Link
                            href={`/admin/submissions/${s.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 dark:text-brand-400 transition-colors"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* TailAdmin Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} submissions
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-[11px] px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-300"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Status Override Modal */}
      <SubmissionStatusModal
        isOpen={!!statusModalTarget}
        onClose={() => setStatusModalTarget(null)}
        submission={
          statusModalTarget
            ? {
                id: statusModalTarget.id,
                status: statusModalTarget.status,
                creatorName:
                  statusModalTarget.creator?.full_name ||
                  statusModalTarget.creator?.display_name ||
                  statusModalTarget.creator?.email,
                campaignTitle: statusModalTarget.campaign?.title,
                reservedAmount: statusModalTarget.reserved_amount,
                failureReason: statusModalTarget.failure_reason,
              }
            : null
        }
        onSuccess={handleStatusOverrideSuccess}
      />

      {/* Screenshot Preview Modal */}
      <ScreenshotPreviewModal
        isOpen={!!screenshotModalUrl}
        onClose={() => setScreenshotModalUrl(null)}
        imageUrl={screenshotModalUrl}
        submissionId={screenshotModalSubId}
        creatorName={screenshotModalCreator}
      />
    </div>
  );
}
