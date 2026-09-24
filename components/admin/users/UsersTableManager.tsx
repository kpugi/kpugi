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
import Badge from "@/components/admin/components/ui/badge/Badge";
import Pagination from "@/components/admin/components/tables/Pagination";
import UserSuspensionModal from "./modals/UserSuspensionModal";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Sparkles,
  ChevronRight,
  Wallet,
  Trophy,
  Award,
} from "lucide-react";
import { getCreatorLevel, CREATOR_LEVELS } from "@/lib/utils/levels";
import CreatorLevelBadge from "@/components/creator/CreatorLevelBadge";

export interface UserRowData {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  account_status: "active" | "suspended";
  suspended_reason?: string | null;
  creator_profile?: {
    display_name?: string | null;
    creator_handle?: string | null;
    kyc_status?: string | null;
    total_earned?: number;
  } | null;
  advertiser_profile?: {
    company_name?: string | null;
    company_website?: string | null;
  } | null;
  wallets?: Array<{
    wallet_type: string;
    balance: number;
  }>;
  social_accounts?: Array<{
    platform: string;
    handle: string;
    follower_count?: number;
  }>;
}

interface UsersTableManagerProps {
  initialUsers: UserRowData[];
  currentAdminId: string;
}

type SortField = "name" | "role" | "balance" | "joined" | "rank";
type SortDirection = "asc" | "desc";

export default function UsersTableManager({
  initialUsers,
  currentAdminId,
}: UsersTableManagerProps) {
  const [users, setUsers] = useState<UserRowData[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "creator" | "advertiser" | "both" | "admin" | "suspended"
  >("all");
  const [kycFilter, setKycFilter] = useState<"all" | "verified" | "pending" | "unverified">("all");
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("joined");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Suspension Modal State
  const [suspensionTarget, setSuspensionTarget] = useState<{
    id: string;
    fullName: string;
    email: string;
    isSuspended: boolean;
  } | null>(null);
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);

  // Global KPI Calculations
  const totalUsers = users.length;
  const creatorCount = users.filter((u) => u.role === "creator" || u.role === "both").length;
  const advertiserCount = users.filter((u) => u.role === "advertiser" || u.role === "both").length;
  const kycVerifiedCount = users.filter(
    (u) => u.creator_profile?.kyc_status === "verified"
  ).length;
  const adminCount = users.filter((u) => u.is_admin).length;
  const suspendedCount = users.filter((u) => u.account_status === "suspended").length;

  // Creator Gamification Rank Analytics
  const topTierCreatorsCount = users.filter((u) => {
    const earned = Number(u.creator_profile?.total_earned) || 0;
    return getCreatorLevel(earned).currentLevelNumber >= 6;
  }).length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setKycFilter("all");
    setRankFilter("all");
    setSortField("joined");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  // Helper: compute total user balance across wallets
  const getUserBalance = (u: UserRowData) => {
    if (!u.wallets || u.wallets.length === 0) return 0;
    return u.wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  };

  // Filter and Sort Logic
  const filteredData = useMemo(() => {
    let result = [...users];

    // Role & status filter
    if (roleFilter === "creator") {
      result = result.filter((u) => u.role === "creator");
    } else if (roleFilter === "advertiser") {
      result = result.filter((u) => u.role === "advertiser");
    } else if (roleFilter === "both") {
      result = result.filter((u) => u.role === "both");
    } else if (roleFilter === "admin") {
      result = result.filter((u) => u.is_admin);
    } else if (roleFilter === "suspended") {
      result = result.filter((u) => u.account_status === "suspended");
    }

    // KYC filter
    if (kycFilter !== "all") {
      result = result.filter(
        (u) => (u.creator_profile?.kyc_status || "unverified") === kycFilter
      );
    }

    // Creator Rank filter
    if (rankFilter !== "all") {
      if (rankFilter === "top_tier") {
        result = result.filter((u) => {
          const earned = Number(u.creator_profile?.total_earned) || 0;
          return getCreatorLevel(earned).currentLevelNumber >= 6;
        });
      } else {
        const targetLvl = parseInt(rankFilter, 10);
        result = result.filter((u) => {
          const earned = Number(u.creator_profile?.total_earned) || 0;
          return getCreatorLevel(earned).currentLevelNumber === targetLvl;
        });
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.clerk_id.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.creator_profile?.creator_handle?.toLowerCase().includes(q) ||
          u.creator_profile?.display_name?.toLowerCase().includes(q) ||
          u.advertiser_profile?.company_name?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case "name": {
          const nameA = (a.full_name || a.email).toLowerCase();
          const nameB = (b.full_name || b.email).toLowerCase();
          comp = nameA.localeCompare(nameB);
          break;
        }
        case "role":
          comp = a.role.localeCompare(b.role);
          break;
        case "rank": {
          const earnedA = Number(a.creator_profile?.total_earned) || 0;
          const earnedB = Number(b.creator_profile?.total_earned) || 0;
          comp = earnedA - earnedB;
          break;
        }
        case "balance":
          comp = getUserBalance(a) - getUserBalance(b);
          break;
        case "joined":
          comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === "asc" ? comp : -comp;
    });

    return result;
  }, [users, roleFilter, kycFilter, rankFilter, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const isFiltered =
    searchQuery.trim() !== "" ||
    roleFilter !== "all" ||
    kycFilter !== "all" ||
    rankFilter !== "all" ||
    sortField !== "joined" ||
    sortDirection !== "desc";

  // Handle local suspension success callback
  const handleSuspensionSuccess = (newStatus: "active" | "suspended") => {
    if (!suspensionTarget) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === suspensionTarget.id ? { ...u, account_status: newStatus } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* 1. METRIC KPI CARDS STRIP */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Total Users
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2">
            {totalUsers}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Creators &amp; Ranks
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2">
            {creatorCount}
          </p>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
            {topTierCreatorsCount} Top Tier (Lvl 6+)
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Advertisers
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2">
            {advertiserCount}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              KYC Verified
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-2">
            {kycVerifiedCount}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Admins / Flagged
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center">
              {suspendedCount > 0 ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <Shield className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-xl font-bold font-mono text-gray-900 dark:text-white">
              {adminCount}
            </p>
            {suspendedCount > 0 && (
              <span className="text-xs font-mono font-bold text-rose-500">
                ({suspendedCount} suspended)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. TAILADMIN BASIC TABLE 1 CONTAINER */}
      {/* ---------------------------------------------------- */}
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0C101A] shadow-xs">
        {/* Table Header Toolbar: Search & Filter Pills */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800/80 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            <div>
              <h2 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 flex items-center gap-2">
                <span>User Accounts & RBAC Governance</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {users.length} Total
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Audit platform identities, verify Didit KYC clearance, manage wallets, and issue administrative access.
              </p>
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
              {[
                { id: "all", label: "All", count: totalUsers },
                { id: "creator", label: "Creators", count: creatorCount },
                { id: "advertiser", label: "Brands", count: advertiserCount },
                { id: "admin", label: "Admins", count: adminCount },
                { id: "suspended", label: "Suspended", count: suspendedCount },
              ].map((st) => {
                const isActive = roleFilter === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setRoleFilter(st.id as any);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{st.label}</span>
                    <span
                      className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                        isActive
                          ? "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400"
                          : "bg-gray-200/70 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {st.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-toolbar: KYC Dropdown + Search Input + Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/80 dark:border-gray-800/60">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>Didit KYC:</span>
                <select
                  value={kycFilter}
                  onChange={(e) => {
                    setKycFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="h-9 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                >
                  <option value="all">All Verification States</option>
                  <option value="verified">KYC Verified</option>
                  <option value="pending">KYC Pending</option>
                  <option value="unverified">Unverified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Creator Rank Filter */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Rank:</span>
                <select
                  value={rankFilter}
                  onChange={(e) => {
                    setRankFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                >
                  <option value="all">All Creator Ranks</option>
                  <option value="top_tier">⭐ Top Tier (Lvl 6+ • ₦1M+)</option>
                  {CREATOR_LEVELS.map((lvl) => (
                    <option key={lvl.level} value={lvl.level.toString()}>
                      {lvl.icon} Lvl {lvl.level}: {lvl.title}
                    </option>
                  ))}
                </select>
              </div>

              {isFiltered && (
                <button
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, email, clerk id, handle..."
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

        {/* Table Element */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/70 dark:bg-slate-900/40">
              <TableRow>
                {/* User / Identity (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("name")}
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>User / Identity</span>
                    {sortField === "name" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                    )}
                  </div>
                </TableCell>

                {/* Role & Status (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("role")}
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role &amp; Status</span>
                    {sortField === "role" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                    )}
                  </div>
                </TableCell>

                {/* Creator Rank (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("rank")}
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Creator Rank</span>
                    {sortField === "rank" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                    )}
                  </div>
                </TableCell>

                {/* KYC Verification */}
                <TableCell
                  isHeader
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                >
                  Didit KYC
                </TableCell>

                {/* Joined (Sortable) */}
                <TableCell
                  isHeader
                  onClick={() => handleSort("joined")}
                  className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Joined</span>
                    {sortField === "joined" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
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
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-gray-400 text-xs"
                  >
                    No user profiles match your selected search or filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  const isSuspended = u.account_status === "suspended";
                  const kycStatus = u.creator_profile?.kyc_status || "unverified";

                  return (
                    <TableRow
                      key={u.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* User / Identity */}
                      <TableCell className="px-5 py-3.5 text-start">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 shrink-0 relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300">
                            {u.avatar_url ? (
                              <Image
                                width={36}
                                height={36}
                                src={u.avatar_url}
                                alt={u.full_name || "User Avatar"}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              (u.full_name || u.email).slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-gray-900 dark:text-white truncate block">
                                {u.full_name || "Anonymous User"}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono truncate block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role & Status */}
                      <TableCell className="px-5 py-3.5 text-start whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              u.role === "advertiser"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                                : u.role === "both"
                                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {u.role}
                          </span>

                          {isSuspended && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                              Suspended
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Creator Rank */}
                      <TableCell className="px-5 py-3.5 text-start whitespace-nowrap">
                        {u.role === "creator" || u.role === "both" || u.creator_profile ? (
                          <div className="flex flex-col gap-0.5 items-start">
                            <CreatorLevelBadge
                              totalEarned={Number(u.creator_profile?.total_earned) || 0}
                              variant="pill"
                            />
                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 pl-1">
                              ₦{(Number(u.creator_profile?.total_earned) || 0).toLocaleString()} earned
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* KYC Verification */}
                      <TableCell className="px-5 py-3.5 text-start whitespace-nowrap">
                        {kycStatus === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>Didit Verified</span>
                          </span>
                        ) : kycStatus === "pending" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                            <span>Pending Review</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                            Unverified
                          </span>
                        )}
                      </TableCell>

                      {/* Joined Date (Stacked date + time) */}
                      <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {new Date(u.created_at).toLocaleDateString()}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(u.created_at).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="px-5 py-3.5 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Suspend / Reactivate trigger */}
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => {
                                setSuspensionTarget({
                                  id: u.id,
                                  fullName: u.full_name || "User",
                                  email: u.email,
                                  isSuspended,
                                });
                                setIsSuspensionModalOpen(true);
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                                isSuspended
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100"
                                  : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                              }`}
                            >
                              {isSuspended ? "Reactivate" : "Suspend"}
                            </button>
                          )}

                          {/* Inspect Profile Link */}
                          <Link
                            href={`/admin/users/${u.id}`}
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} records
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Suspension Modal */}
      <UserSuspensionModal
        isOpen={isSuspensionModalOpen}
        onClose={() => {
          setIsSuspensionModalOpen(false);
          setSuspensionTarget(null);
        }}
        user={suspensionTarget}
        onSuccess={handleSuspensionSuccess}
      />
    </div>
  );
}
