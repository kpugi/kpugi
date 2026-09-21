"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Shield,
  Video,
  Building2,
  ChevronRight,
  Clock,
  Code2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/components/ui/table";
import Pagination from "@/components/admin/components/tables/Pagination";
import Badge from "@/components/admin/components/ui/badge/Badge";

interface AuditLogsManagerProps {
  creatorLogs: any[];
  brandLogs: any[];
  adminLogs: any[];
}

type TabType = "creators" | "brands" | "admin";

const ITEMS_PER_PAGE = 10;

export default function AuditLogsManager({
  creatorLogs = [],
  brandLogs = [],
  adminLogs = [],
}: AuditLogsManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("creators");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<"time" | "user" | "category" | "action" | "target">("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when switching tabs, search, or filters
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategory, sortField, sortDirection]);

  const handleSort = (field: "time" | "user" | "category" | "action" | "target") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortField("time");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    sortField !== "time" ||
    sortDirection !== "desc";

  const formatTimeAgo = (dateString: string) => {
    const ms = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(ms / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Get active dataset
  const currentLogs = useMemo(() => {
    switch (activeTab) {
      case "creators":
        return creatorLogs;
      case "brands":
        return brandLogs;
      case "admin":
        return adminLogs;
    }
  }, [activeTab, creatorLogs, brandLogs, adminLogs]);

  // Filter logs by search query and category
  const filteredLogs = useMemo(() => {
    const list = currentLogs.filter((log) => {
      // Category filter
      if (selectedCategory !== "all") {
        const cat = log.action_category || log.action?.split(".")[0] || "general";
        if (cat.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
      const name = profile?.full_name?.toLowerCase() || "";
      const email = profile?.email?.toLowerCase() || "";
      const action = log.action?.toLowerCase() || "";
      const details = log.details?.toLowerCase() || "";
      const targetId = log.target_id?.toLowerCase() || "";

      return (
        name.includes(q) ||
        email.includes(q) ||
        action.includes(q) ||
        details.includes(q) ||
        targetId.includes(q)
      );
    });

    list.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case "user": {
          const profileA = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
          const profileB = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
          const nameA = profileA?.full_name || profileA?.email || "";
          const nameB = profileB?.full_name || profileB?.email || "";
          comp = nameA.localeCompare(nameB);
          break;
        }
        case "category": {
          const catA = a.action_category || a.action?.split(".")[0] || "general";
          const catB = b.action_category || b.action?.split(".")[0] || "general";
          comp = catA.localeCompare(catB);
          break;
        }
        case "action": {
          comp = (a.action || "").localeCompare(b.action || "");
          break;
        }
        case "target": {
          const targetA = (a.target_table || "") + (a.target_id || "");
          const targetB = (b.target_table || "") + (b.target_id || "");
          comp = targetA.localeCompare(targetB);
          break;
        }
        case "time":
        default:
          comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDirection === "asc" ? comp : -comp;
    });

    return list;
  }, [currentLogs, searchQuery, selectedCategory, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const renderCategoryIndicator = (cat: string) => {
    const c = cat.toLowerCase();

    if (c === "finance") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Finance
        </span>
      );
    }

    if (c === "campaign") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          Campaign
        </span>
      );
    }

    if (c === "submission") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
          Submission
        </span>
      );
    }

    if (c === "account") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          Account
        </span>
      );
    }

    if (c === "security") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          Security
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60 capitalize">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
        {cat}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setActiveTab("creators");
            setSelectedCategory("all");
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === "creators"
              ? "bg-purple-50/70 border-purple-300 dark:bg-purple-950/20 dark:border-purple-800/80 shadow-sm"
              : "bg-white border-gray-200/80 hover:border-gray-300 dark:bg-gray-900/50 dark:border-gray-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider font-mono">
              Creator Trails
            </span>
            <Video className="w-4 h-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-display text-gray-900 dark:text-white">
            {creatorLogs.length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-sans">
            Account linking, verification, submissions &amp; payouts
          </p>
        </button>

        <button
          onClick={() => {
            setActiveTab("brands");
            setSelectedCategory("all");
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === "brands"
              ? "bg-blue-50/70 border-blue-300 dark:bg-blue-950/20 dark:border-blue-800/80 shadow-sm"
              : "bg-white border-gray-200/80 hover:border-gray-300 dark:bg-gray-900/50 dark:border-gray-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Brand Trails
            </span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-display text-gray-900 dark:text-white">
            {brandLogs.length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-sans">
            Campaign creation, funding, wallet deposits &amp; updates
          </p>
        </button>

        <button
          onClick={() => {
            setActiveTab("admin");
            setSelectedCategory("all");
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === "admin"
              ? "bg-rose-50/70 border-rose-300 dark:bg-rose-950/20 dark:border-rose-800/80 shadow-sm"
              : "bg-white border-gray-200/80 hover:border-gray-300 dark:bg-gray-900/50 dark:border-gray-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider font-mono">
              Admin &amp; Controls
            </span>
            <Shield className="w-4 h-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-display text-gray-900 dark:text-white">
            {adminLogs.length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-sans">
            Operator overrides, hero pins &amp; batch settlement
          </p>
        </button>
      </div>

      {/* TailAdmin Data Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white px-5 pt-5 pb-5 sm:px-6 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 w-fit">
            <button
              onClick={() => setActiveTab("creators")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "creators"
                  ? "bg-white text-purple-700 dark:bg-gray-900 dark:text-purple-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Creator Trails ({creatorLogs.length})
            </button>
            <button
              onClick={() => setActiveTab("brands")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "brands"
                  ? "bg-white text-blue-700 dark:bg-gray-900 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Brand Trails ({brandLogs.length})
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-white text-rose-700 dark:bg-gray-900 dark:text-rose-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Controls ({adminLogs.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search action, user, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/80 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
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

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/80 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="account">Account</option>
              <option value="submission">Submission</option>
              <option value="campaign">Campaign</option>
              <option value="finance">Finance</option>
              <option value="security">Security</option>
            </select>
          </div>
        </div>

        {/* TailAdmin Table */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  onClick={() => handleSort("time")}
                  className="py-3.5 font-semibold text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Timestamp</span>
                    {sortField === "time" ? (
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
                <TableCell
                  isHeader
                  onClick={() => handleSort("user")}
                  className="py-3.5 font-semibold text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{activeTab === "admin" ? "Operator / Actor" : "User / Account"}</span>
                    {sortField === "user" ? (
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
                <TableCell
                  isHeader
                  onClick={() => handleSort("category")}
                  className="py-3.5 font-semibold text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    {sortField === "category" ? (
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
                <TableCell
                  isHeader
                  onClick={() => handleSort("action")}
                  className="py-3.5 font-semibold text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Action &amp; Description</span>
                    {sortField === "action" ? (
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
                <TableCell
                  isHeader
                  onClick={() => handleSort("target")}
                  className="py-3.5 font-semibold text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Target Entity</span>
                    {sortField === "target" ? (
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
                <TableCell
                  isHeader
                  className="py-3.5 font-semibold text-gray-500 text-end text-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No matching audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log: any) => {
                  const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
                  const isSystem =
                    activeTab === "admin" &&
                    (!log.profiles || log.action === "auto_settlement_reconciled");
                  const actorName = isSystem
                    ? "System Engine"
                    : profile?.full_name || "Platform User";
                  const category = log.action_category || log.action?.split(".")[0] || "general";

                  return (
                    <TableRow
                      key={log.id}
                      onClick={() => router.push(`/admin/audit/${log.id}?type=${activeTab}`)}
                      className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <TableCell className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-gray-400 font-sans flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimeAgo(log.created_at)}
                        </div>
                      </TableCell>

                      {/* User / Operator */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              activeTab === "creators"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                : activeTab === "brands"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            }`}
                          >
                            {actorName.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                              {actorName}
                            </p>
                            {profile?.email && (
                              <p className="text-[10px] text-gray-400 truncate max-w-[140px] font-sans">
                                {profile.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Category Indicator Pill */}
                      <TableCell className="py-3.5 px-4">
                        {renderCategoryIndicator(category)}
                      </TableCell>

                      {/* Action & Narrative */}
                      <TableCell className="py-3.5 px-4 max-w-xs">
                        <p className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {log.action}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 font-sans">
                          {log.details || "Action recorded in platform audit ledger"}
                        </p>
                      </TableCell>

                      {/* Target Entity */}
                      <TableCell className="py-3.5 px-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                        {log.target_table ? (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {log.target_table}
                            </span>
                            {log.target_id && (
                              <span className="text-gray-400 dark:text-gray-500 block text-[10px]">
                                #{String(log.target_id).slice(0, 8)}
                              </span>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      {/* Action Button */}
                      <TableCell className="py-3.5 px-4 text-end">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 group-hover:text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-all">
                          Inspect
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
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
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {filteredLogs.length}
              </span>{" "}
              records
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
