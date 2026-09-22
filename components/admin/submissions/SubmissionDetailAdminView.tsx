"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  Coins,
  Clock,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  User,
  Calendar,
  Building2,
  Code,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  FileText,
  Heart,
  MessageCircle,
  Share2,
  Activity,
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
import SubmissionStatusModal from "./modals/SubmissionStatusModal";
import SubmissionPayoutModal from "./modals/SubmissionPayoutModal";
import ScreenshotPreviewModal from "./modals/ScreenshotPreviewModal";
import ScrapePayloadModal from "./modals/ScrapePayloadModal";
import { triggerSingleSubmissionScrapeAction } from "@/app/actions/admin-submissions";
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  TwitterXIcon,
  FacebookIcon,
} from "@/components/ui/SocialIcons";

export interface VerificationCheckItem {
  id: string;
  submission_id: string;
  checked_at: string;
  post_reachable: boolean;
  view_count: number | null;
  raw_scrape: Record<string, unknown> | null;
  notes: string | null;
}

export interface SubmissionDetailData {
  id: string;
  campaign_id: string;
  creator_id: string;
  social_account_id: string | null;
  status: string;
  post_url: string | null;
  screenshot_url: string | null;
  submitted_at: string;
  reserved_amount: number;
  payout_amount: number | null;
  final_view_count: number | null;
  failure_reason: string | null;
  verified_at: string | null;
  paid_at: string | null;
  commission_amount: number | null;
  campaign?: {
    id: string;
    title: string;
    cpm_rate: number;
    total_budget: number;
    spent_budget: number;
    status: string;
    platform?: string;
    channels?: string[];
    advertiser_id?: string;
    advertiser_name?: string;
  } | null;
  creator?: {
    id: string;
    full_name?: string | null;
    email?: string;
    avatar_url?: string | null;
    display_name?: string | null;
    creator_handle?: string | null;
    kyc_status?: string | null;
    total_earned?: number;
    phone?: string | null;
    created_at?: string;
  } | null;
  social_account?: {
    id: string;
    platform: string;
    handle: string;
    follower_count?: number;
    connected_at?: string;
    last_synced_at?: string;
  } | null;
  verificationChecks: VerificationCheckItem[];
  walletTransactions: any[];
  auditLogs: any[];
}

interface SubmissionDetailAdminViewProps {
  data: SubmissionDetailData;
}

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

function renderPlatformIcon(platform: string, className = "w-4 h-4") {
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

export default function SubmissionDetailAdminView({ data }: SubmissionDetailAdminViewProps) {
  const [submission, setSubmission] = useState(data);
  const [activeTab, setActiveTab] = useState<"proof" | "checks" | "context" | "ledger">("proof");
  const [copiedId, setCopiedId] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [inspectCheck, setInspectCheck] = useState<VerificationCheckItem | null>(null);

  // Tab 2: Scraper Checks Pagination & Filtering
  const [checksCurrentPage, setChecksCurrentPage] = useState(1);
  const [checksPerPage, setChecksPerPage] = useState(10);
  const [checksFilter, setChecksFilter] = useState<"all" | "reachable" | "unreachable">("all");

  const totalChecks = submission.verificationChecks?.length || 0;
  const reachableChecksCount = useMemo(() => {
    return (submission.verificationChecks || []).filter((c) => c.post_reachable).length;
  }, [submission.verificationChecks]);
  const unreachableChecksCount = totalChecks - reachableChecksCount;
  const reachabilityRate = totalChecks > 0 ? Math.round((reachableChecksCount / totalChecks) * 100) : 0;
  const latestCheck = submission.verificationChecks?.[0];

  const filteredChecks = useMemo(() => {
    let list = submission.verificationChecks || [];
    if (checksFilter === "reachable") {
      list = list.filter((c) => c.post_reachable);
    } else if (checksFilter === "unreachable") {
      list = list.filter((c) => !c.post_reachable);
    }
    return list;
  }, [submission.verificationChecks, checksFilter]);

  const checksTotalPages = Math.ceil(filteredChecks.length / checksPerPage) || 1;
  const paginatedChecks = useMemo(() => {
    const start = (checksCurrentPage - 1) * checksPerPage;
    return filteredChecks.slice(start, start + checksPerPage);
  }, [filteredChecks, checksCurrentPage, checksPerPage]);

  const platform = getPlatformFromUrl(
    submission.post_url,
    submission.social_account?.platform || submission.campaign?.channels?.[0] || submission.campaign?.platform
  );
  const creatorName =
    submission.creator?.full_name ||
    submission.creator?.display_name ||
    submission.creator?.email ||
    "Creator";

  const handleCopyId = () => {
    navigator.clipboard.writeText(submission.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleTriggerScrape = async () => {
    setIsScraping(true);
    setScrapeMessage(null);
    try {
      const res = await triggerSingleSubmissionScrapeAction(submission.id);
      setScrapeMessage(res.message);
    } catch (err: any) {
      setScrapeMessage(`Error: ${err.message || "Failed to trigger scraper."}`);
    } finally {
      setIsScraping(false);
    }
  };

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

  const isVerifiedPass = submission.status === "verified_pass" || submission.status === "approved";
  const isVerifiedFail = submission.status === "verified_fail" || submission.status === "rejected";
  const isPending = submission.status === "pending" || submission.status === "joined";
  const isPaid = submission.status === "paid";

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* TOP NAVIGATION BREADCRUMB */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions Directory</span>
        </Link>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HERO COMMAND SUMMARY CARD */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Identity & Context Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
              {renderPlatformIcon(platform, "w-6 h-6")}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Submission #{submission.id.slice(0, 8)}
                </h1>

                {/* Status Pill */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wide ${
                    isVerifiedPass
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                      : isVerifiedFail
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60"
                      : isPaid
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60"
                  }`}
                >
                  {submission.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* Subtext: Creator + Campaign Link */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Creator:</span>
                  <Link
                    href={`/admin/users/${submission.creator_id}`}
                    className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {creatorName}
                  </Link>
                </span>

                {submission.campaign && (
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    <span>Campaign:</span>
                    <Link
                      href={`/admin/campaigns/${submission.campaign_id}`}
                      className="font-semibold text-gray-800 dark:text-gray-200 hover:underline truncate max-w-[220px]"
                    >
                      {submission.campaign.title}
                    </Link>
                  </span>
                )}
              </div>

              {/* Copyable UUID */}
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-[11px] text-gray-400">
                  UUID: {submission.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  title="Copy Submission UUID"
                >
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Post Button */}
            {submission.post_url && (
              <a
                href={submission.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <span>Live Post</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            )}

            {/* Trigger Scrape Check */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerScrape}
              disabled={isScraping || !submission.post_url}
              className="gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? "animate-spin text-brand-500" : ""}`} />
              <span>{isScraping ? "Checking..." : "Re-Check Scraper"}</span>
            </Button>

            {/* Adjust Payout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPayoutModalOpen(true)}
              className="gap-1.5 cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Adjust Payout</span>
            </Button>

            {/* Override Status Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsStatusModalOpen(true)}
              className="gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Override Status</span>
            </Button>
          </div>
        </div>

        {/* Feedback alert message from Scraper */}
        {scrapeMessage && (
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/40 text-xs text-brand-700 dark:text-brand-300 flex items-center justify-between">
            <span>{scrapeMessage}</span>
            <button
              type="button"
              onClick={() => setScrapeMessage(null)}
              className="text-brand-500 hover:underline font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* QUICK METRICS STRIP (4 CARDS) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
          {/* Card 1: Verified Views */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Verified Views Count
            </span>
            <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-brand-500" />
              <span>{(submission.final_view_count || 0).toLocaleString()}</span>
            </p>
          </div>

          {/* Card 2: Reserved Escrow */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Reserved Escrow
            </span>
            <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1">
              ₦{Number(submission.reserved_amount || 0).toLocaleString()}
            </p>
          </div>

          {/* Card 3: Released Payout */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Calculated Payout
            </span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              ₦{Number(submission.payout_amount || 0).toLocaleString()}
            </p>
          </div>

          {/* Card 4: Submission Timestamp */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Submitted Date
            </span>
            <div className="mt-1">
              {renderStackedDate(submission.submitted_at)}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB CONTROLS NAVIGATION */}
      {/* ---------------------------------------------------- */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <nav className="flex space-x-6">
          {[
            { id: "proof", label: "Verification & Proof", icon: <ImageIcon className="w-4 h-4" /> },
            { id: "checks", label: `Scraper Checks (${submission.verificationChecks.length})`, icon: <Clock className="w-4 h-4" /> },
            { id: "context", label: "Campaign & Creator", icon: <Layers className="w-4 h-4" /> },
            { id: "ledger", label: `Ledger & Audits (${submission.auditLogs.length})`, icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: VERIFICATION & PROOF */}
      {/* ---------------------------------------------------- */}
      {activeTab === "proof" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Screenshot Proof Card */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  Creator Screenshot Proof
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Uploaded image from creator verifying publication and metrics.
                </p>
              </div>

              {submission.screenshot_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScreenshotModalOpen(true)}
                >
                  Expand
                </Button>
              )}
            </div>

            {submission.screenshot_url ? (
              <div
                onClick={() => setIsScreenshotModalOpen(true)}
                className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-black/30 border border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[260px] max-h-[380px] cursor-pointer hover:opacity-95 transition-opacity group"
              >
                <img
                  src={submission.screenshot_url}
                  alt="Submission Proof Preview"
                  className="max-h-[360px] w-auto object-contain mx-auto"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Click to view full resolution</span>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400 text-xs rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                No screenshot proof was attached to this submission.
              </div>
            )}
          </div>

          {/* Compliance & Post Metadata */}
          <div className="space-y-6">
            {/* Failure Reason Banner if Failed */}
            {submission.failure_reason && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Verification Failure Flag</span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300 font-mono">
                  {submission.failure_reason}
                </p>
                {submission.verified_at && (
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 block">
                    Flagged at: {new Date(submission.verified_at).toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Post Information Card */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                Published Content Link
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Target URL</span>
                  {submission.post_url ? (
                    <a
                      href={submission.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 dark:text-brand-400 hover:underline break-all font-mono font-semibold flex items-center gap-1"
                    >
                      <span>{submission.post_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">No post URL submitted yet.</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
                  <div>
                    <span className="text-gray-400 block">Detected Platform</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize flex items-center gap-1.5 mt-0.5">
                      {renderPlatformIcon(platform)}
                      <span>{platform}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Last Verified At</span>
                    <span className="font-mono text-gray-800 dark:text-gray-200 block mt-0.5">
                      {submission.verified_at ? new Date(submission.verified_at).toLocaleString() : "Never"}
                    </span>
                  </div>
                </div>

                {submission.social_account && (
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                    <span className="text-gray-400 block">Registered Social Channel</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 block mt-0.5 font-mono">
                      @{submission.social_account.handle} ({(submission.social_account.follower_count || 0).toLocaleString()} followers)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: SCRAPER TELEMETRY & CHECKS HISTORY (TABULATED) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "checks" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Total Checks
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Activity className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                  {totalChecks}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Reachability
              </span>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                  {reachabilityRate}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Latest Views
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Eye className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                  {latestCheck?.view_count !== null && latestCheck?.view_count !== undefined
                    ? Number(latestCheck.view_count).toLocaleString()
                    : submission.final_view_count !== null
                    ? Number(submission.final_view_count).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Scraper Engine
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Code className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate">
                  {(latestCheck?.raw_scrape as Record<string, any>)?.extractor || "OpenGraph"}
                </span>
              </div>
            </div>
          </div>

          {/* Scraper Checks Table Container */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            {/* Header + Filter Bar */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  Scraper Verification Checks
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Automated telemetry history captured by the scraper engine.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Filter Pills */}
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setChecksFilter("all");
                      setChecksCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      checksFilter === "all"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-semibold"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    All ({totalChecks})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChecksFilter("reachable");
                      setChecksCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      checksFilter === "reachable"
                        ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Reachable ({reachableChecksCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChecksFilter("unreachable");
                      setChecksCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      checksFilter === "unreachable"
                        ? "bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Unreachable ({unreachableChecksCount})
                  </button>
                </div>

                {/* Trigger Scrape Action */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTriggerScrape}
                  disabled={isScraping || !submission.post_url}
                  className="gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${isScraping ? "animate-spin" : ""}`} />
                  <span>Trigger Check</span>
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      # &amp; Timestamp
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Reachability
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Recorded Views
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Engagement
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Engine &amp; Diagnostics
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-2.5 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      Payload
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {paginatedChecks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No verification checks match the selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedChecks.map((chk, idx) => {
                      const raw = (chk.raw_scrape || {}) as Record<string, any>;
                      const likes = raw.like_count;
                      const comments = raw.comment_count;
                      const shares = raw.share_count;
                      const extractor = raw.extractor || "OpenGraph";
                      const errorMsg = raw.error_message;
                      const checkNumber = totalChecks - ((checksCurrentPage - 1) * checksPerPage + idx);

                      return (
                        <TableRow
                          key={chk.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors"
                        >
                          {/* # & Timestamp */}
                          <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 w-6">
                                #{checkNumber}
                              </span>
                              {renderStackedDate(chk.checked_at)}
                            </div>
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

                          {/* Payload View */}
                          <TableCell className="px-5 py-3 text-end whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setInspectCheck(chk)}
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

            {/* Pagination Footer */}
            {checksTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    Showing {(checksCurrentPage - 1) * checksPerPage + 1} to{" "}
                    {Math.min(checksCurrentPage * checksPerPage, filteredChecks.length)} of{" "}
                    {filteredChecks.length} checks
                  </span>
                  <select
                    value={checksPerPage}
                    onChange={(e) => {
                      setChecksPerPage(Number(e.target.value));
                      setChecksCurrentPage(1);
                    }}
                    className="text-[11px] px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-300"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>

                <Pagination
                  currentPage={checksCurrentPage}
                  totalPages={checksTotalPages}
                  onPageChange={setChecksCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: CAMPAIGN & CREATOR CONTEXT */}
      {/* ---------------------------------------------------- */}
      {activeTab === "context" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Overview Card */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  Campaign Overview
                </h3>
                <p className="text-xs text-gray-400">
                  Target marketing brief and payout parameters.
                </p>
              </div>

              {submission.campaign && (
                <Link
                  href={`/admin/campaigns/${submission.campaign_id}`}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <span>Inspect Campaign</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {submission.campaign ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Title</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block mt-0.5">
                    {submission.campaign.title}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-gray-400 block">CPM Rate</span>
                    <span className="text-sm font-bold font-mono text-gray-800 dark:text-gray-200 mt-0.5 block">
                      ₦{Number(submission.campaign.cpm_rate || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Campaign Status</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mt-0.5 inline-block">
                      {submission.campaign.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
                  <div>
                    <span className="text-gray-400 block">Total Budget</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      ₦{Number(submission.campaign.total_budget || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Spent Budget</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      ₦{Number(submission.campaign.spent_budget || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Campaign details unavailable.</p>
            )}
          </div>

          {/* Creator Profile Card */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  Creator Profile
                </h3>
                <p className="text-xs text-gray-400">
                  Creator reputation and verification standing.
                </p>
              </div>

              <Link
                href={`/admin/users/${submission.creator_id}`}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>Inspect User</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs">
                  {submission.creator?.avatar_url ? (
                    <Image
                      width={40}
                      height={40}
                      src={submission.creator.avatar_url}
                      alt={creatorName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    creatorName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white block">
                    {creatorName}
                  </span>
                  <span className="text-gray-400 font-mono text-[11px] block">
                    {submission.creator?.email}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
                <div>
                  <span className="text-gray-400 block">Didit KYC Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mt-0.5 inline-block">
                    {submission.creator?.kyc_status || "unverified"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Total Platform Earned</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white mt-0.5 block">
                    ₦{Number(submission.creator?.total_earned || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: FINANCIAL LEDGER & FORENSIC AUDIT TRAIL */}
      {/* ---------------------------------------------------- */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          {/* Related Ledger Transactions */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                Escrow &amp; Payout Transactions ({submission.walletTransactions.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Financial double-entry transactions tied directly to this submission.
              </p>
            </div>

            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Timestamp
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Type
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Amount (NGN)
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Reference Code
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {submission.walletTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                        No financial ledger transactions logged for this submission yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submission.walletTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                        <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                          {renderStackedDate(tx.created_at)}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {tx.type.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs font-bold text-gray-900 dark:text-white">
                          ₦{Number(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs text-gray-400">
                          {tx.paystack_reference || "System Ledger"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Forensic Audit Logs */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                Forensic Audit Trail ({submission.auditLogs.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Append-only security records of manual interventions and scraper actions.
              </p>
            </div>

            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Timestamp
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Action
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Details / Justification
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {submission.auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-gray-400 text-xs">
                        No manual audit entries recorded for this submission yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submission.auditLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                        <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                          {renderStackedDate(log.created_at)}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {log.action}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start text-xs text-gray-700 dark:text-gray-300">
                          {log.details || "—"}
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

      {/* Modals */}
      <SubmissionStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        submission={{
          id: submission.id,
          status: submission.status,
          creatorName,
          campaignTitle: submission.campaign?.title,
          reservedAmount: submission.reserved_amount,
          failureReason: submission.failure_reason,
        }}
        onSuccess={(newStatus) => {
          setSubmission((prev) => ({
            ...prev,
            status: newStatus,
            verified_at: new Date().toISOString(),
          }));
        }}
      />

      <SubmissionPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        submission={{
          id: submission.id,
          reservedAmount: submission.reserved_amount,
          payoutAmount: submission.payout_amount,
          creatorName,
        }}
        onSuccess={(newPayout) => {
          setSubmission((prev) => ({ ...prev, payout_amount: newPayout }));
        }}
      />

      <ScreenshotPreviewModal
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        imageUrl={submission.screenshot_url}
        submissionId={submission.id}
        creatorName={creatorName}
      />

      <ScrapePayloadModal
        isOpen={!!inspectCheck}
        onClose={() => setInspectCheck(null)}
        check={
          inspectCheck
            ? {
                id: inspectCheck.id,
                checkedAt: inspectCheck.checked_at,
                postReachable: inspectCheck.post_reachable,
                viewCount: inspectCheck.view_count,
                rawScrape: inspectCheck.raw_scrape,
                notes: inspectCheck.notes,
              }
            : null
        }
      />
    </div>
  );
}
