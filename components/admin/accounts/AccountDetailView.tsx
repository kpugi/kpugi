"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Users,
  Video,
  Heart,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Share2,
  User,
  MessageSquare,
} from "lucide-react";
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  TwitterXIcon,
} from "@/components/ui/SocialIcons";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/admin/components/ui/table";
import Badge from "@/components/admin/components/ui/badge/Badge";
import Button from "@/components/admin/components/ui/button/Button";
import {
  SocialAccountDetailResponse,
  updateSocialAccountVerificationAction,
  disconnectSocialAccountAction,
  resyncSocialAccountStatsAction,
} from "@/app/actions/admin-accounts";

interface AccountDetailViewProps {
  initialData: SocialAccountDetailResponse;
}

export default function AccountDetailView({
  initialData,
}: AccountDetailViewProps) {
  const [data, setData] = useState<SocialAccountDetailResponse>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [creatorAvatarError, setCreatorAvatarError] = useState(false);
  const [ownerAvatarError, setOwnerAvatarError] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const account = data.account;
  const submissions = data.submissions;
  const metrics = data.metrics;

  React.useEffect(() => {
    setAvatarError(false);
    setCreatorAvatarError(false);
    setOwnerAvatarError(false);
  }, [account.avatar_url, account.creator?.avatar_url, account.id]);

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

  const formatFollowers = (count: number | null) => {
    if (count === null || count === undefined) return "—";
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
    return count.toLocaleString();
  };

  const renderNetworkIcon = (platform: string, className = "w-3.5 h-3.5") => {
    const p = platform.toLowerCase();
    switch (p) {
      case "youtube":
        return <YouTubeIcon className={className} />;
      case "tiktok":
        return <TikTokIcon className={className} />;
      case "instagram":
        return <InstagramIcon className={className} />;
      case "x":
      case "twitter":
        return <TwitterXIcon className={className} />;
      case "facebook":
        return <FacebookIcon className={className} />;
      default:
        return <Share2 className={className} />;
    }
  };

  const getNetworkBadgeStyle = (platform: string) => {
    const p = platform.toLowerCase();
    switch (p) {
      case "youtube":
        return "bg-red-600 text-white";
      case "tiktok":
        return "bg-black text-white";
      case "instagram":
        return "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white";
      case "x":
      case "twitter":
        return "bg-black text-white";
      case "facebook":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-800 text-white";
    }
  };

  const handleResyncStats = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await resyncSocialAccountStatsAction(account.id);
      if (res.success && res.data) {
        setData(res.data);
        setFeedback({
          type: "success",
          message: "Profile statistics re-synced successfully from live social platform!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to re-sync stats from social platform.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "An unexpected error occurred while re-syncing.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleVerification = (targetStatus: "verified" | "unverified") => {
    startTransition(async () => {
      try {
        const res = await updateSocialAccountVerificationAction(
          account.id,
          targetStatus
        );
        setData((prev) => ({
          ...prev,
          account: {
            ...prev.account,
            verification_status: res.newStatus as any,
            verified_at: res.newStatus === "verified" ? new Date().toISOString() : null,
          },
        }));
        setFeedback({
          type: "success",
          message: `Account verification successfully set to ${targetStatus}.`,
        });
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "Failed to update verification status.",
        });
      }
    });
  };

  const handleDisconnect = () => {
    if (
      !confirm(
        `Are you sure you want to disconnect @${account.handle}? Creator will need to re-link this profile.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await disconnectSocialAccountAction(account.id);
        setFeedback({
          type: "success",
          message: "Social account unlinked successfully.",
        });
        setTimeout(() => {
          window.location.href = "/admin/accounts";
        }, 1200);
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "Failed to unlink account.",
        });
      }
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/accounts"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Accounts</span>
        </Link>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-sans flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Account Picture with Network Overlay Badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-gray-700 dark:text-slate-300 shadow-2xs relative select-none">
                {account.avatar_url && !avatarError ? (
                  <img
                    src={account.avatar_url}
                    alt={account.display_name || account.handle}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : account.creator.avatar_url && !creatorAvatarError ? (
                  <img
                    src={account.creator.avatar_url}
                    alt={account.creator.full_name || account.handle}
                    referrerPolicy="no-referrer"
                    onError={() => setCreatorAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-slate-300 font-bold text-lg">
                    {(account.display_name || account.handle)
                      .replace(/^@/, "")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              {/* Network Icon Overlay Badge */}
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0C101A] shadow-xs ${getNetworkBadgeStyle(
                  account.platform
                )}`}
                title={account.platform}
              >
                {renderNetworkIcon(account.platform, "w-3 h-3")}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white">
                  {account.handle.startsWith("@")
                    ? account.handle
                    : `@${account.handle}`}
                </h1>

              

                {account.verification_status === "verified" ? (
                  <Badge color="success">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                    Verified
                  </Badge>
                ) : (
                  <Badge color="warning">
                    <Clock className="w-3 h-3 mr-0.5" />
                    {account.verification_status}
                  </Badge>
                )}
              </div>

              {account.display_name && (
                <p className="text-xs text-gray-600 dark:text-slate-300 font-sans mt-0.5">
                  {account.display_name}
                </p>
              )}

              {account.bio && (
                <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-1 max-w-xl">
                  {account.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={isPending || isSyncing}
              onClick={handleResyncStats}
              className="flex items-center gap-1.5 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isSyncing ? "animate-spin text-brand-500" : ""
                }`}
              />
              <span>{isSyncing ? "Re-syncing..." : "Re-sync Stats"}</span>
            </Button>

            <a
              href={getProfileUrl(account.platform, account.handle)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-sans text-gray-800 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {account.verification_status !== "verified" ? (
              <Button
                size="sm"
                disabled={isPending || isSyncing}
                onClick={() => handleToggleVerification("verified")}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Verified</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={isPending || isSyncing}
                onClick={() => handleToggleVerification("unverified")}
                className="text-gray-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Revoke Verification
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={isPending || isSyncing}
              onClick={handleDisconnect}
              className="text-rose-600 hover:bg-rose-50 border-rose-200 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:border-rose-500/20 text-xs"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      {/* 6 Stats Grid: Global Profile vs Campaign Engagement */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Followers (Global) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-semibold">
                Followers
              </span>
              <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              {formatFollowers(account.follower_count)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono">
              {account.follower_count?.toLocaleString() || "0"} exact
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
              Global
            </span>
          </div>
        </div>

        {/* Following (Global) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-semibold">
                Following
              </span>
              <Users className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              {formatFollowers(account.following_count)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 dark:text-slate-400 font-sans">
              Accounts followed
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Global
            </span>
          </div>
        </div>

        {/* Posts Published (Campaign Posts) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-semibold">
                Posts Published
              </span>
              <Video className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              {metrics.totalSubmissions.toLocaleString()}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 dark:text-slate-400 font-sans">
              Campaign submissions
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
              Campaigns
            </span>
          </div>
        </div>

        {/* Total Likes (Campaign Posts) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-semibold">
                Total Likes
              </span>
              <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              {formatFollowers(metrics.totalLikes)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono">
              {metrics.totalLikes.toLocaleString()} on posts
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
              Campaigns
            </span>
          </div>
        </div>

        {/* Total Comments (Campaign Posts) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-semibold">
                Comments
              </span>
              <MessageSquare className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              {formatFollowers(metrics.totalComments)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono">
              {metrics.totalComments.toLocaleString()} on posts
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
              Campaigns
            </span>
          </div>
        </div>

        {/* Total Shares (Campaign Posts) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase font-semibold">
                Shares
              </span>
              <Share2 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              {formatFollowers(metrics.totalShares)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono">
              {metrics.totalShares.toLocaleString()} on posts
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
              Campaigns
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Detail: Owner Profile & Connection Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Owner Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Account Owner (Creator)
          </h3>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-200 dark:border-slate-800">
            {account.creator.avatar_url && !ownerAvatarError ? (
              <img
                src={account.creator.avatar_url}
                alt={account.creator.full_name || "Creator"}
                referrerPolicy="no-referrer"
                onError={() => setOwnerAvatarError(true)}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-700 dark:text-slate-300 font-bold text-base select-none">
                {account.creator.full_name?.charAt(0) || "C"}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate font-display">
                {account.creator.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate">
                {account.creator.email || "No email"}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono mt-0.5">
                Creator ID: {account.creator_id.slice(0, 8)}...
              </p>
            </div>

            <Link
              href={`/admin/users/${account.creator_id}`}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-600/10 dark:border-indigo-500/20 dark:text-indigo-300 dark:hover:text-white text-xs font-semibold font-sans transition-colors"
            >
              View User
            </Link>
          </div>
        </div>

        {/* Technical Connection Details Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Technical Connection Metadata
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-200 dark:border-slate-800">
              <span className="text-gray-500 dark:text-slate-400">Platform User ID</span>
              <span className="text-gray-800 dark:text-slate-200 font-semibold">{account.platform_user_id}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-200 dark:border-slate-800">
              <span className="text-gray-500 dark:text-slate-400">Verification Method</span>
              <span className="text-gray-800 dark:text-slate-200 font-semibold">
                {account.verification_method || "oauth"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-200 dark:border-slate-800">
              <span className="text-gray-500 dark:text-slate-400">Connected Date</span>
              <span className="text-gray-800 dark:text-slate-200 font-semibold">
                {new Date(account.connected_at).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-200 dark:border-slate-800">
              <span className="text-gray-500 dark:text-slate-400">Last Scraper Sync</span>
              <span className="text-gray-800 dark:text-slate-200 font-semibold">
                {account.last_synced_at
                  ? new Date(account.last_synced_at).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Campaign Submissions Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
              Associated Campaign Submissions ({submissions.length})
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
              Video submissions posted through this creator channel.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-gray-500 dark:text-slate-400">
              Total Views: <b className="text-gray-900 dark:text-white">{metrics.totalViewsGenerated.toLocaleString()}</b>
            </span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <span className="text-gray-500 dark:text-slate-400">
              Total Payout: <b className="text-emerald-600 dark:text-emerald-400">₦{metrics.totalPayoutEarned.toLocaleString()}</b>
            </span>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-slate-500 rounded-xl bg-gray-50 dark:bg-[#080B14] border border-gray-200 dark:border-slate-800/60">
            <p className="text-xs font-semibold">No campaign submissions yet</p>
            <p className="text-[11px] mt-0.5">This channel has not submitted video links for any active briefs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
            <Table className="text-left text-xs">
              <TableHeader className="bg-gray-50 dark:bg-[#080B14] border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-mono text-[11px] uppercase">
                <TableRow>
                  <TableCell isHeader className="py-3 px-4 font-semibold">Campaign</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold">Status</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-right">Views</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-right">Likes</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-right">Comments</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-right">Shares</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-right">Payout Earned</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold">Post URL</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold">Submitted</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-sans">
                {submissions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-900/40">
                    <TableCell className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {sub.campaign?.title || "Campaign Brief"}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge color="light">{sub.status}</Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                      {sub.final_view_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right font-mono text-gray-700 dark:text-slate-300">
                      {sub.likes_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right font-mono text-gray-700 dark:text-slate-300">
                      {sub.comments_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right font-mono text-gray-700 dark:text-slate-300">
                      {sub.shares_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₦{sub.payout_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {sub.post_url ? (
                        <a
                          href={sub.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-[11px]"
                        >
                          <span>View Post</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-600">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-gray-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
