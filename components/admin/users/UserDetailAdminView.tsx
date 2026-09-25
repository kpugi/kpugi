"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/components/ui/table";
import { Modal } from "@/components/admin/components/ui/modal";
import Button from "@/components/admin/components/ui/button/Button";
import UserSuspensionModal from "./modals/UserSuspensionModal";
import WalletAdjustmentModal from "./modals/WalletAdjustmentModal";
import UserRoleKycModal from "./modals/UserRoleKycModal";
import { toggleUserAdminStatus } from "@/app/actions/admin";
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Sparkles,
  ExternalLink,
  Wallet,
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Clock,
  Mail,
  Phone,
  AlertCircle,
  Sliders,
  DollarSign,
  TrendingUp,
  FileText,
  Lock,
  Layers,
  Activity,
  History,
  Info,
  Trophy,
  Award,
} from "lucide-react";
import { getCreatorLevel, CREATOR_LEVELS } from "@/lib/utils/levels";
import CreatorLevelBadge from "@/components/creator/CreatorLevelBadge";
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  TwitterXIcon,
  FacebookIcon,
} from "@/components/ui/SocialIcons";

export interface UserDetailProps {
  user: {
    id: string;
    clerk_id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    phone: string | null;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
    account_status: "active" | "suspended";
    suspended_reason?: string | null;
    suspended_at?: string | null;
  };
  creatorProfile?: {
    display_name?: string | null;
    bio?: string | null;
    creator_handle?: string | null;
    kyc_status?: string | null;
    kyc_didit_session_id?: string | null;
    kyc_verified_at?: string | null;
    total_earned?: number;
    paystack_recipient_code?: string | null;
  } | null;
  advertiserProfile?: {
    company_name?: string | null;
    company_website?: string | null;
    billing_email?: string | null;
    industry?: string | null;
    location?: string | null;
    tax_id?: string | null;
  } | null;
  socialAccounts: Array<{
    id: string;
    platform: string;
    handle: string;
    platform_user_id: string;
    follower_count?: number;
    connected_at: string;
    last_synced_at?: string;
  }>;
  wallets: Array<{
    id: string;
    wallet_type: string;
    balance: number;
    created_at: string;
  }>;
  walletTransactions: Array<{
    id: string;
    wallet_id: string;
    type: string;
    amount: number;
    paystack_reference?: string | null;
    created_at: string;
  }>;
  campaignsCreated: Array<{
    id: string;
    title: string;
    status: string;
    cpm_rate: number;
    total_budget: number;
    spent_budget: number;
    created_at: string;
  }>;
  submissionsMade: Array<{
    id: string;
    post_url: string;
    status: string;
    final_view_count?: number | null;
    reserved_amount: number;
    payout_amount?: number | null;
    submitted_at: string;
    verified_at?: string | null;
    campaign?: {
      id: string;
      title: string;
      cpm_rate: number;
    } | null;
  }>;
  auditTrail: Array<{
    id: string;
    action: string;
    actor_role: string;
    details?: string | null;
    payload?: any;
    created_at: string;
  }>;
  clerkMetadata?: {
    lastSignInAt?: string | null;
    isEmailVerified?: boolean;
    banned?: boolean;
  } | null;
  currentAdminId: string;
}

export default function UserDetailAdminView({
  user: initialUser,
  creatorProfile: initialCreatorProfile,
  advertiserProfile: initialAdvertiserProfile,
  socialAccounts,
  wallets: initialWallets,
  walletTransactions,
  campaignsCreated,
  submissionsMade,
  auditTrail,
  clerkMetadata,
  currentAdminId,
}: UserDetailProps) {
  const router = useRouter();

  // Local State
  const [user, setUser] = useState(initialUser);
  const [creatorProfile, setCreatorProfile] = useState(initialCreatorProfile);
  const [advertiserProfile, setAdvertiserProfile] = useState(initialAdvertiserProfile);
  const [wallets, setWallets] = useState(initialWallets);
  const [activeTab, setActiveTab] = useState<
    "overview" | "footprint" | "activity" | "finances" | "audits"
  >("overview");

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal States
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isRoleKycModalOpen, setIsRoleKycModalOpen] = useState(false);
  const [payloadModalContent, setPayloadModalContent] = useState<any | null>(null);

  // Operator Action Loading State
  const [isTogglingAdmin, setIsTogglingAdmin] = useState(false);

  const isSelf = user.id === currentAdminId;
  const isSuspended = user.account_status === "suspended";

  // Balance helpers
  const creatorWallet = wallets.find((w) => w.wallet_type === "creator_earnings");
  const advertiserWallet = wallets.find((w) => w.wallet_type === "advertiser_funding");
  const creatorBalance = Number(creatorWallet?.balance) || 0;
  const advertiserBalance = Number(advertiserWallet?.balance) || 0;
  const totalBalance = creatorBalance + advertiserBalance;

  // Creator Gamification Rank helpers
  const isCreator = user.role === "creator" || user.role === "both" || !!creatorProfile;
  const totalEarned = Number(creatorProfile?.total_earned) || 0;
  const rankData = getCreatorLevel(totalEarned);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Admin toggle helper
  const handleToggleAdmin = async () => {
    if (isSelf) return;
    setIsTogglingAdmin(true);
    try {
      const res = await toggleUserAdminStatus(user.id, user.is_admin);
      if (res.success) {
        setUser((prev) => ({ ...prev, is_admin: res.is_admin }));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update admin permissions.");
    } finally {
      setIsTogglingAdmin(false);
    }
  };

  // Stacked date time formatter
  const renderStackedDate = (dateVal: string | null | undefined) => {
    if (!dateVal) return <span className="text-gray-400">—</span>;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return <span className="text-gray-400">—</span>;
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

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* NAVIGATION BREADCRUMB */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users Directory</span>
        </Link>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HEADER HERO PROFILE CARD */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/3 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* User Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shrink-0 relative flex items-center justify-center font-bold text-xl text-gray-600 dark:text-gray-300">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name || "User Avatar"}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                (user.full_name || user.email).slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Core Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {user.full_name || "Anonymous User"}
                </h1>
                {isSelf && (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                    YOUR ACCOUNT
                  </span>
                )}
                {user.is_admin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    <Shield className="w-3 h-3 text-indigo-500" />
                    <span>Administrator</span>
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    user.role === "advertiser"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                      : user.role === "both"
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {user.role}
                </span>

                {/* Creator Gamification Rank Badge */}
                {isCreator && (
                  <CreatorLevelBadge
                    totalEarned={totalEarned}
                    variant="pill"
                  />
                )}

                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold font-mono uppercase ${
                    isSuspended
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                  }`}
                >
                  {user.account_status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono">{user.email}</span>
                </span>

                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono">{user.phone}</span>
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </span>
              </div>

              {/* Copyable IDs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-gray-400">
                <button
                  type="button"
                  onClick={() => handleCopy(user.id, "profile_id")}
                  className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Profile UUID"
                >
                  <span>ID: {user.id.slice(0, 8)}...</span>
                  {copiedKey === "profile_id" ? (
                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 opacity-60" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(user.clerk_id, "clerk_id")}
                  className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Clerk User ID"
                >
                  <span>Clerk: {user.clerk_id.slice(0, 10)}...</span>
                  {copiedKey === "clerk_id" ? (
                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 opacity-60" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Adjust Wallet */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Wallet className="w-3.5 h-3.5 text-brand-500" />
              <span>Adjust Wallet</span>
            </Button>

            {/* Role & KYC Modal */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRoleKycModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Override Role / KYC</span>
            </Button>

            {/* Toggle Admin */}
            {!isSelf && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAdmin}
                disabled={isTogglingAdmin}
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <Shield className="w-3.5 h-3.5 text-purple-500" />
                <span>{user.is_admin ? "Revoke Admin" : "Grant Admin"}</span>
              </Button>
            )}

            {/* Suspend / Reactivate */}
            {!isSelf && (
              <button
                type="button"
                onClick={() => setIsSuspensionModalOpen(true)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSuspended
                    ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 hover:bg-rose-100"
                }`}
              >
                {isSuspended ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Reactivate Account</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* QUICK METRICS STRIP (4 CARDS) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
          {/* Card 1: Wallet Liquidity */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Wallet Balance (NGN)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                ₦{totalBalance.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
              Creator: ₦{creatorBalance.toLocaleString()} • Brand: ₦{advertiserBalance.toLocaleString()}
            </span>
          </div>

          {/* Card 2: Creator Gamification Rank or Platform Activity */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
                {isCreator ? "Creator Rank & Gamification" : "Platform Activity"}
              </span>
              {isCreator ? (
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Activity className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              {isCreator ? (
                <span className="text-base sm:text-lg font-bold font-display text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
                  <span>{rankData.levelInfo.icon}</span>
                  <span>Lvl {rankData.currentLevelNumber}: {rankData.levelInfo.title}</span>
                </span>
              ) : (
                <span className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                  {campaignsCreated.length} Campaigns
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block truncate">
              {isCreator
                ? `₦${totalEarned.toLocaleString()} earned • ${rankData.progressPercent}% to Lvl ${rankData.nextLevelInfo?.level || 14}`
                : "Active Briefs & Creative Escrows"}
            </span>
          </div>

          {/* Card 3: Didit Identity & KYC */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Didit KYC Identity
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              {creatorProfile?.kyc_status === "verified" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Fully Verified</span>
                </span>
              ) : creatorProfile?.kyc_status === "pending" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>Under Review</span>
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-500">Unverified</span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block truncate">
              {creatorProfile?.kyc_didit_session_id
                ? `Session: ${creatorProfile.kyc_didit_session_id.slice(0, 16)}...`
                : "No Didit session recorded"}
            </span>
          </div>

          {/* Card 4: Account Clearance */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Account Clearance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-lg font-bold capitalize ${
                  isSuspended ? "text-rose-500" : "text-gray-900 dark:text-white"
                }`}
              >
                {user.account_status}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block truncate">
              {isSuspended
                ? `Reason: ${user.suspended_reason || "Administrative block"}`
                : user.is_admin
                ? "Full Administrator Clearance"
                : "Standard Platform Clearance"}
            </span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 5-TAB NAVIGATION */}
      {/* ---------------------------------------------------- */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {[
          { id: "overview", label: "Overview & Identity", icon: Users },
          { id: "footprint", label: "Platform Footprint", icon: Layers },
          {
            id: "activity",
            label: user.role === "advertiser" ? "Created Campaigns" : "Creator Submissions",
            icon: Activity,
          },
          { id: "finances", label: "Financial Ledger", icon: Wallet },
          { id: "audits", label: "Forensic Audit Trail", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 border-b-2 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & IDENTITY */}
      {/* ---------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/3 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" />
              <span>Authentication &amp; Identity Profile</span>
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Full Name</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {user.full_name || "—"}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Email Address</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {user.email}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Phone Number</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {user.phone || "Not provided"}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Clerk User ID</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {user.clerk_id}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Joined Platform</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {new Date(user.created_at).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Last Profile Update</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {new Date(user.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Role Profile Specifics Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/3 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>
                {user.role === "advertiser"
                  ? "Advertiser Brand Profile"
                  : "Creator Portfolio Specifics"}
              </span>
            </h3>

            {user.role === "advertiser" ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Company Name</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {advertiserProfile?.company_name || "—"}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-500">Website</span>
                  {advertiserProfile?.company_website ? (
                    <a
                      href={advertiserProfile.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      <span>{advertiserProfile.company_website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Billing Email</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {advertiserProfile?.billing_email || user.email}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Industry</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {advertiserProfile?.industry || "Unspecified"}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {advertiserProfile?.location || "Nigeria"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Creator Handle</span>
                  <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                    @{creatorProfile?.creator_handle || "unclaimed"}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Display Name</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {creatorProfile?.display_name || user.full_name || "—"}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Total Lifetime Earnings</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    ₦{(creatorProfile?.total_earned || 0).toLocaleString()}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Paystack Recipient</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {creatorProfile?.paystack_recipient_code || "None configured"}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Bio / Description</span>
                  <span className="text-gray-800 dark:text-gray-200 italic max-w-[240px] truncate">
                    {creatorProfile?.bio || "No bio added"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Creator Gamification Rank & Progression Card */}
          {isCreator && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/3 space-y-4 md:col-span-2 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                      Creator Rank &amp; Gamification Progression
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Platform tier calculated automatically from Paystack verified lifetime campaign earnings.
                    </p>
                  </div>
                </div>

                <CreatorLevelBadge
                  totalEarned={totalEarned}
                  variant="pill"
                />
              </div>

              {/* 3-card Rank Detail Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Current Level Card */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${rankData.levelInfo.badgeBg} ${rankData.levelInfo.badgeBorder}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{rankData.levelInfo.icon}</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        Rank #{rankData.currentLevelNumber} of 14
                      </span>
                    </div>
                    <h4 className="font-display font-extrabold text-lg text-gray-900 dark:text-white mt-2">
                      Level {rankData.currentLevelNumber}: {rankData.levelInfo.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {rankData.levelInfo.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-500">Tier Range:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      ₦{rankData.levelInfo.minEarnings.toLocaleString()}
                      {rankData.levelInfo.maxEarnings ? ` - ₦${rankData.levelInfo.maxEarnings.toLocaleString()}` : '+'}
                    </span>
                  </div>
                </div>

                {/* Progress to Next Rank */}
                <div className="p-4 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono block">
                      Progress to Next Tier
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-bold font-display text-gray-900 dark:text-white">
                        {rankData.progressPercent}%
                      </span>
                      {rankData.nextLevelInfo ? (
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          Next: {rankData.nextLevelInfo.icon} {rankData.nextLevelInfo.title}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          💎 Max Diamond Rank
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${rankData.levelInfo.gradient}`}
                        style={{ width: `${rankData.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-2 border-t border-gray-200/60 dark:border-white/5">
                    {rankData.nextLevelInfo ? (
                      <div className="flex justify-between items-center font-mono text-[11px]">
                        <span>Needed for Lvl {rankData.nextLevelInfo.level}:</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ₦{rankData.amountNeededForNextLevel.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Maximum platform gamification rank unlocked!
                      </span>
                    )}
                    <div className="flex justify-between items-center font-mono text-[11px]">
                      <span>Lifetime Earnings:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₦{totalEarned.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platform Rank Perks Card */}
                <div className="p-4 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono block">
                      Platform Ranks Matrix
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      Kpugi features a 14-tier creator hierarchy granting priority verification queues, escrow limits, and dedicated campaign specialists.
                    </p>
                  </div>

                  <div>
                    <CreatorLevelBadge
                      totalEarned={totalEarned}
                      variant="pill"
                      className="w-full justify-center py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: PLATFORM FOOTPRINT & SOCIAL ACCOUNTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "footprint" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              Connected Social Accounts ({socialAccounts.length})
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Verified social channels connected via OAuth for automated scraping and view telemetry.
            </p>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <TableRow>
                  <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Platform
                  </TableCell>
                  <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Handle &amp; User ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Follower Count
                  </TableCell>
                  <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Connected At
                  </TableCell>
                  <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Last Synced
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {socialAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                      No social accounts have been connected by this creator yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  socialAccounts.map((soc) => (
                    <TableRow key={soc.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                      <TableCell className="px-5 py-3.5 text-start whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center">
                            {soc.platform === "tiktok" && <TikTokIcon className="w-4 h-4" />}
                            {soc.platform === "instagram" && <InstagramIcon className="w-4 h-4" />}
                            {soc.platform === "youtube" && <YouTubeIcon className="w-4 h-4" />}
                            {soc.platform === "x" && <TwitterXIcon className="w-4 h-4" />}
                            {soc.platform === "facebook" && <FacebookIcon className="w-4 h-4" />}
                          </div>
                          <span className="font-semibold text-xs text-gray-900 dark:text-white capitalize">
                            {soc.platform}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-3.5 text-start font-mono text-xs">
                        <span className="font-semibold text-brand-600 dark:text-brand-400 block">
                          @{soc.handle}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          UID: {soc.platform_user_id}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-3.5 text-start font-mono text-xs">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {(soc.follower_count || 0).toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                        {renderStackedDate(soc.connected_at)}
                      </TableCell>

                      <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                        {renderStackedDate(soc.last_synced_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: ACTIVITY LEDGER (CAMPAIGNS OR SUBMISSIONS) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "activity" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              {user.role === "advertiser"
                ? `Created Campaigns (${campaignsCreated.length})`
                : `Creator Submissions (${submissionsMade.length})`}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {user.role === "advertiser"
                ? "Briefs and marketing campaigns launched by this advertiser account."
                : "Content submissions across social platforms with view verification history."}
            </p>
          </div>

          <div className="max-w-full overflow-x-auto">
            {user.role === "advertiser" ? (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Campaign Title
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      CPM Rate
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Budget &amp; Spent
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Created Date
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {campaignsCreated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No campaigns created by this brand yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaignsCreated.map((camp) => (
                      <TableRow key={camp.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                        <TableCell className="px-5 py-3.5 text-start font-semibold text-xs text-gray-900 dark:text-white">
                          {camp.title}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {camp.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs">
                          ₦{Number(camp.cpm_rate).toLocaleString()}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs">
                          <span className="text-gray-900 dark:text-white font-semibold">
                            ₦{Number(camp.total_budget).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            Spent: ₦{Number(camp.spent_budget || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                          {renderStackedDate(camp.created_at)}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-end whitespace-nowrap">
                          <Link
                            href={`/admin/campaigns/${camp.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                          >
                            <span>Inspect Campaign</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Campaign
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Post URL
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Audited Views
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Payout
                    </TableCell>
                    <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Submitted
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {submissionsMade.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No submissions recorded for this creator yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissionsMade.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                        <TableCell className="px-5 py-3.5 text-start font-semibold text-xs text-gray-900 dark:text-white">
                          {sub.campaign?.title || "Campaign"}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs">
                          <a
                            href={sub.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:underline inline-flex items-center gap-1 max-w-[180px] truncate"
                          >
                            <span className="truncate">{sub.post_url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs">
                          {(sub.final_view_count || 0).toLocaleString()} views
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs text-emerald-600 font-semibold">
                          ₦{Number(sub.payout_amount || sub.reserved_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                          {renderStackedDate(sub.submitted_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: FINANCIAL LEDGER & WALLETS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "finances" && (
        <div className="space-y-6">
          {/* Wallets Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Creator Earnings Wallet
                </span>
                <p className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1">
                  ₦{creatorBalance.toLocaleString()}
                </p>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                  Wallet ID: {creatorWallet?.id.slice(0, 16) || "Not provisioned"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWalletModalOpen(true)}
              >
                Adjust
              </Button>
            </div>

            {/* Lifetime Earnings & Rank Status for Creators */}
            {isCreator && (
              <div className="p-5 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Lifetime Earned (Rank Lvl {rankData.currentLevelNumber})
                    </span>
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    ₦{totalEarned.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                    {rankData.levelInfo.icon} {rankData.levelInfo.title} • {rankData.progressPercent}% to next rank
                  </span>
                </div>
                <CreatorLevelBadge
                  totalEarned={totalEarned}
                  variant="pill"
                />
              </div>
            )}

            <div className="p-5 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Advertiser Funding Wallet
                </span>
                <p className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1">
                  ₦{advertiserBalance.toLocaleString()}
                </p>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                  Wallet ID: {advertiserWallet?.id.slice(0, 16) || "Not provisioned"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWalletModalOpen(true)}
              >
                Adjust
              </Button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                Transaction Ledger ({walletTransactions.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Double-entry financial log recording deposits, campaign escrows, payouts, and admin adjustments.
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
                      Transaction Type
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
                  {walletTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-gray-400 text-xs">
                        No financial transactions have been executed on this account yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    walletTransactions.map((tx) => (
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
                        <TableCell className="px-5 py-3.5 text-start font-mono text-xs text-gray-500 dark:text-gray-400">
                          {tx.paystack_reference || "Direct Ledger"}
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
      {/* TAB 5: FORENSIC AUDIT TRAIL */}
      {/* ---------------------------------------------------- */}
      {activeTab === "audits" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3 shadow-xs">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              Forensic Audit Ledger ({auditTrail.length})
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Append-only security log of all administrative interventions and role transitions for this user.
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
                    Actor Role
                  </TableCell>
                  <TableCell isHeader className="px-5 py-2.5 text-start text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Justification / Details
                  </TableCell>
                  <TableCell isHeader className="px-5 py-2.5 text-end text-[11px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Payload
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {auditTrail.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                      No administrative audit events recorded for this user yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditTrail.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                      <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                        {renderStackedDate(log.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-start font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {log.action}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-start">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60">
                          {log.actor_role}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-start text-xs text-gray-700 dark:text-gray-300 max-w-sm truncate">
                        {log.details || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-end whitespace-nowrap">
                        {log.payload ? (
                          <button
                            type="button"
                            onClick={() => setPayloadModalContent(log.payload)}
                            className="px-2 py-1 rounded text-[10px] font-mono font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-400 transition-colors cursor-pointer"
                          >
                            Inspect JSON
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-mono">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODALS */}
      {/* ---------------------------------------------------- */}
      <UserSuspensionModal
        isOpen={isSuspensionModalOpen}
        onClose={() => setIsSuspensionModalOpen(false)}
        user={{
          id: user.id,
          fullName: user.full_name || "User",
          email: user.email,
          isSuspended,
        }}
        onSuccess={(newStatus) => {
          setUser((prev) => ({ ...prev, account_status: newStatus }));
          router.refresh();
        }}
      />

      <WalletAdjustmentModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        user={{
          id: user.id,
          fullName: user.full_name || "User",
          email: user.email,
          role: user.role,
          creatorBalance,
        }}
        onSuccess={(newBalance, walletType) => {
          setWallets((prev) => {
            const exists = prev.find((w) => w.wallet_type === walletType);
            if (exists) {
              return prev.map((w) => (w.wallet_type === walletType ? { ...w, balance: newBalance } : w));
            }
            return [...prev, { id: 'w_' + Date.now(), wallet_type: walletType, balance: newBalance, created_at: new Date().toISOString() }];
          });
          router.refresh();
        }}
      />

      <UserRoleKycModal
        isOpen={isRoleKycModalOpen}
        onClose={() => setIsRoleKycModalOpen(false)}
        user={{
          id: user.id,
          fullName: user.full_name || "User",
          email: user.email,
          role: user.role,
          kycStatus: creatorProfile?.kyc_status || "unverified",
        }}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* JSON Payload Inspector Modal */}
      <Modal
        isOpen={!!payloadModalContent}
        onClose={() => setPayloadModalContent(null)}
        className="max-w-[640px] p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              <span>Audit Event Payload</span>
            </h3>
          </div>
          <pre className="p-4 rounded-xl bg-gray-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[400px]">
            {JSON.stringify(payloadModalContent, null, 2)}
          </pre>
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPayloadModalContent(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
