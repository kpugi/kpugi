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
} from "lucide-react";
import Button from "@/components/admin/components/ui/button/Button";
import {
  SocialAccountDetailResponse,
  updateSocialAccountVerificationAction,
  disconnectSocialAccountAction,
} from "@/app/actions/admin-accounts";

interface AccountDetailViewProps {
  initialData: SocialAccountDetailResponse;
}

export default function AccountDetailView({
  initialData,
}: AccountDetailViewProps) {
  const [data, setData] = useState<SocialAccountDetailResponse>(initialData);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const account = data.account;
  const submissions = data.submissions;
  const metrics = data.metrics;

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

  const handleToggleVerification = (
    newStatus: "verified" | "unverified" | "pending"
  ) => {
    startTransition(async () => {
      try {
        await updateSocialAccountVerificationAction(account.id, newStatus);
        setData((prev) => ({
          ...prev,
          account: {
            ...prev.account,
            verification_status: newStatus,
            verified_at:
              newStatus === "verified"
                ? new Date().toISOString()
                : null,
          },
        }));
        setFeedback({
          type: "success",
          message: `Account status updated to ${newStatus}.`,
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
        `Are you sure you want to disconnect @${account.handle}? The creator will need to reconnect it to participate in briefs.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await disconnectSocialAccountAction(account.id);
        setData((prev) => ({
          ...prev,
          account: {
            ...prev.account,
            verification_status: "unverified",
          },
        }));
        setFeedback({
          type: "success",
          message: "Social media account disconnected.",
        });
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "Failed to disconnect account.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/accounts"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
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
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xl flex-shrink-0">
              <Share2 className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold font-display text-white">
                  {account.handle.startsWith("@")
                    ? account.handle
                    : `@${account.handle}`}
                </h1>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase bg-slate-800 text-slate-300">
                  {account.platform}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    account.verification_status === "verified"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {account.verification_status}
                </span>
              </div>

              {account.display_name && (
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  {account.display_name}
                </p>
              )}

              {account.bio && (
                <p className="text-xs text-slate-400 font-sans mt-1 max-w-xl">
                  {account.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={getProfileUrl(account.platform, account.handle)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-sans text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <span>Visit Social Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {account.verification_status !== "verified" ? (
              <Button
                size="sm"
                disabled={isPending}
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
                disabled={isPending}
                onClick={() => handleToggleVerification("unverified")}
                className="text-slate-400 hover:text-rose-400 text-xs"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Revoke Verification
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={handleDisconnect}
              className="text-rose-400 hover:bg-rose-500/10 border-rose-500/20 text-xs"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Followers
            </span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-display">
            {formatFollowers(account.follower_count)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {account.follower_count?.toLocaleString() || "0"} exact
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Following
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-display">
            {formatFollowers(account.following_count)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Accounts followed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Total Likes
            </span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white font-display">
            {formatFollowers(account.likes_count)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Profile post likes
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Videos Posted
            </span>
            <Video className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-display">
            {account.video_count?.toLocaleString() || "0"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Published clips
          </p>
        </div>
      </div>

      {/* Two Column Detail: Owner Profile & Connection Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Owner Card */}
        <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Account Owner (Creator)
          </h3>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#080B14] border border-slate-800">
            {account.creator.avatar_url ? (
              <img
                src={account.creator.avatar_url}
                alt={account.creator.full_name || "Creator"}
                className="w-12 h-12 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-base">
                {account.creator.full_name?.charAt(0) || "C"}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate font-display">
                {account.creator.full_name}
              </p>
              <p className="text-xs text-slate-400 font-mono truncate">
                {account.creator.email || "No email"}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Creator ID: {account.creator_id.slice(0, 8)}...
              </p>
            </div>

            <Link
              href={`/admin/users/${account.creator_id}`}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 hover:text-white text-xs font-semibold font-sans transition-colors"
            >
              View User
            </Link>
          </div>
        </div>

        {/* Technical Connection Details Card */}
        <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Technical Connection Metadata
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B14] border border-slate-800">
              <span className="text-slate-400">Platform User ID</span>
              <span className="text-slate-200">{account.platform_user_id}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B14] border border-slate-800">
              <span className="text-slate-400">Verification Method</span>
              <span className="text-slate-200">
                {account.verification_method || "oauth"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B14] border border-slate-800">
              <span className="text-slate-400">Connected Date</span>
              <span className="text-slate-200">
                {new Date(account.connected_at).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B14] border border-slate-800">
              <span className="text-slate-400">Last Scraper Sync</span>
              <span className="text-slate-200">
                {account.last_synced_at
                  ? new Date(account.last_synced_at).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Campaign Submissions Table */}
      <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-display text-white">
              Associated Campaign Submissions ({submissions.length})
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Video submissions posted through this creator channel.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">
              Total Views: <b className="text-white">{metrics.totalViewsGenerated.toLocaleString()}</b>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              Total Payout: <b className="text-emerald-400">₦{metrics.totalPayoutEarned.toLocaleString()}</b>
            </span>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 rounded-xl bg-[#080B14] border border-slate-800/60">
            <p className="text-xs font-semibold">No campaign submissions yet</p>
            <p className="text-[11px] mt-0.5">This channel has not submitted video links for any active briefs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080B14] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4 font-semibold">Campaign</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Verified Views</th>
                  <th className="py-3 px-4 font-semibold text-right">Payout Earned</th>
                  <th className="py-3 px-4 font-semibold">Post URL</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-white">
                      {sub.campaign?.title || "Campaign Brief"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {sub.final_view_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      ₦{sub.payout_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {sub.post_url ? (
                        <a
                          href={sub.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-white font-mono text-[11px]"
                        >
                          <span>View Post</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
