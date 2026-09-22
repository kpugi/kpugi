"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  Bot,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Code,
  GitBranch,
  Clock,
  Terminal,
  Layers,
  Search,
  Check,
  Loader2,
  Zap,
  SlidersHorizontal,
  DollarSign,
  ChevronRight,
  Database,
  Server,
  Workflow,
  Cpu,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/components/ui/table";
import Button from "@/components/admin/components/ui/button/Button";
import Pagination from "@/components/admin/components/tables/Pagination";
import DispatchWorkflowModal from "./modals/DispatchWorkflowModal";
import RawTelemetryModal from "./modals/RawTelemetryModal";
import {
  getGitHubWorkflowStatusAction,
  getApifyStatusAction,
  testScrapePlaygroundAction,
  triggerGlobalBatchScrapeAction,
  GitHubWorkflowRun,
  ApifySystemStatus,
} from "@/app/actions/admin-scraper";
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  TwitterXIcon,
  FacebookIcon,
} from "@/components/ui/SocialIcons";

export interface VerificationCheckRow {
  id: string;
  submission_id: string;
  checked_at: string;
  post_reachable: boolean;
  view_count: number | null;
  raw_scrape: Record<string, unknown> | null;
  notes: string | null;
  submission?: {
    id: string;
    post_url: string | null;
    status: string;
    campaign?: {
      title: string;
    } | null;
    creator?: {
      full_name?: string | null;
      display_name?: string | null;
      creator_handle?: string | null;
      avatar_url?: string | null;
    } | null;
  } | null;
}

export interface SubmissionAuditRow {
  id: string;
  submission_id: string;
  campaign_id: string;
  creator_id: string;
  cycle_number: number;
  views_scraped: number;
  views_delta: number;
  payout_amount: number;
  status: string;
  settled_at: string;
  failure_reason?: string | null;
  submission?: {
    post_url?: string | null;
    creator?: {
      full_name?: string | null;
      display_name?: string | null;
      creator_handle?: string | null;
    } | null;
    campaign?: {
      title?: string | null;
    } | null;
  } | null;
}

interface ScraperDashboardManagerProps {
  initialSummary: {
    totalChecks: number;
    reachabilityRate: number;
    recentViewsDelta: number;
    dueSubmissionsCount: number;
    totalSettledCount: number;
  };
  initialGitHubStatus: {
    connected: boolean;
    repo: string;
    workflowFile: string;
    totalCount: number;
    runs: GitHubWorkflowRun[];
    error?: string;
  };
  initialApifyStatus: ApifySystemStatus;
  initialChecks: VerificationCheckRow[];
  initialAudits: SubmissionAuditRow[];
  extractorDistribution: Record<string, number>;
}

export default function ScraperDashboardManager({
  initialSummary,
  initialGitHubStatus,
  initialApifyStatus,
  initialChecks,
  initialAudits,
  extractorDistribution,
}: ScraperDashboardManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "github" | "apify" | "telemetry" | "settlements" | "playground"
  >("overview");

  // GitHub state
  const [gitHubStatus, setGitHubStatus] = useState(initialGitHubStatus);
  const [isRefreshingGitHub, setIsRefreshingGitHub] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Apify state
  const [apifyStatus, setApifyStatus] = useState(initialApifyStatus);
  const [isRefreshingApify, setIsRefreshingApify] = useState(false);

  // Global Scrape state
  const [isTriggeringBatch, setIsTriggeringBatch] = useState(false);
  const [batchActionMsg, setBatchActionMsg] = useState<string | null>(null);

  // Modals state
  const [inspectModalData, setInspectModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    data: Record<string, unknown> | null;
  }>({
    isOpen: false,
    title: "",
    data: null,
  });

  // Telemetry Tab Filtering & Pagination
  const [telemetrySearch, setTelemetrySearch] = useState("");
  const [telemetryPlatform, setTelemetryPlatform] = useState("all");
  const [telemetryReachability, setTelemetryReachability] = useState<
    "all" | "reachable" | "unreachable"
  >("all");
  const [telemetryEngine, setTelemetryEngine] = useState("all");
  const [telemetryPage, setTelemetryPage] = useState(1);
  const [telemetryPerPage, setTelemetryPerPage] = useState(10);

  // Settlements Tab Pagination
  const [settlementsPage, setSettlementsPage] = useState(1);
  const [settlementsPerPage, setSettlementsPerPage] = useState(10);

  // Playground state
  const [playgroundUrl, setPlaygroundUrl] = useState("");
  const [playgroundEngine, setPlaygroundEngine] = useState<
    "auto" | "apify" | "fallback"
  >("auto");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<any | null>(null);

  // Helper to format stacked dates
  const renderStackedDate = (dateVal: string | null | undefined) => {
    if (!dateVal) return <span className="text-gray-400 font-mono text-xs">—</span>;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return <span className="text-gray-400 font-mono text-xs">—</span>;
    return (
      <div className="flex flex-col">
        <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
          {d.toLocaleDateString()}
        </span>
        <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
          {d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>
    );
  };

  const getPlatformFromUrl = (url: string | null | undefined): string => {
    if (!url) return "generic";
    const low = url.toLowerCase();
    if (low.includes("tiktok.com")) return "tiktok";
    if (low.includes("instagram.com")) return "instagram";
    if (low.includes("youtube.com") || low.includes("youtu.be")) return "youtube";
    if (low.includes("twitter.com") || low.includes("x.com")) return "x";
    if (low.includes("facebook.com")) return "facebook";
    return "generic";
  };

  const renderPlatformIcon = (platform: string, className = "w-3.5 h-3.5") => {
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
  };

  // Refresh GitHub Actions runs
  const handleRefreshGitHub = async () => {
    setIsRefreshingGitHub(true);
    try {
      const res = await getGitHubWorkflowStatusAction(20);
      setGitHubStatus(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRefreshingGitHub(false);
    }
  };

  // Refresh Apify status
  const handleRefreshApify = async () => {
    setIsRefreshingApify(true);
    try {
      const res = await getApifyStatusAction();
      setApifyStatus(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRefreshingApify(false);
    }
  };

  // Global batch audit trigger
  const handleTriggerGlobalBatch = async () => {
    setIsTriggeringBatch(true);
    setBatchActionMsg(null);
    try {
      const res = await triggerGlobalBatchScrapeAction();
      setBatchActionMsg(`Dispatched via ${res.channel}: ${res.message}`);
    } catch (err: any) {
      setBatchActionMsg(`Error: ${err.message || "Failed to trigger batch"}`);
    } finally {
      setIsTriggeringBatch(false);
    }
  };

  // Playground execution
  const handleRunPlayground = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundUrl.trim()) return;
    setIsPlaying(true);
    setPlaygroundResult(null);
    try {
      const res = await testScrapePlaygroundAction(playgroundUrl, playgroundEngine);
      setPlaygroundResult(res);
    } catch (err: any) {
      setPlaygroundResult({
        success: false,
        durationMs: 0,
        error: err.message || "Scrape execution error",
      });
    } finally {
      setIsPlaying(false);
    }
  };

  // Filtered Telemetry checks
  const filteredChecks = useMemo(() => {
    let list = [...initialChecks];

    if (telemetryPlatform !== "all") {
      list = list.filter((c) => {
        const p = getPlatformFromUrl(c.submission?.post_url);
        return p.toLowerCase() === telemetryPlatform.toLowerCase();
      });
    }

    if (telemetryReachability === "reachable") {
      list = list.filter((c) => c.post_reachable);
    } else if (telemetryReachability === "unreachable") {
      list = list.filter((c) => !c.post_reachable);
    }

    if (telemetryEngine !== "all") {
      list = list.filter((c) => {
        const ext = (c.raw_scrape as any)?.extractor || "";
        return ext.toLowerCase().includes(telemetryEngine.toLowerCase());
      });
    }

    if (telemetrySearch.trim()) {
      const q = telemetrySearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.submission_id.toLowerCase().includes(q) ||
          c.submission?.post_url?.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q) ||
          c.submission?.creator?.full_name?.toLowerCase().includes(q) ||
          c.submission?.creator?.creator_handle?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    initialChecks,
    telemetryPlatform,
    telemetryReachability,
    telemetryEngine,
    telemetrySearch,
  ]);

  const telemetryTotalPages =
    Math.ceil(filteredChecks.length / telemetryPerPage) || 1;
  const paginatedChecks = useMemo(() => {
    const start = (telemetryPage - 1) * telemetryPerPage;
    return filteredChecks.slice(start, start + telemetryPerPage);
  }, [filteredChecks, telemetryPage, telemetryPerPage]);

  // Paginated Settlements
  const settlementsTotalPages =
    Math.ceil(initialAudits.length / settlementsPerPage) || 1;
  const paginatedAudits = useMemo(() => {
    const start = (settlementsPage - 1) * settlementsPerPage;
    return initialAudits.slice(start, start + settlementsPerPage);
  }, [initialAudits, settlementsPage, settlementsPerPage]);

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* TOP HEADER COMMAND STRIP */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Scraper &amp; Verification Command Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Engine</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Orchestration, telemetry analytics, and multi-tier extractor health across GitHub Actions, Apify, and local workers.
          </p>
        </div>

        {/* Quick Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("playground")}
            className="gap-1.5 text-xs font-semibold"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Playground</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerGlobalBatch}
            disabled={isTriggeringBatch}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringBatch ? "animate-spin" : ""}`} />
            <span>Run Audit Batch</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsDispatchModalOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Dispatch GitHub Actions</span>
          </Button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {batchActionMsg && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/60 dark:bg-blue-950/40 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{batchActionMsg}</span>
          </div>
          <button
            onClick={() => setBatchActionMsg(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {dispatchSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-900/60 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{dispatchSuccessMsg}</span>
          </div>
          <button
            onClick={() => setDispatchSuccessMsg(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5 KPI SUMMARY CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Total Logged Checks
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
              {initialSummary.totalChecks.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Automated scrape ledger records
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Reachability Rate
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {initialSummary.reachabilityRate}%
            </span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Healthy live target URLs
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Audits Due Now
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {initialSummary.dueSubmissionsCount}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Ready for recurring cycle
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Settlement Batches
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {initialSummary.totalSettledCount}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Reconciled submission audits
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Cron Automation
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
              Hourly (0 * * * *)
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Active 24/7 GitHub Runner
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* NAVIGATION TABS */}
      {/* ---------------------------------------------------- */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {[
            { id: "overview", label: "Overview", icon: Cpu },
            {
              id: "github",
              label: "GitHub Actions",
              icon: Workflow,
              badge: gitHubStatus.connected ? `${gitHubStatus.runs.length} runs` : "PAT Needed",
            },
            {
              id: "apify",
              label: "Apify",
              icon: Server,
              badge: apifyStatus.connected ? "Connected" : "Inactive",
            },
            {
              id: "telemetry",
              label: "Telemetry Checks Ledger",
              icon: Activity,
              badge: `${initialSummary.totalChecks}`,
            },
            {
              id: "settlements",
              label: "Settlement Audits",
              icon: DollarSign,
              badge: `${initialSummary.totalSettledCount}`,
            },
            { id: "playground", label: "Scrape Playground", icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors ${
                  isActive
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & SYSTEM MATRIX */}
      {/* ---------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Subsystem Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* GitHub Actions Card */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center">
                    <Workflow className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      GitHub Actions Runner
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {gitHubStatus.repo}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Scheduled cron (<code className="font-mono text-[10px]">0 * * * *</code>) executes automated scraping &amp; settlement runs in Ubuntu container.
              </p>
              <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Recent Runs:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {gitHubStatus.runs.length} logged
                </span>
              </div>
            </div>

            {/* Apify Engine Card */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Apify Scraper Engine
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {apifyStatus.username || "Account Connected"}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Actor <code className="font-mono text-[10px] text-brand-500">{apifyStatus.actorId}</code> delivers 100% verified Instagram post metrics &amp; engagement.
              </p>
              <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Cloud Runs:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {apifyStatus.recentRuns.length} runs monitored
                </span>
              </div>
            </div>

            {/* Universal Fallback Router Card */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Multi-Tier Fallback
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">
                      yt-dlp • FixTweet • OpenGraph
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Ready
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Zero-auth high-speed crawlers for TikTok, YouTube, X, and OpenGraph metadata extraction with zero downtime.
              </p>
              <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Total Checks Logged:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {initialSummary.totalChecks.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Extractor Distribution Grid */}
          <div className="p-6 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Extractor Engine Utilization &amp; Telemetry Distribution
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Breakdown of recent scraping operations by specialized extractor engine.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(extractorDistribution).map(([name, count]) => (
                <div
                  key={name}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-white/2"
                >
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block truncate">
                    {name.replace(/_/g, " ")}
                  </span>
                  <span className="text-lg font-bold font-mono text-gray-900 dark:text-white block mt-1">
                    {count}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                    scrapes verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: GITHUB ACTIONS ORCHESTRATOR */}
      {/* ---------------------------------------------------- */}
      {activeTab === "github" && (
        <div className="space-y-5">
          {/* GitHub Header & Controls */}
          <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  GitHub Actions Runner ({gitHubStatus.repo})
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                  {gitHubStatus.workflowFile}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automated 1-hour cron runs <code className="font-mono text-[11px]">.scraper/runner.py</code> and settlement reconciliation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshGitHub}
                disabled={isRefreshingGitHub}
                className="gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingGitHub ? "animate-spin" : ""}`} />
                <span>Refresh Runs</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setIsDispatchModalOpen(true)}
                className="gap-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Dispatch Workflow</span>
              </Button>
            </div>
          </div>

          {/* GitHub Runs Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Recent Workflow Executions ({gitHubStatus.runs.length})
              </h4>
              <a
                href={`https://github.com/${gitHubStatus.repo}/actions/workflows/${gitHubStatus.workflowFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Run ID &amp; Trigger
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Status &amp; Conclusion
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Commit &amp; Branch
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Executed At
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {gitHubStatus.runs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                        No recent GitHub Actions workflow runs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    gitHubStatus.runs.map((r) => {
                      const isSuccess = r.conclusion === "success";
                      const isFailure = r.conclusion === "failure";
                      const isInProgress = r.status === "in_progress";

                      return (
                        <TableRow
                          key={r.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors"
                        >
                          {/* Run ID & Event */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            <div>
                              <span className="font-semibold text-xs text-gray-900 dark:text-white block">
                                {r.name} #{r.run_number}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                  {r.event}
                                </span>
                                {r.duration_seconds !== null && (
                                  <span className="text-[10px] font-mono text-gray-400">
                                    • {r.duration_seconds}s
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Status & Conclusion */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Success</span>
                              </span>
                            ) : isFailure ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                                <XCircle className="w-3 h-3 text-rose-500" />
                                <span>Failed</span>
                              </span>
                            ) : isInProgress ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                                <span>Running</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                                <Clock className="w-3 h-3 text-amber-500" />
                                <span>{r.status}</span>
                              </span>
                            )}
                          </TableCell>

                          {/* Commit & Branch */}
                          <TableCell className="px-5 py-3 text-start text-xs font-mono">
                            <div className="max-w-[200px]">
                              <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                <GitBranch className="w-3 h-3 text-gray-400" />
                                <span>{r.head_branch}</span>
                                {r.head_sha && (
                                  <span className="text-[10px] text-gray-400">
                                    ({r.head_sha.slice(0, 7)})
                                  </span>
                                )}
                              </span>
                              {r.commit_message && (
                                <span className="text-[10px] text-gray-400 truncate block mt-0.5" title={r.commit_message}>
                                  {r.commit_message}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Executed At */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            {renderStackedDate(r.created_at)}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="px-5 py-3 text-end whitespace-nowrap">
                            <a
                              href={r.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
                            >
                              <span>Logs</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: APIFY SCRAPER HUB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "apify" && (
        <div className="space-y-6">
          {/* Apify Account Summary */}
          <div className="p-6 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
                  AP
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Apify Cloud Engine Telemetry
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    High-accuracy actor execution for Instagram post extraction &amp; metrics verification.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshApify}
                disabled={isRefreshingApify}
                className="gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingApify ? "animate-spin" : ""}`} />
                <span>Sync Apify Status</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase">Username</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white block mt-0.5 font-mono">
                  {apifyStatus.username || "tuazor"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase">Account Email</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white block mt-0.5 font-mono">
                  {apifyStatus.email || "nabomtuazor@gmail.com"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase">Target Actor ID</span>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 block mt-0.5 font-mono">
                  {apifyStatus.actorId || "nH2AHrwxeTRJoN5hX"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase">Actor Title</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white block mt-0.5">
                  {apifyStatus.actorTitle || "Instagram Post Scraper"}
                </span>
              </div>
            </div>
          </div>

          {/* Apify Recent Cloud Runs Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Recent Apify Cloud Runs ({apifyStatus.recentRuns.length})
              </h4>
              <a
                href={`https://console.apify.com/actors/${apifyStatus.actorId}/runs`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>Open Apify Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Run ID
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Duration
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Started &amp; Finished At
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {apifyStatus.recentRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                        No recent cloud actor runs logged on Apify.
                      </TableCell>
                    </TableRow>
                  ) : (
                    apifyStatus.recentRuns.map((r) => (
                      <TableRow
                        key={r.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors"
                      >
                        <TableCell className="px-5 py-3 text-start whitespace-nowrap font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          #{r.id}
                        </TableCell>

                        <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                          {r.status === "SUCCEEDED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>SUCCEEDED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                              <XCircle className="w-3 h-3 text-rose-500" />
                              <span>{r.status}</span>
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-3 text-start whitespace-nowrap font-mono text-xs text-gray-700 dark:text-gray-300">
                          {r.durationSeconds !== null && r.durationSeconds !== undefined
                            ? `${r.durationSeconds}s`
                            : "—"}
                        </TableCell>

                        <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                          {renderStackedDate(r.startedAt)}
                        </TableCell>

                        <TableCell className="px-5 py-3 text-end whitespace-nowrap">
                          <a
                            href={`https://console.apify.com/view/runs/${r.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
                          >
                            <span>Console</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: TELEMETRY CHECKS LEDGER */}
      {/* ---------------------------------------------------- */}
      {activeTab === "telemetry" && (
        <div className="space-y-4">
          {/* Filtering Bar */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={telemetrySearch}
                  onChange={(e) => {
                    setTelemetrySearch(e.target.value);
                    setTelemetryPage(1);
                  }}
                  placeholder="Search submission ID, post URL, notes..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Platform select */}
                <select
                  value={telemetryPlatform}
                  onChange={(e) => {
                    setTelemetryPlatform(e.target.value);
                    setTelemetryPage(1);
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="x">X (Twitter)</option>
                  <option value="facebook">Facebook</option>
                </select>

                {/* Reachability filter */}
                <select
                  value={telemetryReachability}
                  onChange={(e) => {
                    setTelemetryReachability(e.target.value as any);
                    setTelemetryPage(1);
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Reachability</option>
                  <option value="reachable">Reachable Only</option>
                  <option value="unreachable">Unreachable Only</option>
                </select>

                {/* Engine select */}
                <select
                  value={telemetryEngine}
                  onChange={(e) => {
                    setTelemetryEngine(e.target.value);
                    setTelemetryPage(1);
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Engines</option>
                  <option value="yt-dlp">yt-dlp</option>
                  <option value="apify">Apify</option>
                  <option value="fxtweet">FixTweet</option>
                  <option value="opengraph">OpenGraph</option>
                </select>
              </div>
            </div>
          </div>

          {/* Telemetry Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Timestamp
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Submission &amp; Creator
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Target Post
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Reachability
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Views
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Engagement
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Engine &amp; Diagnostic
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Payload
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {paginatedChecks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                        No telemetry checks match your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedChecks.map((chk) => {
                      const platform = getPlatformFromUrl(chk.submission?.post_url);
                      const raw = (chk.raw_scrape || {}) as Record<string, any>;
                      const likes = raw.like_count;
                      const comments = raw.comment_count;
                      const shares = raw.share_count;
                      const extractor = raw.extractor || "OpenGraph";
                      const errorMsg = raw.error_message;

                      return (
                        <TableRow
                          key={chk.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors"
                        >
                          {/* Timestamp */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            {renderStackedDate(chk.checked_at)}
                          </TableCell>

                          {/* Submission & Creator */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            <div>
                              <Link
                                href={`/admin/submissions/${chk.submission_id}`}
                                className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline block"
                              >
                                #{chk.submission_id.slice(0, 8)}
                              </Link>
                              {chk.submission?.creator && (
                                <span className="text-[10px] text-gray-500 block">
                                  {chk.submission.creator.full_name ||
                                    chk.submission.creator.display_name}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Target Post */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            {chk.submission?.post_url ? (
                              <a
                                href={chk.submission.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-200 transition-colors"
                              >
                                {renderPlatformIcon(platform)}
                                <span className="capitalize text-[11px]">{platform}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs italic">No Link</span>
                            )}
                          </TableCell>

                          {/* Reachability */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            {chk.post_reachable ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Reachable</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                                <XCircle className="w-3 h-3 text-rose-500" />
                                <span>Unreachable</span>
                              </span>
                            )}
                          </TableCell>

                          {/* Views */}
                          <TableCell className="px-5 py-3 text-start font-mono text-xs whitespace-nowrap">
                            {chk.view_count !== null && chk.view_count !== undefined ? (
                              <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                                <Eye className="w-3.5 h-3.5 text-gray-400" />
                                <span>{Number(chk.view_count).toLocaleString()}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 font-mono text-xs">—</span>
                            )}
                          </TableCell>

                          {/* Engagement */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            {(likes !== null && likes !== undefined) ||
                            (comments !== null && comments !== undefined) ||
                            (shares !== null && shares !== undefined) ? (
                              <div className="flex items-center gap-3 text-[11px] font-mono text-gray-600 dark:text-gray-300">
                                {likes !== null && likes !== undefined && (
                                  <span className="flex items-center gap-1" title={`${Number(likes).toLocaleString()} likes`}>
                                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                                    <span>{Number(likes).toLocaleString()}</span>
                                  </span>
                                )}
                                {comments !== null && comments !== undefined && (
                                  <span className="flex items-center gap-1" title={`${Number(comments).toLocaleString()} comments`}>
                                    <MessageCircle className="w-3 h-3 text-blue-500" />
                                    <span>{Number(comments).toLocaleString()}</span>
                                  </span>
                                )}
                                {shares !== null && shares !== undefined && (
                                  <span className="flex items-center gap-1" title={`${Number(shares).toLocaleString()} shares`}>
                                    <Share2 className="w-3 h-3 text-purple-500" />
                                    <span>{Number(shares).toLocaleString()}</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 font-mono text-xs">—</span>
                            )}
                          </TableCell>

                          {/* Engine & Diagnostics */}
                          <TableCell className="px-5 py-3 text-start text-xs font-mono">
                            <div className="max-w-xs">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 uppercase tracking-wider">
                                {extractor}
                              </span>
                              {errorMsg ? (
                                <span className="block text-[10px] text-rose-500 truncate mt-0.5" title={errorMsg}>
                                  {errorMsg}
                                </span>
                              ) : chk.notes ? (
                                <span className="block text-[10px] text-gray-400 truncate mt-0.5" title={chk.notes}>
                                  {chk.notes}
                                </span>
                              ) : null}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="px-5 py-3 text-end whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                setInspectModalData({
                                  isOpen: true,
                                  title: "Verification Check Telemetry",
                                  subtitle: `Check #${chk.id.slice(0, 8)} • ${new Date(chk.checked_at).toLocaleString()}`,
                                  data: chk.raw_scrape,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-brand-500 hover:text-brand-600 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                            >
                              <Code className="w-3 h-3" />
                              <span>View JSON</span>
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {telemetryTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    Showing {(telemetryPage - 1) * telemetryPerPage + 1} to{" "}
                    {Math.min(telemetryPage * telemetryPerPage, filteredChecks.length)} of{" "}
                    {filteredChecks.length} checks
                  </span>
                  <select
                    value={telemetryPerPage}
                    onChange={(e) => {
                      setTelemetryPerPage(Number(e.target.value));
                      setTelemetryPage(1);
                    }}
                    className="text-[11px] px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-300"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>

                <Pagination
                  currentPage={telemetryPage}
                  totalPages={telemetryTotalPages}
                  onPageChange={setTelemetryPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: SETTLEMENT AUDITS LEDGER */}
      {/* ---------------------------------------------------- */}
      {activeTab === "settlements" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Daily Settlement Ledger (`submission_audits`)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Audit trail of incremental view deltas, auto-approved milestones, and verified payouts credited to creator wallets.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Settlement ID &amp; Date
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Submission &amp; Campaign
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Views Scraped &amp; Delta
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Payout Released
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {paginatedAudits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                        No settlement audit records logged yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAudits.map((a) => (
                      <TableRow
                        key={a.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors"
                      >
                        {/* Settlement ID & Date */}
                        <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white block">
                            #{a.id.slice(0, 8)} (Cycle {a.cycle_number})
                          </span>
                          <div className="mt-0.5">{renderStackedDate(a.settled_at)}</div>
                        </TableCell>

                        {/* Submission & Campaign */}
                        <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                          <Link
                            href={`/admin/submissions/${a.submission_id}`}
                            className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline block"
                          >
                            Sub #{a.submission_id.slice(0, 8)}
                          </Link>
                          {a.submission?.campaign && (
                            <span className="text-[10px] text-gray-500 block truncate max-w-[180px]">
                              {a.submission.campaign.title}
                            </span>
                          )}
                        </TableCell>

                        {/* Views Scraped & Delta */}
                        <TableCell className="px-5 py-3 text-start font-mono text-xs whitespace-nowrap">
                          <span className="font-bold text-gray-900 dark:text-white block">
                            {Number(a.views_scraped).toLocaleString()} total
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                            +{Number(a.views_delta).toLocaleString()} delta
                          </span>
                        </TableCell>

                        {/* Payout Released */}
                        <TableCell className="px-5 py-3 text-start font-mono text-xs whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                          ₦{Number(a.payout_amount).toLocaleString()}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-5 py-3 text-end whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 uppercase">
                            {a.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 6: SCRAPE PLAYGROUND (INTERACTIVE TEST BENCH) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "playground" && (
        <div className="space-y-6">
          {/* Playground Form */}
          <div className="p-6 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Interactive Scrape Test Bench</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Test any live Instagram, TikTok, YouTube, X, or Facebook URL across the multi-tier extractor router with real-time latency measurement.
              </p>
            </div>

            <form onSubmit={handleRunPlayground} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="url"
                  value={playgroundUrl}
                  onChange={(e) => setPlaygroundUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/xyz/ or https://tiktok.com/@user/video/..."
                  required
                  className="flex-1 w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />

                <select
                  value={playgroundEngine}
                  onChange={(e) => setPlaygroundEngine(e.target.value as any)}
                  className="w-full sm:w-48 px-3 py-2.5 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-hidden focus:border-brand-500"
                >
                  <option value="auto">Smart Router (Auto)</option>
                  <option value="apify">Apify Actor (Instagram)</option>
                  <option value="fallback">Fallback Crawlers</option>
                </select>

                <Button
                  type="submit"
                  disabled={isPlaying}
                  className="w-full sm:w-auto gap-1.5 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold"
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Test Scrape</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Playground Result Display */}
          {playgroundResult && (
            <div className="p-6 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Extraction Output
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      playgroundResult.success
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    }`}
                  >
                    {playgroundResult.success ? "Reachable" : "Unreachable"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                  <span>Latency: {playgroundResult.durationMs}ms</span>
                  <span>•</span>
                  <span>Engine: {playgroundResult.engineUsed}</span>
                </div>
              </div>

              {playgroundResult.error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
                  {playgroundResult.error}
                </div>
              )}

              {playgroundResult.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5">
                      <span className="text-gray-400 block text-[10px]">Author</span>
                      <span className="font-bold text-gray-900 dark:text-white mt-1 block truncate">
                        @{playgroundResult.data.authorHandle || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5">
                      <span className="text-gray-400 block text-[10px]">Platform</span>
                      <span className="font-bold text-gray-900 dark:text-white mt-1 block capitalize">
                        {playgroundResult.data.platform || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5">
                      <span className="text-gray-400 block text-[10px]">Follower Count</span>
                      <span className="font-bold text-gray-900 dark:text-white mt-1 block">
                        {playgroundResult.data.followerCount
                          ? Number(playgroundResult.data.followerCount).toLocaleString()
                          : "—"}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5">
                      <span className="text-gray-400 block text-[10px]">Title / Caption</span>
                      <span className="font-bold text-gray-900 dark:text-white mt-1 block truncate">
                        {playgroundResult.data.title || playgroundResult.data.postText || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setInspectModalData({
                          isOpen: true,
                          title: "Playground Raw Extraction Data",
                          subtitle: playgroundResult.url,
                          data: playgroundResult.data,
                        })
                      }
                      className="gap-1.5 text-xs"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Inspect Raw Telemetry</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODALS */}
      {/* ---------------------------------------------------- */}
      <DispatchWorkflowModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onSuccess={(msg) => {
          setDispatchSuccessMsg(msg);
          handleRefreshGitHub();
        }}
        repo={gitHubStatus.repo}
      />

      <RawTelemetryModal
        isOpen={inspectModalData.isOpen}
        onClose={() =>
          setInspectModalData((prev) => ({ ...prev, isOpen: false }))
        }
        title={inspectModalData.title}
        subtitle={inspectModalData.subtitle}
        data={inspectModalData.data}
      />
    </div>
  );
}
