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
import Button from "@/components/admin/components/ui/button/Button";
import {
  ConnectedSocialAccountItem,
  SocialAccountsOverview,
} from "@/app/actions/admin-accounts";

interface AccountsTableManagerProps {
  initialData: SocialAccountsOverview;
}

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

  // Platform Badge Styling
  const getPlatformBadge = (platform: string) => {
    const p = platform.toLowerCase();
    switch (p) {
      case "tiktok":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            TikTok
          </span>
        );
      case "instagram":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
            Instagram
          </span>
        );
      case "youtube":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            YouTube
          </span>
        );
      case "x":
      case "twitter":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            X (Twitter)
          </span>
        );
      case "facebook":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Facebook
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-300">
            {platform}
          </span>
        );
    }
  };

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
            Unverified
          </span>
        );
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

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              Connected Social Accounts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {metrics.totalAccounts} Linked Profiles
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Directory of all social media profiles connected to Kpugi creator accounts across TikTok, Instagram, YouTube, and X.
          </p>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Total Connected
            </span>
            <Share2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-display">
            {metrics.totalAccounts}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Linked creator channels
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Verified Profiles
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-display">
            {metrics.verifiedAccounts}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">
            {metrics.totalAccounts > 0
              ? `${Math.round(
                  (metrics.verifiedAccounts / metrics.totalAccounts) * 100
                )}% verification rate`
              : "0%"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Aggregate Reach
            </span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-display">
            {formatFollowers(metrics.totalAudienceReach)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Combined audience followers
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Top Channels
            </span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-slate-300">
              TT: <b className="text-white">{metrics.platformBreakdown.tiktok}</b>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-300">
              IG: <b className="text-white">{metrics.platformBreakdown.instagram}</b>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-300">
              X: <b className="text-white">{metrics.platformBreakdown.x}</b>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-sans">
            Network distribution
          </p>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#0C101A] border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by handle (@...), creator name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#080B14] border border-slate-800 text-white text-xs font-sans placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Sort & Status Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#080B14] border border-slate-800 text-xs text-slate-300 font-sans focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending</option>
              <option value="unverified">Unverified Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#080B14] border border-slate-800 text-xs text-slate-300 font-sans focus:outline-none focus:border-indigo-500"
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
              onClick={() => setSelectedPlatform(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all whitespace-nowrap ${
                selectedPlatform === tab.id
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-[#080B14] text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-black/30 opacity-80">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Social Accounts Table */}
      <div className="rounded-2xl bg-[#0C101A] border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080B14] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Creator / Owner</th>
                <th className="py-3.5 px-4 font-semibold">Platform</th>
                <th className="py-3.5 px-4 font-semibold">Social Handle</th>
                <th className="py-3.5 px-4 font-semibold text-right">Followers</th>
                <th className="py-3.5 px-4 font-semibold">Engagement</th>
                <th className="py-3.5 px-4 font-semibold">Verification</th>
                <th className="py-3.5 px-4 font-semibold">Connected</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No connected accounts found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  const profileUrl = getProfileUrl(
                    account.platform,
                    account.handle
                  );

                  return (
                    <tr
                      key={account.id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Creator Owner */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/users/${account.creator_id}`}
                          className="flex items-center gap-3 group"
                        >
                          {account.creator.avatar_url ? (
                            <img
                              src={account.creator.avatar_url}
                              alt={account.creator.full_name || "Creator"}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
                              {account.creator.full_name?.charAt(0) || "C"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                              {account.creator.full_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {account.creator.email || "No email"}
                            </p>
                          </div>
                        </Link>
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-4">
                        {getPlatformBadge(account.platform)}
                      </td>

                      {/* Social Handle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-semibold text-slate-200">
                            {account.handle.startsWith("@")
                              ? account.handle
                              : `@${account.handle}`}
                          </span>
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Open external profile"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        {account.display_name && (
                          <p className="text-[11px] text-slate-400 font-sans truncate max-w-[160px]">
                            {account.display_name}
                          </p>
                        )}
                      </td>

                      {/* Followers */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-white text-sm">
                          {formatFollowers(account.follower_count)}
                        </span>
                        {account.follower_count !== null && (
                          <p className="text-[10px] text-slate-500 font-mono">
                            {account.follower_count.toLocaleString()}
                          </p>
                        )}
                      </td>

                      {/* Engagement */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {account.video_count || account.likes_count ? (
                          <div className="space-y-0.5 text-[11px] font-mono">
                            {account.video_count !== null && (
                              <p className="flex items-center gap-1">
                                <Video className="w-3 h-3 text-slate-500" />
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
                          <span className="text-slate-600 font-mono text-[11px]">
                            Not synced
                          </span>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(account.verification_status)}
                      </td>

                      {/* Connected At */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(account.connected_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/accounts/${account.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-indigo-400 hover:text-white hover:bg-indigo-600/20 transition-colors"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#080B14] border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span>Showing {filteredAccounts.length} of {accounts.length} connected profiles</span>
          <span>Kpugi Social Accounts Registry</span>
        </div>
      </div>
    </div>
  );
}
