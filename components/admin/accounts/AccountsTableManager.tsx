"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Share2,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Users,
  ShieldCheck,
  Video,
  Heart,
  Filter,
  ArrowUpDown,
  User,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/admin/components/ui/table";
import Badge from "@/components/admin/components/ui/badge/Badge";
import Button from "@/components/admin/components/ui/button/Button";
import Pagination from "@/components/admin/components/tables/Pagination";
import {
  ConnectedSocialAccountItem,
  SocialAccountsOverview,
} from "@/app/actions/admin-accounts";

interface AccountsTableManagerProps {
  initialData: SocialAccountsOverview;
}

const ITEMS_PER_PAGE = 10;

export default function AccountsTableManager({
  initialData,
}: AccountsTableManagerProps) {
  const [accounts] = useState<ConnectedSocialAccountItem[]>(
    initialData.accounts
  );
  const [metrics] = useState(initialData.metrics);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"followers_desc" | "newest" | "oldest">(
    "followers_desc"
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Platform URL generator
  const getProfileUrl = (platform: string, handle: string) => {
    const clean = handle.replace(/^@/, "");
    switch (platform.toLowerCase()) {
      case "tiktok":
        return `https://www.tiktok.com/@${clean}`;
      case "instagram":
        return `https://www.instagram.com/${clean}`;
      case "youtube":
        return clean.startsWith("UC")
          ? `https://www.youtube.com/channel/${clean}`
          : `https://www.youtube.com/@${clean}`;
      case "x":
      case "twitter":
        return `https://x.com/${clean}`;
      case "facebook":
        return clean.includes("profile.php")
          ? `https://www.facebook.com/${clean}`
          : `https://www.facebook.com/${clean}`;
      default:
        return `https://${clean}`;
    }
  };

  // Helper format numbers
  const formatFollowers = (count: number | null) => {
    if (count === null || count === undefined) return "—";
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
    return count.toLocaleString();
  };

  // Platform Badge Styling using TailAdmin Badge
  const renderPlatformBadge = (platform: string) => {
    const p = platform.toLowerCase();
    switch (p) {
      case "tiktok":
        return <Badge color="error">TikTok</Badge>;
      case "instagram":
        return <Badge color="warning">Instagram</Badge>;
      case "youtube":
        return <Badge color="error">YouTube</Badge>;
      case "x":
      case "twitter":
        return <Badge color="info">X (Twitter)</Badge>;
      case "facebook":
        return <Badge color="primary">Facebook</Badge>;
      default:
        return <Badge color="light">{platform}</Badge>;
    }
  };

  // Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge color="success">
            <CheckCircle2 className="w-3 h-3 mr-0.5" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge color="warning">
            <Clock className="w-3 h-3 mr-0.5" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge color="error">
            <XCircle className="w-3 h-3 mr-0.5" />
            Failed
          </Badge>
        );
      default:
        return <Badge color="light">Unverified</Badge>;
    }
  };

  // Filter and Sort Accounts
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((account) => {
        // Platform filter
        if (
          selectedPlatform !== "all" &&
          account.platform.toLowerCase() !== selectedPlatform
        ) {
          return false;
        }

        // Status filter
        if (
          selectedStatus !== "all" &&
          account.verification_status !== selectedStatus
        ) {
          return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const handleMatch = account.handle.toLowerCase().includes(q);
          const creatorMatch =
            account.creator.full_name?.toLowerCase().includes(q) ||
            account.creator.email?.toLowerCase().includes(q) ||
            account.creator.creator_handle?.toLowerCase().includes(q);
          const displayMatch = account.display_name?.toLowerCase().includes(q);
          return handleMatch || creatorMatch || displayMatch;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "followers_desc") {
          return (b.follower_count || 0) - (a.follower_count || 0);
        }
        if (sortBy === "newest") {
          return (
            new Date(b.connected_at).getTime() -
            new Date(a.connected_at).getTime()
          );
        }
        if (sortBy === "oldest") {
          return (
            new Date(a.connected_at).getTime() -
            new Date(b.connected_at).getTime()
          );
        }
        return 0;
      });
  }, [accounts, selectedPlatform, selectedStatus, searchTerm, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE));
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAccounts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAccounts, currentPage]);

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight">
              Connected Social Accounts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {metrics.totalAccounts} Linked Profiles
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-1">
            Directory of all social media profiles connected to Kpugi creator accounts across TikTok, Instagram, YouTube, and X.
          </p>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Total Connected
            </span>
            <Share2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {metrics.totalAccounts}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-1 font-sans">
            Linked creator channels
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Verified Profiles
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {metrics.verifiedAccounts}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {metrics.totalAccounts > 0
              ? `${Math.round(
                  (metrics.verifiedAccounts / metrics.totalAccounts) * 100
                )}% verification rate`
              : "0%"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Aggregate Reach
            </span>
            <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {formatFollowers(metrics.totalAudienceReach)}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-1 font-sans">
            Combined audience followers
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Top Platform
            </span>
            <TrendingUp className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            TikTok ({metrics.platformBreakdown.tiktok})
          </p>
          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-1 font-sans">
            Dominant video engine
          </p>
        </div>
      </div>

      {/* Search, Sort & Platform Filters */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by creator name, email, or handle..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs font-sans placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Status & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-800 dark:text-slate-300 text-xs font-sans focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
              <option value="failed">Failed / Revoked</option>
              <option value="unverified">Unverified</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-300 dark:border-slate-800 text-gray-800 dark:text-slate-300 text-xs font-sans focus:outline-none focus:border-indigo-500"
            >
              <option value="followers_desc">Followers (Highest First)</option>
              <option value="newest">Connected (Newest First)</option>
              <option value="oldest">Connected (Oldest First)</option>
            </select>
          </div>
        </div>

        {/* Platform Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {[
            { id: "all", label: "All Platforms", count: accounts.length },
            {
              id: "tiktok",
              label: "TikTok",
              count: metrics.platformBreakdown.tiktok,
            },
            {
              id: "instagram",
              label: "Instagram",
              count: metrics.platformBreakdown.instagram,
            },
            {
              id: "youtube",
              label: "YouTube",
              count: metrics.platformBreakdown.youtube,
            },
            { id: "x", label: "X / Twitter", count: metrics.platformBreakdown.x },
            {
              id: "facebook",
              label: "Facebook",
              count: metrics.platformBreakdown.facebook,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedPlatform(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all whitespace-nowrap ${
                selectedPlatform === tab.id
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "bg-gray-100 dark:bg-[#080B14] text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 border border-gray-200 dark:border-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-black/30 opacity-80">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Social Accounts Table using TailAdmin Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-none">
        <div className="overflow-x-auto">
          <Table className="text-left text-xs font-sans">
            <TableHeader className="bg-gray-50 dark:bg-[#080B14] border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-mono text-[11px] uppercase">
              <TableRow>
                <TableCell isHeader className="py-3.5 px-4 font-semibold">Creator / Owner</TableCell>
                <TableCell isHeader className="py-3.5 px-4 font-semibold">Platform</TableCell>
                <TableCell isHeader className="py-3.5 px-4 font-semibold">Social Handle</TableCell>
                <TableCell isHeader className="py-3.5 px-4 font-semibold text-right">Followers</TableCell>
                <TableCell isHeader className="py-3.5 px-4 font-semibold">Engagement</TableCell>
                <TableCell isHeader className="py-3.5 px-4 font-semibold">Verification</TableCell>
                <TableCell isHeader className="py-3.5 px-4 font-semibold">Connected</TableCell>
                <TableCell isHeader className="py-3.5 px-4 font-semibold text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-sans">
              {paginatedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-gray-500 dark:text-slate-500">
                    <p className="text-sm font-semibold">No connected accounts found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((account) => {
                  const profileUrl = getProfileUrl(
                    account.platform,
                    account.handle
                  );

                  return (
                    <TableRow
                      key={account.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Creator Owner */}
                      <TableCell className="py-3.5 px-4">
                        <Link
                          href={`/admin/users/${account.creator_id}`}
                          className="flex items-center gap-3 group"
                        >
                          {account.creator.avatar_url ? (
                            <img
                              src={account.creator.avatar_url}
                              alt={account.creator.full_name || "Creator"}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-semibold text-xs">
                              {account.creator.full_name?.charAt(0) || "C"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {account.creator.full_name}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-slate-400 font-mono">
                              {account.creator.email || "No email"}
                            </p>
                          </div>
                        </Link>
                      </TableCell>

                      {/* Platform */}
                      <TableCell className="py-3.5 px-4">
                        {renderPlatformBadge(account.platform)}
                      </TableCell>

                      {/* Social Handle */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-semibold text-gray-900 dark:text-slate-200">
                            {account.handle.startsWith("@")
                              ? account.handle
                              : `@${account.handle}`}
                          </span>
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                            title="Open external profile"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        {account.display_name && (
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 font-sans truncate max-w-[160px]">
                            {account.display_name}
                          </p>
                        )}
                      </TableCell>

                      {/* Followers */}
                      <TableCell className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                          {formatFollowers(account.follower_count)}
                        </span>
                        {account.follower_count !== null && (
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                            {account.follower_count.toLocaleString()}
                          </p>
                        )}
                      </TableCell>

                      {/* Engagement */}
                      <TableCell className="py-3.5 px-4 text-gray-500 dark:text-slate-400">
                        {account.video_count || account.likes_count ? (
                          <div className="space-y-0.5 text-[11px] font-mono">
                            {account.video_count !== null && (
                              <p className="flex items-center gap-1">
                                <Video className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                                <span>{account.video_count} videos</span>
                              </p>
                            )}
                            {account.likes_count !== null && account.likes_count > 0 && (
                              <p className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-rose-500" />
                                <span>{formatFollowers(account.likes_count)}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-slate-600 font-mono text-[11px]">
                            Not synced
                          </span>
                        )}
                      </TableCell>

                      {/* Verification Status */}
                      <TableCell className="py-3.5 px-4">
                        {renderStatusBadge(account.verification_status)}
                      </TableCell>

                      {/* Connected At */}
                      <TableCell className="py-3.5 px-4 text-gray-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(account.connected_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/accounts/${account.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 transition-colors"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info & TailAdmin Pagination */}
        <div className="p-4 bg-gray-50 dark:bg-[#080B14] border-t border-gray-200 dark:border-slate-800 text-[11px] font-sans text-gray-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            Showing {paginatedAccounts.length} of {filteredAccounts.length} connected profiles (Page {currentPage} of {totalPages})
          </span>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
