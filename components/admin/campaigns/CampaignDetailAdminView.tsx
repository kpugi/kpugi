"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Megaphone,
  Pin,
  Sparkles,
  ExternalLink,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Eye,
  Edit3,
  Layers,
  AlertTriangle,
  Loader2,
  FileText,
  Sliders,
  Shield,
  X,
  Check,
  Play,
  RotateCw,
  Terminal,
  Activity,
  Copy,
  Github,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  RotateCcw,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/components/ui/table";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import Label from "@/components/admin/components/form/Label";
import InputField from "@/components/admin/components/form/input/InputField";
import Pagination from "@/components/admin/components/tables/Pagination";
import {
  toggleCampaignHeroPinned,
  toggleCampaignFeatured,
  updateCampaignStatus,
  updateCampaignCpm,
  updateCampaignBudget,
  overrideSubmissionStatus,
  triggerManualScraperRunAction,
} from "@/app/actions/admin";

export interface VerificationCheckItem {
  id: string;
  submission_id: string;
  checked_at: string;
  post_reachable: boolean;
  view_count: number | null;
  raw_scrape?: any;
  notes?: string;
  post_url?: string;
  creator_name?: string;
  platform?: string;
  handle?: string;
}

export interface GitHubRunItem {
  id: number;
  name: string;
  status: string;
  conclusion?: string | null;
  event: string;
  created_at: string;
  updated_at: string;
  run_duration_ms: number;
  html_url: string;
}

export interface CampaignDetailProps {
  campaign: {
    id: string;
    campaign_code?: string | null;
    title: string;
    description: string;
    ad_format?: string | null;
    requirements?: any;
    cpm_rate: number;
    total_budget: number;
    reserved_budget: number;
    spent_budget: number;
    min_view_threshold?: number;
    required_live_duration_hours?: number;
    verification_grace_hours?: number;
    status: string;
    is_featured: boolean;
    is_hero_pinned: boolean;
    created_at: string;
    funded_at?: string | null;
    advertiser_id: string;
  };
  advertiser: {
    company_name: string;
    company_website?: string | null;
    billing_email?: string | null;
    profile?: {
      id: string;
      full_name?: string | null;
      email?: string | null;
      avatar_url?: string | null;
    } | null;
  } | null;
  creatives: Array<{
    id: string;
    file_url?: string | null;
    copy_text?: string | null;
    caption_suggestion?: string | null;
    created_at?: string;
  }>;
  submissions: Array<{
    id: string;
    post_url?: string | null;
    screenshot_url?: string | null;
    submitted_at?: string;
    reserved_amount?: number;
    payout_amount?: number | null;
    status: string;
    final_view_count?: number | null;
    verified_at?: string | null;
    failure_reason?: string | null;
    creator?: {
      profile_id: string;
      display_name?: string | null;
      profiles?: {
        full_name?: string | null;
        email?: string | null;
        avatar_url?: string | null;
      } | null;
    } | null;
    social_account?: {
      platform?: string;
      handle?: string;
    } | null;
  }>;
  auditTrail: Array<{
    id: string;
    action: string;
    source: "admin" | "brand";
    created_at: string;
    details?: string | null;
    payload?: any;
  }>;
  verificationChecks?: VerificationCheckItem[];
  githubRuns?: GitHubRunItem[];
  heroPinnedCount: number;
}

export default function CampaignDetailAdminView({
  campaign,
  advertiser,
  creatives = [],
  submissions = [],
  auditTrail = [],
  verificationChecks = [],
  githubRuns = [],
  heroPinnedCount,
}: CampaignDetailProps) {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "submissions" | "runs" | "audits">("overview");

  // Transitions
  const [isPendingHero, startTransitionHero] = useTransition();
  const [isPendingFeatured, startTransitionFeatured] = useTransition();
  const [isPendingStatus, startTransitionStatus] = useTransition();
  const [isPendingCpm, startTransitionCpm] = useTransition();
  const [isPendingBudget, startTransitionBudget] = useTransition();
  const [isPendingSubOverride, startTransitionSubOverride] = useTransition();
  const [isPendingScraperTrigger, startTransitionScraperTrigger] = useTransition();

  // UI Local States & Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatusValue, setNewStatusValue] = useState<"live" | "paused" | "completed" | "archived">(
    (campaign.status as any) || "live"
  );
  const [statusReason, setStatusReason] = useState("");

  // CPM Modal State
  const [isCpmModalOpen, setIsCpmModalOpen] = useState(false);
  const [newCpmValue, setNewCpmValue] = useState<string>(String(campaign.cpm_rate || 2000));
  const [cpmReason, setCpmReason] = useState("");

  // Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newBudgetValue, setNewBudgetValue] = useState<string>(String(campaign.total_budget || 0));
  const [budgetReason, setBudgetReason] = useState("");

  // Submission Override Modal State
  const [overrideSubData, setOverrideSubData] = useState<{
    id: string;
    creatorName: string;
    targetStatus: "verified_pass" | "verified_fail";
  } | null>(null);
  const [subOverrideReason, setSubOverrideReason] = useState("");

  // Raw Scrape Modal State
  const [inspectScrapeCheck, setInspectScrapeCheck] = useState<VerificationCheckItem | null>(null);
  const [hasCopiedScrape, setHasCopiedScrape] = useState(false);

  // ----------------------------------------------------
  // SUBMISSIONS TABLE STATE (Sorting, Filtering, Pagination)
  // ----------------------------------------------------
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState<string>("all");
  const [subPlatformFilter, setSubPlatformFilter] = useState<string>("all");
  const [subSortField, setSubSortField] = useState<"creator" | "platform" | "views" | "payout" | "date" | "status">("date");
  const [subSortDirection, setSubSortDirection] = useState<"asc" | "desc">("desc");
  const [subCurrentPage, setSubCurrentPage] = useState(1);
  const subPageSize = 10;

  useEffect(() => {
    setSubCurrentPage(1);
  }, [subSearchQuery, subStatusFilter, subPlatformFilter, subSortField, subSortDirection]);

  const handleSubSort = (field: "creator" | "platform" | "views" | "payout" | "date" | "status") => {
    if (subSortField === field) {
      setSubSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSubSortField(field);
      setSubSortDirection("asc");
    }
  };

  const filteredAndSortedSubmissions = useMemo(() => {
    const list = submissions.filter((s) => {
      // Status filter
      if (subStatusFilter !== "all") {
        const st = s.status.toLowerCase();
        if (subStatusFilter === "verified_pass" && st !== "verified_pass" && st !== "approved" && st !== "paid") return false;
        if (subStatusFilter === "pending" && st !== "pending") return false;
        if (subStatusFilter === "verified_fail" && st !== "verified_fail" && st !== "rejected") return false;
      }

      // Platform filter
      if (subPlatformFilter !== "all") {
        const p = (s.social_account?.platform || "").toLowerCase();
        if (!p.includes(subPlatformFilter.toLowerCase())) return false;
      }

      // Search query
      if (!subSearchQuery.trim()) return true;
      const q = subSearchQuery.toLowerCase();
      const creatorName = (s.creator?.display_name || s.creator?.profiles?.full_name || "").toLowerCase();
      const handle = (s.social_account?.handle || "").toLowerCase();
      const postUrl = (s.post_url || "").toLowerCase();
      const id = s.id.toLowerCase();
      return creatorName.includes(q) || handle.includes(q) || postUrl.includes(q) || id.includes(q);
    });

    list.sort((a, b) => {
      let comparison = 0;
      switch (subSortField) {
        case "creator":
          const nameA = a.creator?.display_name || a.creator?.profiles?.full_name || "";
          const nameB = b.creator?.display_name || b.creator?.profiles?.full_name || "";
          comparison = nameA.localeCompare(nameB);
          break;
        case "platform":
          comparison = (a.social_account?.platform || "").localeCompare(b.social_account?.platform || "");
          break;
        case "views":
          comparison = Number(a.final_view_count || 0) - Number(b.final_view_count || 0);
          break;
        case "payout":
          comparison = Number(a.reserved_amount || 0) - Number(b.reserved_amount || 0);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "date":
        default:
          comparison = new Date(a.submitted_at || 0).getTime() - new Date(b.submitted_at || 0).getTime();
      }
      return subSortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [submissions, subStatusFilter, subPlatformFilter, subSearchQuery, subSortField, subSortDirection]);

  const subTotalPages = Math.max(1, Math.ceil(filteredAndSortedSubmissions.length / subPageSize));
  const paginatedSubmissions = useMemo(() => {
    const start = (subCurrentPage - 1) * subPageSize;
    return filteredAndSortedSubmissions.slice(start, start + subPageSize);
  }, [filteredAndSortedSubmissions, subCurrentPage, subPageSize]);

  // ----------------------------------------------------
  // VERIFICATION CHECKS TABLE STATE
  // ----------------------------------------------------
  const [runSearchQuery, setRunSearchQuery] = useState("");
  const [runReachableFilter, setRunReachableFilter] = useState<string>("all");
  const [runSortField, setRunSortField] = useState<"time" | "views" | "reachable" | "creator">("time");
  const [runSortDirection, setRunSortDirection] = useState<"asc" | "desc">("desc");
  const [runCurrentPage, setRunCurrentPage] = useState(1);
  const runPageSize = 10;

  useEffect(() => {
    setRunCurrentPage(1);
  }, [runSearchQuery, runReachableFilter, runSortField, runSortDirection]);

  const handleRunSort = (field: "time" | "views" | "reachable" | "creator") => {
    if (runSortField === field) {
      setRunSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setRunSortField(field);
      setRunSortDirection("asc");
    }
  };

  const filteredAndSortedRuns = useMemo(() => {
    const list = verificationChecks.filter((chk) => {
      if (runReachableFilter === "reachable" && !chk.post_reachable) return false;
      if (runReachableFilter === "unreachable" && chk.post_reachable) return false;

      if (!runSearchQuery.trim()) return true;
      const q = runSearchQuery.toLowerCase();
      const creator = (chk.creator_name || "").toLowerCase();
      const handle = (chk.handle || "").toLowerCase();
      const notes = (chk.notes || "").toLowerCase();
      const postUrl = (chk.post_url || "").toLowerCase();
      return creator.includes(q) || handle.includes(q) || notes.includes(q) || postUrl.includes(q);
    });

    list.sort((a, b) => {
      let comparison = 0;
      switch (runSortField) {
        case "creator":
          comparison = (a.creator_name || "").localeCompare(b.creator_name || "");
          break;
        case "views":
          comparison = Number(a.view_count || 0) - Number(b.view_count || 0);
          break;
        case "reachable":
          comparison = (a.post_reachable ? 1 : 0) - (b.post_reachable ? 1 : 0);
          break;
        case "time":
        default:
          comparison = new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime();
      }
      return runSortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [verificationChecks, runReachableFilter, runSearchQuery, runSortField, runSortDirection]);

  const runTotalPages = Math.max(1, Math.ceil(filteredAndSortedRuns.length / runPageSize));
  const paginatedRuns = useMemo(() => {
    const start = (runCurrentPage - 1) * runPageSize;
    return filteredAndSortedRuns.slice(start, start + runPageSize);
  }, [filteredAndSortedRuns, runCurrentPage, runPageSize]);

  // ----------------------------------------------------
  // GITHUB ACTION RUNS STATE
  // ----------------------------------------------------
  const [ghStatusFilter, setGhStatusFilter] = useState<string>("all");
  const [ghSortField, setGhSortField] = useState<"id" | "status" | "duration" | "time">("time");
  const [ghSortDirection, setGhSortDirection] = useState<"asc" | "desc">("desc");
  const [ghCurrentPage, setGhCurrentPage] = useState(1);
  const ghPageSize = 6;

  const handleGhSort = (field: "id" | "status" | "duration" | "time") => {
    if (ghSortField === field) {
      setGhSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setGhSortField(field);
      setGhSortDirection("asc");
    }
  };

  const filteredGhRuns = useMemo(() => {
    const list = githubRuns.filter((run) => {
      if (ghStatusFilter === "success") return run.conclusion === "success";
      if (ghStatusFilter === "failure") return run.conclusion === "failure";
      return true;
    });

    list.sort((a, b) => {
      let comp = 0;
      switch (ghSortField) {
        case "id":
          comp = Number(a.id || 0) - Number(b.id || 0);
          break;
        case "status":
          comp = (a.conclusion || a.status || "").localeCompare(b.conclusion || b.status || "");
          break;
        case "duration":
          comp = Number(a.run_duration_ms || 0) - Number(b.run_duration_ms || 0);
          break;
        case "time":
        default:
          comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return ghSortDirection === "asc" ? comp : -comp;
    });

    return list;
  }, [githubRuns, ghStatusFilter, ghSortField, ghSortDirection]);

  const ghTotalPages = Math.max(1, Math.ceil(filteredGhRuns.length / ghPageSize));
  const paginatedGhRuns = useMemo(() => {
    const start = (ghCurrentPage - 1) * ghPageSize;
    return filteredGhRuns.slice(start, start + ghPageSize);
  }, [filteredGhRuns, ghCurrentPage, ghPageSize]);

  // ----------------------------------------------------
  // AUDIT LEDGER STATE
  // ----------------------------------------------------
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditSourceFilter, setAuditSourceFilter] = useState<string>("all");
  const [auditSortField, setAuditSortField] = useState<"time" | "action" | "source">("time");
  const [auditSortDirection, setAuditSortDirection] = useState<"asc" | "desc">("desc");
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const auditPageSize = 10;

  const handleAuditSort = (field: "time" | "action" | "source") => {
    if (auditSortField === field) {
      setAuditSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setAuditSortField(field);
      setAuditSortDirection("asc");
    }
  };

  const filteredAuditTrail = useMemo(() => {
    const list = auditTrail.filter((log) => {
      if (auditSourceFilter !== "all" && log.source !== auditSourceFilter) return false;
      if (!auditSearchQuery.trim()) return true;
      const q = auditSearchQuery.toLowerCase();
      const action = (log.action || "").toLowerCase();
      const details = (log.details || "").toLowerCase();
      return action.includes(q) || details.includes(q);
    });

    list.sort((a, b) => {
      let comp = 0;
      switch (auditSortField) {
        case "action":
          comp = (a.action || "").localeCompare(b.action || "");
          break;
        case "source":
          comp = (a.source || "").localeCompare(b.source || "");
          break;
        case "time":
        default:
          comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return auditSortDirection === "asc" ? comp : -comp;
    });

    return list;
  }, [auditTrail, auditSourceFilter, auditSearchQuery, auditSortField, auditSortDirection]);

  const auditTotalPages = Math.max(1, Math.ceil(filteredAuditTrail.length / auditPageSize));
  const paginatedAuditTrail = useMemo(() => {
    const start = (auditCurrentPage - 1) * auditPageSize;
    return filteredAuditTrail.slice(start, start + auditPageSize);
  }, [filteredAuditTrail, auditCurrentPage, auditPageSize]);

  // Formatter
  const formatNaira = (val?: number | null) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Status Indicator
  const renderStatusIndicator = (status?: string) => {
    const s = (status || "draft").toLowerCase().replace(/_/g, " ").trim();

    if (s === "live" || s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Campaign
        </span>
      );
    }

    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          Completed
        </span>
      );
    }

    if (s === "archived") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60">
          <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></span>
          Archived
        </span>
      );
    }

    if (s === "paused") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          Paused
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20">
        <span className="h-2 w-2 rounded-full bg-purple-500"></span>
        {status || "Draft"}
      </span>
    );
  };

  // Submission Status Badge
  const renderSubmissionStatus = (status: string) => {
    const s = status.toLowerCase();
    if (s === "verified_pass" || s === "approved" || s === "paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          Pass
        </span>
      );
    }
    if (s === "verified_fail" || s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
          <XCircle className="w-3 h-3" />
          Fail
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {status}
      </span>
    );
  };

  // Action Handlers
  const handleToggleHero = () => {
    startTransitionHero(async () => {
      try {
        await toggleCampaignHeroPinned(campaign.id, campaign.is_hero_pinned);
        showFeedback("success", `Hero Pin ${campaign.is_hero_pinned ? "removed" : "activated"}.`);
        router.refresh();
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to toggle hero pin");
      }
    });
  };

  const handleToggleFeatured = () => {
    startTransitionFeatured(async () => {
      try {
        await toggleCampaignFeatured(campaign.id, campaign.is_featured);
        showFeedback("success", `Featured status ${campaign.is_featured ? "removed" : "applied"}.`);
        router.refresh();
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to toggle featured status");
      }
    });
  };

  const handleExecuteStatusUpdate = () => {
    startTransitionStatus(async () => {
      try {
        await updateCampaignStatus(campaign.id, newStatusValue, statusReason);
        setIsStatusModalOpen(false);
        setStatusReason("");
        showFeedback("success", `Campaign status successfully updated to '${newStatusValue}'.`);
        router.refresh();
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to update campaign status");
      }
    });
  };

  const handleExecuteCpmUpdate = () => {
    const cpmNum = Number(newCpmValue);
    if (!cpmNum || cpmNum <= 0) {
      showFeedback("error", "Please enter a valid positive CPM rate.");
      return;
    }
    startTransitionCpm(async () => {
      try {
        await updateCampaignCpm(campaign.id, cpmNum, cpmReason);
        setIsCpmModalOpen(false);
        setCpmReason("");
        showFeedback("success", `CPM rate updated to ₦${cpmNum.toLocaleString()}.`);
        router.refresh();
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to update CPM rate");
      }
    });
  };

  const handleExecuteBudgetUpdate = () => {
    const budgetNum = Number(newBudgetValue);
    if (budgetNum === undefined || budgetNum < campaign.spent_budget) {
      showFeedback("error", `Budget cannot be lower than accrued spent (${formatNaira(campaign.spent_budget)}).`);
      return;
    }
    startTransitionBudget(async () => {
      try {
        await updateCampaignBudget(campaign.id, budgetNum, budgetReason);
        setIsBudgetModalOpen(false);
        setBudgetReason("");
        showFeedback("success", `Total budget updated to ₦${budgetNum.toLocaleString()}.`);
        router.refresh();
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to update total budget");
      }
    });
  };

  const handleExecuteSubOverride = () => {
    if (!overrideSubData) return;
    startTransitionSubOverride(async () => {
      try {
        await overrideSubmissionStatus(
          overrideSubData.id,
          overrideSubData.targetStatus,
          subOverrideReason.trim() || `Admin manual verification override to ${overrideSubData.targetStatus}`
        );
        setOverrideSubData(null);
        setSubOverrideReason("");
        showFeedback("success", "Submission status updated and audit trail recorded.");
        router.refresh();
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to override submission status");
      }
    });
  };

  const handleTriggerScraper = () => {
    startTransitionScraperTrigger(async () => {
      try {
        const res = await triggerManualScraperRunAction(campaign.id);
        showFeedback("success", `Scraper run triggered (${res.channel}): ${res.message}`);
        router.refresh();
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to trigger scraper run");
      }
    });
  };

  const handleCopyRawScrape = () => {
    if (!inspectScrapeCheck?.raw_scrape) return;
    navigator.clipboard.writeText(JSON.stringify(inspectScrapeCheck.raw_scrape, null, 2));
    setHasCopiedScrape(true);
    setTimeout(() => setHasCopiedScrape(false), 2000);
  };

  // Metrics
  const spentPercent = campaign.total_budget > 0
    ? Math.min(100, Math.round((Number(campaign.spent_budget || 0) / Number(campaign.total_budget)) * 100))
    : 0;

  const totalVerifiedViews = submissions.reduce((sum, s) => sum + Number(s.final_view_count || 0), 0);
  const passCount = submissions.filter((s) => s.status === "verified_pass" || s.status === "approved" || s.status === "paid").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const failCount = submissions.filter((s) => s.status === "verified_fail" || s.status === "rejected").length;

  const displayCode = campaign.campaign_code || `#${campaign.id.slice(0, 8).toUpperCase()}`;
  const primaryCreative = creatives[0];
  const latestGhRun = githubRuns[0];

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campaigns</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200/80 dark:border-gray-700/80">
                {displayCode}
              </span>
              {renderStatusIndicator(campaign.status)}
              {campaign.is_hero_pinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60">
                  <Pin className="w-3 h-3 fill-indigo-500" /> Hero Pinned
                </span>
              )}
              {campaign.is_featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60">
                  <Sparkles className="w-3 h-3 fill-amber-500" /> Featured
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-gray-900 dark:text-white">
              {campaign.title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Registered on{" "}
              {new Date(campaign.created_at).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              • Created by{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {advertiser?.company_name || advertiser?.profile?.full_name || "Platform Brand"}
              </span>
            </p>
          </div>

          {/* Quick Admin Action Toolbar using TailAdmin Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Override Trigger */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNewStatusValue((campaign.status as any) || "live");
                setIsStatusModalOpen(true);
              }}
              startIcon={<Sliders className="w-3.5 h-3.5 text-brand-500" />}
            >
              Override Status
            </Button>

            {/* CPM Edit Trigger */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNewCpmValue(String(campaign.cpm_rate || 2000));
                setIsCpmModalOpen(true);
              }}
              startIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-500" />}
            >
              Edit CPM
            </Button>

            {/* Hero Pin Toggle */}
            <button
              onClick={handleToggleHero}
              disabled={isPendingHero}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                campaign.is_hero_pinned
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300"
              }`}
            >
              {isPendingHero ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              ) : (
                <Pin className={`w-3.5 h-3.5 ${campaign.is_hero_pinned ? "fill-indigo-500 text-indigo-500" : ""}`} />
              )}
              <span>Hero ({heroPinnedCount}/5)</span>
            </button>

            {/* Featured Toggle */}
            <button
              onClick={handleToggleFeatured}
              disabled={isPendingFeatured}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                campaign.is_featured
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-amber-300"
              }`}
            >
              {isPendingFeatured ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              ) : (
                <Sparkles className={`w-3.5 h-3.5 ${campaign.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
              )}
              <span>Featured</span>
            </button>

            {/* Public Page View */}
            <Link
              href={`/browse`}
              target="_blank"
              className="p-2.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 transition-colors"
              title="Open Public Browse Grid"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Budget */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs mb-1 font-medium">
            <span>Budget Utilized</span>
            <button
              onClick={() => {
                setNewBudgetValue(String(campaign.total_budget || 0));
                setIsBudgetModalOpen(true);
              }}
              className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
            >
              Adjust
            </button>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-gray-900 dark:text-white">
            {formatNaira(campaign.spent_budget)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>{spentPercent}% spent</span>
              <span>Total: {formatNaira(campaign.total_budget)}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${spentPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* CPM Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs mb-1 font-medium">
            <span>CPM Rate</span>
            <button
              onClick={() => {
                setNewCpmValue(String(campaign.cpm_rate || 2000));
                setIsCpmModalOpen(true);
              }}
              className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {formatNaira(campaign.cpm_rate)}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Per 1,000 verified impressions
          </div>
        </div>

        {/* Submissions Stats */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs mb-1 font-medium">
            <span>Submissions</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-gray-900 dark:text-white">
            {submissions.length}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-500 font-semibold">{passCount} pass</span>
            <span>•</span>
            <span className="text-amber-500 font-semibold">{pendingCount} pending</span>
            <span>•</span>
            <span className="text-rose-500 font-semibold">{failCount} fail</span>
          </div>
        </div>

        {/* Audited Reach */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs mb-1 font-medium">
            <span>Audited Views</span>
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {totalVerifiedViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Min threshold: {(campaign.min_view_threshold || 1000).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "overview"
              ? "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Campaign Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "submissions"
              ? "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Creator Submissions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-gray-200/60 dark:bg-gray-800">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("runs")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "runs"
              ? "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Scraper Runs</span>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-gray-200/60 dark:bg-gray-800">
            {verificationChecks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("audits")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "audits"
              ? "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Audit Ledger</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-gray-200/60 dark:bg-gray-800">
            {auditTrail.length}
          </span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & CREATIVE BRIEF */}
      {/* ---------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Creative Card */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 sm:p-6 shadow-2xs">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                <span>Creative Media & Guidelines</span>
              </h2>

              {primaryCreative?.file_url && (
                <div className="relative rounded-xl overflow-hidden bg-black/90 max-h-80 mb-4 border border-gray-200 dark:border-gray-800">
                  <img
                    src={primaryCreative.file_url}
                    alt={campaign.title}
                    className="w-full h-full object-contain max-h-80 mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/chowdeck_creative.png";
                    }}
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
                    Campaign Description / Pitch
                  </span>
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {campaign.description || "No description provided."}
                  </div>
                </div>

                {primaryCreative?.copy_text && (
                  <div>
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
                      Required Copy / Script
                    </span>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {primaryCreative.copy_text}
                    </div>
                  </div>
                )}

                {primaryCreative?.caption_suggestion && (
                  <div>
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
                      Suggested Caption & Hashtags
                    </span>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 text-xs font-mono text-brand-600 dark:text-brand-400">
                      {primaryCreative.caption_suggestion}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Rules Card */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 sm:p-6 shadow-2xs">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Verification Rules & Requirements</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60">
                  <div className="text-[10px] uppercase font-mono text-gray-400">
                    Min View Threshold
                  </div>
                  <div className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                    {(campaign.min_view_threshold || 1000).toLocaleString()} views
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60">
                  <div className="text-[10px] uppercase font-mono text-gray-400">
                    Required Live Duration
                  </div>
                  <div className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                    {campaign.required_live_duration_hours || 72} hours
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60">
                  <div className="text-[10px] uppercase font-mono text-gray-400">
                    Grace Period
                  </div>
                  <div className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                    {campaign.verification_grace_hours || 24} hours
                  </div>
                </div>
              </div>

              {campaign.requirements && (
                <div className="mt-4">
                  <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
                    Requirements Spec (JSON)
                  </span>
                  <pre className="p-3 rounded-xl bg-gray-900 text-gray-200 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(campaign.requirements, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Advertiser Profile Card */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 sm:p-6 shadow-2xs">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-500" />
                <span>Advertiser / Brand Partner</span>
              </h2>

              <div className="space-y-3.5">
                <div>
                  <div className="text-xs text-gray-400">Company Name</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">
                    {advertiser?.company_name || "Platform Direct"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Billing Email</div>
                  <div className="font-mono text-xs text-gray-800 dark:text-gray-200">
                    {advertiser?.billing_email || advertiser?.profile?.email || "None"}
                  </div>
                </div>

                {advertiser?.company_website && (
                  <div>
                    <div className="text-xs text-gray-400">Website</div>
                    <a
                      href={advertiser.company_website.startsWith("http") ? advertiser.company_website : `https://${advertiser.company_website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-500 hover:underline inline-flex items-center gap-1"
                    >
                      {advertiser.company_website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] uppercase font-mono text-gray-400 mb-0.5">
                    Advertiser Profile ID
                  </div>
                  <div className="text-[11px] font-mono text-gray-600 dark:text-gray-400 select-all">
                    {campaign.advertiser_id}
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Financial Balance Card */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 p-5 sm:p-6 shadow-2xs">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-500" />
                <span>Budget & Escrow Allocation</span>
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Total Escrow Budget</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {formatNaira(campaign.total_budget)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Accrued Spent</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                    {formatNaira(campaign.spent_budget)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Reserved For Creators</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {formatNaira(campaign.reserved_budget)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Remaining Balance</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNaira(Math.max(0, Number(campaign.total_budget || 0) - Number(campaign.spent_budget || 0) - Number(campaign.reserved_budget || 0)))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: CREATOR SUBMISSIONS LEDGER (TailAdmin Basic Table 1 & 2) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "submissions" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
          {/* Header & Controls */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
              <div>
                <h2 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 flex items-center gap-2">
                  <span>Creator Submissions Ledger</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {submissions.length} Total
                  </span>
                </h2>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400 mt-1">
                  Track and audit submissions across social platforms, verify view milestones, and issue manual status overrides.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
                {[
                  { id: "all", label: "All Submissions", count: submissions.length },
                  { id: "verified_pass", label: "Pass", count: passCount },
                  { id: "pending", label: "Pending", count: pendingCount },
                  { id: "verified_fail", label: "Fail", count: failCount },
                ].map((st) => {
                  const isActive = subStatusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSubStatusFilter(st.id)}
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

            {/* Sub-toolbar: Platform Filter + Search + Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/80 dark:border-gray-800/60">
              <div className="flex flex-wrap items-center gap-2">
                {/* Platform select */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span>Platform:</span>
                  <select
                    value={subPlatformFilter}
                    onChange={(e) => setSubPlatformFilter(e.target.value)}
                    className="h-9 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                  >
                    <option value="all">All Platforms</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="x">X (Twitter)</option>
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                {(subSearchQuery || subStatusFilter !== "all" || subPlatformFilter !== "all" || subSortField !== "date" || subSortDirection !== "desc") && (
                  <button
                    onClick={() => {
                      setSubSearchQuery("");
                      setSubStatusFilter("all");
                      setSubPlatformFilter("all");
                      setSubSortField("date");
                      setSubSortDirection("desc");
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={subSearchQuery}
                  onChange={(e) => setSubSearchQuery(e.target.value)}
                  placeholder="Search creator, handle, post link..."
                  className="h-9 w-full rounded-lg border appearance-none ps-8 pe-8 py-1.5 text-xs shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
                {subSearchQuery && (
                  <button
                    onClick={() => setSubSearchQuery("")}
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
              <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <TableRow>
                  {/* Creator (Sortable) */}
                  <TableCell
                    isHeader
                    onClick={() => handleSubSort("creator")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Creator</span>
                      {subSortField === "creator" ? (
                        subSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </TableCell>

                  {/* Platform / Handle (Sortable) */}
                  <TableCell
                    isHeader
                    onClick={() => handleSubSort("platform")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Platform / Handle</span>
                      {subSortField === "platform" ? (
                        subSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </TableCell>

                  {/* Post URL */}
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Post URL
                  </TableCell>

                  {/* Verified Views (Sortable) */}
                  <TableCell
                    isHeader
                    onClick={() => handleSubSort("views")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Verified Views</span>
                      {subSortField === "views" ? (
                        subSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </TableCell>

                  {/* Reserved Payout (Sortable) */}
                  <TableCell
                    isHeader
                    onClick={() => handleSubSort("payout")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Reserved Payout</span>
                      {subSortField === "payout" ? (
                        subSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </TableCell>

                  {/* Status (Sortable) */}
                  <TableCell
                    isHeader
                    onClick={() => handleSubSort("status")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      {subSortField === "status" ? (
                        subSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </TableCell>

                  {/* Submitted Date (Sortable) */}
                  <TableCell
                    isHeader
                    onClick={() => handleSubSort("date")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Submitted</span>
                      {subSortField === "date" ? (
                        subSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </TableCell>

                  {/* Admin Action */}
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Admin Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {paginatedSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                      {subSearchQuery || subStatusFilter !== "all" || subPlatformFilter !== "all"
                        ? "No creator submissions match your selected filter criteria."
                        : "No creator submissions have been recorded for this campaign yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSubmissions.map((sub) => {
                    const creatorName = sub.creator?.display_name || sub.creator?.profiles?.full_name || "Creator";
                    const platform = sub.social_account?.platform || "social";
                    const handle = sub.social_account?.handle ? `@${sub.social_account.handle}` : "No handle";

                    return (
                      <TableRow key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                        <TableCell className="px-5 py-4 whitespace-nowrap text-theme-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs">
                              {creatorName[0]}
                            </div>
                            <div>
                              <span className="font-semibold text-xs text-gray-900 dark:text-white block">
                                {creatorName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                #{sub.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap text-theme-sm">
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300 capitalize">
                            {platform} • <span className="text-gray-400">{handle}</span>
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap text-theme-sm">
                          {sub.post_url ? (
                            <a
                              href={sub.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-500 hover:underline inline-flex items-center gap-1 text-xs max-w-[180px] truncate"
                            >
                              <span>{sub.post_url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">No link submitted</span>
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          {(sub.final_view_count || 0).toLocaleString()}
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          {formatNaira(sub.reserved_amount)}
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          {renderSubmissionStatus(sub.status)}
                          {sub.failure_reason && (
                            <span className="block text-[10px] text-rose-500 truncate max-w-[120px] mt-0.5" title={sub.failure_reason}>
                              {sub.failure_reason}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-[11px] text-gray-500 dark:text-gray-400">
                          {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "—"}
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                setOverrideSubData({
                                  id: sub.id,
                                  creatorName,
                                  targetStatus: "verified_pass",
                                })
                              }
                              className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Force Verify Pass"
                            >
                              Pass
                            </button>
                            <button
                              onClick={() =>
                                setOverrideSubData({
                                  id: sub.id,
                                  creatorName,
                                  targetStatus: "verified_fail",
                                })
                              }
                              className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Force Verify Fail"
                            >
                              Fail
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Submissions Pagination Footer */}
          {filteredAndSortedSubmissions.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div>
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white font-mono">
                  {(subCurrentPage - 1) * subPageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900 dark:text-white font-mono">
                  {Math.min(filteredAndSortedSubmissions.length, subCurrentPage * subPageSize)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white font-mono">
                  {filteredAndSortedSubmissions.length}
                </span>{" "}
                submissions
              </div>

              <Pagination
                currentPage={subCurrentPage}
                totalPages={subTotalPages}
                onPageChange={setSubCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: SCRAPER RUNS & AUDITS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "runs" && (
        <div className="space-y-6">
          {/* Pipeline Engine Health Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-[#0B1120] border border-gray-800 text-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Scraper & Verification Engine
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active (1-Hour Cron)
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Automated Social Metric Scraper & View Auditor
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  Executes parallel headless extraction across TikTok, X, Instagram, YouTube, and LinkedIn to audit post view thresholds, detect deleted posts, and trigger escrow payouts.
                </p>
              </div>

              {/* Trigger Button */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleTriggerScraper}
                  disabled={isPendingScraperTrigger}
                  startIcon={
                    isPendingScraperTrigger ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {isPendingScraperTrigger ? "Dispatching..." : "Trigger Scraper Run"}
                </Button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-800/80 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Audit Runs for Campaign</span>
                <span className="font-mono font-bold text-sm text-white mt-0.5 block">
                  {verificationChecks.length} checks logged
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Latest GitHub Run</span>
                <span className="font-mono font-bold text-sm text-emerald-400 mt-0.5 block">
                  {latestGhRun ? `${latestGhRun.conclusion || latestGhRun.status} (${Math.round(latestGhRun.run_duration_ms / 1000)}s)` : "Cron Active"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Last Synchronized</span>
                <span className="font-mono text-sm text-gray-300 mt-0.5 block">
                  {verificationChecks[0]?.checked_at ? new Date(verificationChecks[0].checked_at).toLocaleTimeString() : "Pending run"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">GitHub Action Workflow</span>
                <a
                  href="https://github.com/kpugi/kpugi/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-brand-400 hover:underline mt-0.5 inline-flex items-center gap-1"
                >
                  <span>kpugi/kpugi</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Section 1: Campaign Specific Verification Checks (TailAdmin Basic Table 1 & 2) */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 space-y-3.5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                <div>
                  <h4 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-brand-500" />
                    <span>Campaign Post Verification Audit Checks</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      {verificationChecks.length} Checks
                    </span>
                  </h4>
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400 mt-1">
                    Telemetry logs generated by the automated scraper engine for each submission in this campaign.
                  </p>
                </div>

                {/* Reachability Filters */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
                  {[
                    { id: "all", label: "All Checks" },
                    { id: "reachable", label: "Reachable" },
                    { id: "unreachable", label: "Unreachable" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setRunReachableFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        runReachableFilter === f.id
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-toolbar: Search & Reset */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/80 dark:border-gray-800/60">
                <div className="flex items-center gap-2">
                  {(runSearchQuery || runReachableFilter !== "all" || runSortField !== "time" || runSortDirection !== "desc") && (
                    <button
                      onClick={() => {
                        setRunSearchQuery("");
                        setRunReachableFilter("all");
                        setRunSortField("time");
                        setRunSortDirection("desc");
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={runSearchQuery}
                    onChange={(e) => setRunSearchQuery(e.target.value)}
                    placeholder="Search logs, creator, notes..."
                    className="h-9 w-full rounded-lg border appearance-none ps-8 pe-8 py-1.5 text-xs shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                  {runSearchQuery && (
                    <button
                      onClick={() => setRunSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    {/* Checked Time (Sortable) */}
                    <TableCell
                      isHeader
                      onClick={() => handleRunSort("time")}
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Checked Time</span>
                        {runSortField === "time" ? (
                          runSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                    </TableCell>

                    {/* Creator (Sortable) */}
                    <TableCell
                      isHeader
                      onClick={() => handleRunSort("creator")}
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Creator / Handle</span>
                        {runSortField === "creator" ? (
                          runSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                    </TableCell>

                    {/* Post URL */}
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Post URL
                    </TableCell>

                    {/* Reachable (Sortable) */}
                    <TableCell
                      isHeader
                      onClick={() => handleRunSort("reachable")}
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {runSortField === "reachable" ? (
                          runSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                    </TableCell>

                    {/* Audited Views (Sortable) */}
                    <TableCell
                      isHeader
                      onClick={() => handleRunSort("views")}
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Audited Views</span>
                        {runSortField === "views" ? (
                          runSortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-brand-500" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                    </TableCell>

                    {/* Extractor Engine */}
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Extractor Engine
                    </TableCell>

                    {/* Inspect */}
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Inspect
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {paginatedRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                        No verification checks match the selected filter. Click &ldquo;Trigger Scraper Run&rdquo; above to audit due submissions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRuns.map((chk) => {
                      const extractor = (chk.notes || "").match(/Extractor:\s*([^|]+)/)?.[1]?.trim() || "engine";
                      return (
                        <TableRow key={chk.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                          <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                            {new Date(chk.checked_at).toLocaleString()}
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap text-theme-sm">
                            <span className="font-semibold text-xs text-gray-900 dark:text-white block">
                              {chk.creator_name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {chk.handle || chk.platform}
                            </span>
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap text-theme-sm">
                            {chk.post_url ? (
                              <a
                                href={chk.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-500 hover:underline inline-flex items-center gap-1 text-xs max-w-[180px] truncate"
                              >
                                <span>{chk.post_url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">No link</span>
                            )}
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap">
                            {chk.post_reachable ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Reachable
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
                                <XCircle className="w-3 h-3" />
                                Unreachable
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-xs font-bold text-gray-900 dark:text-white">
                            {chk.view_count !== null ? chk.view_count.toLocaleString() : "—"}
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60">
                              {extractor}
                            </span>
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap text-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setInspectScrapeCheck(chk)}
                              className="px-2.5 py-1 text-xs"
                            >
                              Scrape Data
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Checks Pagination Footer */}
            {filteredAndSortedRuns.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">
                    {(runCurrentPage - 1) * runPageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">
                    {Math.min(filteredAndSortedRuns.length, runCurrentPage * runPageSize)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">
                    {filteredAndSortedRuns.length}
                  </span>{" "}
                  checks
                </div>

                <Pagination
                  currentPage={runCurrentPage}
                  totalPages={runTotalPages}
                  onPageChange={setRunCurrentPage}
                />
              </div>
            )}
          </div>

          {/* Section 2: GitHub Actions Workflow Execution History (TailAdmin Basic Table 1 & 2) */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  <span>GitHub Actions Workflow Execution Logs</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {githubRuns.length} Runs
                  </span>
                </h4>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400 mt-1">
                  Synchronized from GitHub API repository workflow runs (`.github/workflows/scraper-cron.yml`).
                </p>
              </div>

              {/* Status filter & Reset */}
              <div className="flex items-center gap-2">
                {(ghStatusFilter !== "all" || ghSortField !== "time" || ghSortDirection !== "desc") && (
                  <button
                    onClick={() => {
                      setGhStatusFilter("all");
                      setGhSortField("time");
                      setGhSortDirection("desc");
                      setGhCurrentPage(1);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
                  {["all", "success", "failure"].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setGhStatusFilter(st);
                        setGhCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        ghStatusFilter === st
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell
                      isHeader
                      onClick={() => handleGhSort("id")}
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Run ID</span>
                        {ghSortField === "id" ? (
                          ghSortDirection === "asc" ? (
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
                      onClick={() => handleGhSort("status")}
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status / Conclusion</span>
                        {ghSortField === "status" ? (
                          ghSortDirection === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Event Trigger
                    </TableCell>
                    <TableCell
                      isHeader
                      onClick={() => handleGhSort("duration")}
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Duration</span>
                        {ghSortField === "duration" ? (
                          ghSortDirection === "asc" ? (
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
                      onClick={() => handleGhSort("time")}
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Executed At</span>
                        {ghSortField === "time" ? (
                          ghSortDirection === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      GitHub Log
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {paginatedGhRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-gray-400 text-xs">
                        No GitHub Action runs recorded yet for this filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedGhRuns.map((run) => {
                      const isSuccess = run.conclusion === "success";
                      const isFailed = run.conclusion === "failure";

                      return (
                        <TableRow key={run.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                          <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-xs font-semibold text-gray-900 dark:text-white">
                            #{run.id}
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Success
                              </span>
                            ) : isFailed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
                                <XCircle className="w-3 h-3" />
                                Failure
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {run.status}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {run.event}
                            </span>
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                            {Math.round(run.run_duration_ms / 1000)}s
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-[11px] text-gray-500 dark:text-gray-400">
                            {new Date(run.created_at).toLocaleString()}
                          </TableCell>

                          <TableCell className="px-5 py-4 whitespace-nowrap text-end">
                            <a
                              href={run.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-brand-500 hover:text-brand-600 inline-flex items-center gap-1"
                            >
                              <span>Inspect Run</span>
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

            {/* GitHub Runs Pagination Footer */}
            {filteredGhRuns.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">
                    {(ghCurrentPage - 1) * ghPageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">
                    {Math.min(filteredGhRuns.length, ghCurrentPage * ghPageSize)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">
                    {filteredGhRuns.length}
                  </span>{" "}
                  runs
                </div>

                <Pagination
                  currentPage={ghCurrentPage}
                  totalPages={ghTotalPages}
                  onPageChange={setGhCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: FORENSIC AUDIT LEDGER (TailAdmin Basic Table 1) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "audits" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  <span>Forensic Audit Ledger</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {auditTrail.length} Records
                  </span>
                </h2>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400 mt-1">
                  Immutable administrative actions, budget allocations, and lifecycle status change records.
                </p>
              </div>

              {/* Source Filters */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
                {["all", "admin", "brand"].map((src) => (
                  <button
                    key={src}
                    onClick={() => {
                      setAuditSourceFilter(src);
                      setAuditCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      auditSourceFilter === src
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-toolbar: Search & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/80 dark:border-gray-800/60">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => {
                    setAuditSearchQuery(e.target.value);
                    setAuditCurrentPage(1);
                  }}
                  placeholder="Search actions or audit justification..."
                  className="h-9 w-full rounded-lg border appearance-none ps-8 pe-8 py-1.5 text-xs shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
                {auditSearchQuery && (
                  <button
                    onClick={() => setAuditSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {(auditSearchQuery || auditSourceFilter !== "all" || auditSortField !== "time" || auditSortDirection !== "desc") && (
                <button
                  onClick={() => {
                    setAuditSearchQuery("");
                    setAuditSourceFilter("all");
                    setAuditSortField("time");
                    setAuditSortDirection("desc");
                    setAuditCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <TableRow>
                  <TableCell
                    isHeader
                    onClick={() => handleAuditSort("time")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Timestamp</span>
                      {auditSortField === "time" ? (
                        auditSortDirection === "asc" ? (
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
                    onClick={() => handleAuditSort("action")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Action</span>
                      {auditSortField === "action" ? (
                        auditSortDirection === "asc" ? (
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
                    onClick={() => handleAuditSort("source")}
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Source</span>
                      {auditSortField === "source" ? (
                        auditSortDirection === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Justification / Details
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Payload
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {paginatedAuditTrail.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                      No audit events recorded for this campaign matching the filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAuditTrail.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                      <TableCell className="px-5 py-4 whitespace-nowrap font-mono text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>

                      <TableCell className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {log.action}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60">
                          {log.source}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs text-gray-700 dark:text-gray-300 max-w-md">
                        {log.details || "—"}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-end">
                        {log.payload ? (
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {Object.keys(log.payload).length} keys
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Audit Pagination Footer */}
          {filteredAuditTrail.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div>
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white font-mono">
                  {(auditCurrentPage - 1) * auditPageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900 dark:text-white font-mono">
                  {Math.min(filteredAuditTrail.length, auditCurrentPage * auditPageSize)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white font-mono">
                  {filteredAuditTrail.length}
                </span>{" "}
                records
              </div>

              <Pagination
                currentPage={auditCurrentPage}
                totalPages={auditTotalPages}
                onPageChange={setAuditCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAILADMIN MODAL: Status Override (Form In Modal) */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        className="max-w-[600px] p-6 sm:p-10"
      >
        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-brand-500" />
              <span>Override Campaign Status</span>
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select the new lifecycle state for &ldquo;{campaign.title}&rdquo;. Changing status to completed will automatically calculate and execute final escrow settlement.
            </p>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Target Lifecycle State
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {(["live", "paused", "completed", "archived"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setNewStatusValue(st)}
                  className={`py-3 px-4 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer flex items-center justify-between ${
                    newStatusValue === st
                      ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 font-bold"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <span className="capitalize">{st}</span>
                  {newStatusValue === st && <Check className="w-4 h-4 text-brand-500" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="statusReason" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Audit Reason / Justification
            </Label>
            <InputField
              id="statusReason"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="e.g., Client requested temporary pause for creative update"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isPendingStatus}
              onClick={handleExecuteStatusUpdate}
            >
              {isPendingStatus ? "Applying..." : "Apply Status"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* TAILADMIN MODAL: CPM Adjustment (Form In Modal) */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isCpmModalOpen}
        onClose={() => setIsCpmModalOpen(false)}
        className="max-w-[600px] p-6 sm:p-10"
      >
        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-indigo-500" />
              <span>Adjust CPM Rate</span>
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current CPM is <span className="font-bold text-gray-900 dark:text-white font-mono">{formatNaira(campaign.cpm_rate)}</span>. Submissions created after this change will receive this updated rate.
            </p>
          </div>

          <div>
            <Label htmlFor="cpmRate" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              New CPM Rate (₦ per 1,000 views)
            </Label>
            <InputField
              id="cpmRate"
              type="number"
              min={100}
              step={50}
              value={newCpmValue}
              onChange={(e) => setNewCpmValue(e.target.value)}
              placeholder="e.g. 5000"
            />
          </div>

          <div>
            <Label htmlFor="cpmReason" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Audit Justification
            </Label>
            <InputField
              id="cpmReason"
              value={cpmReason}
              onChange={(e) => setCpmReason(e.target.value)}
              placeholder="e.g., Brand bonus incentive rate requested"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCpmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isPendingCpm || !newCpmValue || Number(newCpmValue) <= 0}
              onClick={handleExecuteCpmUpdate}
            >
              {isPendingCpm ? "Updating..." : "Save CPM"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* TAILADMIN MODAL: Budget Adjustment (Form In Modal) */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        className="max-w-[600px] p-6 sm:p-10"
      >
        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Coins className="w-6 h-6 text-brand-500" />
              <span>Adjust Campaign Budget</span>
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current total budget is <span className="font-bold text-gray-900 dark:text-white font-mono">{formatNaira(campaign.total_budget)}</span>, with <span className="font-bold text-brand-500 font-mono">{formatNaira(campaign.spent_budget)}</span> accrued spent.
            </p>
          </div>

          <div>
            <Label htmlFor="totalBudget" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              New Total Budget (₦)
            </Label>
            <InputField
              id="totalBudget"
              type="number"
              min={campaign.spent_budget}
              step={5000}
              value={newBudgetValue}
              onChange={(e) => setNewBudgetValue(e.target.value)}
              placeholder="e.g. 1000000"
            />
          </div>

          <div>
            <Label htmlFor="budgetReason" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Audit Reason / Payment Reference
            </Label>
            <InputField
              id="budgetReason"
              value={budgetReason}
              onChange={(e) => setBudgetReason(e.target.value)}
              placeholder="e.g., Brand deposited additional offline wire funds"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBudgetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isPendingBudget || !newBudgetValue || Number(newBudgetValue) < campaign.spent_budget}
              onClick={handleExecuteBudgetUpdate}
            >
              {isPendingBudget ? "Updating..." : "Update Budget"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* TAILADMIN MODAL: Submission Verification Override */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!overrideSubData}
        onClose={() => setOverrideSubData(null)}
        className="max-w-[600px] p-6 sm:p-10"
      >
        {overrideSubData && (
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                {overrideSubData.targetStatus === "verified_pass" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-500" />
                )}
                <span>
                  Override Submission to {overrideSubData.targetStatus === "verified_pass" ? "Pass" : "Fail"}
                </span>
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You are manually forcing the submission for{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {overrideSubData.creatorName}
                </span>{" "}
                to{" "}
                <span
                  className={`font-bold uppercase ${
                    overrideSubData.targetStatus === "verified_pass"
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {overrideSubData.targetStatus}
                </span>
                . An immutable audit trail record will be written.
              </p>
            </div>

            <div>
              <Label htmlFor="subOverrideReason" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Audit Reason (min 5 chars)
              </Label>
              <InputField
                id="subOverrideReason"
                value={subOverrideReason}
                onChange={(e) => setSubOverrideReason(e.target.value)}
                placeholder="e.g., Verified via creator analytics dashboard screenshot"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOverrideSubData(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isPendingSubOverride || subOverrideReason.trim().length < 5}
                onClick={handleExecuteSubOverride}
              >
                {isPendingSubOverride ? "Overriding..." : "Confirm Override"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* TAILADMIN MODAL: Inspect Scrape JSON */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!inspectScrapeCheck}
        onClose={() => setInspectScrapeCheck(null)}
        className="max-w-[720px] p-6 sm:p-10"
      >
        {inspectScrapeCheck && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <Terminal className="w-6 h-6 text-brand-500" />
                  <span>Raw Scraper Extraction Payload</span>
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Check ID: <span className="font-mono text-gray-700 dark:text-gray-300">{inspectScrapeCheck.id}</span>
                </p>
              </div>

              <button
                onClick={handleCopyRawScrape}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {hasCopiedScrape ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedScrape ? "Copied!" : "Copy JSON"}</span>
              </button>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-mono">Views Captured</span>
                <span className="font-mono font-bold text-base text-gray-900 dark:text-white mt-0.5 block">
                  {inspectScrapeCheck.view_count !== null ? inspectScrapeCheck.view_count.toLocaleString() : "null"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-mono">Reachable</span>
                <span className={`font-mono font-bold text-base mt-0.5 block ${inspectScrapeCheck.post_reachable ? "text-emerald-500" : "text-rose-500"}`}>
                  {inspectScrapeCheck.post_reachable ? "TRUE" : "FALSE"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-mono">Checked Time</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300 mt-1 block">
                  {new Date(inspectScrapeCheck.checked_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {inspectScrapeCheck.notes && (
              <div className="text-xs font-mono text-gray-600 dark:text-gray-400 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/40">
                {inspectScrapeCheck.notes}
              </div>
            )}

            {/* Raw JSON Pre Block */}
            <div className="rounded-xl bg-gray-950 text-gray-200 p-4 font-mono text-xs overflow-x-auto max-h-96">
              <pre>
                {inspectScrapeCheck.raw_scrape
                  ? JSON.stringify(inspectScrapeCheck.raw_scrape, null, 2)
                  : "// No raw scrape payload stored for this check"}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectScrapeCheck(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
