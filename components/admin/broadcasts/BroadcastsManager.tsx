"use client";

import React, { useState, useTransition } from "react";
import {
  Radio,
  Send,
  Plus,
  Monitor,
  Bell,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Users,
  Eye,
  MousePointer,
  Sparkles,
  Layers,
  Tag,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import Button from "@/components/admin/components/ui/button/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/admin/components/ui/table";
import {
  BroadcastItem,
  BroadcastTag,
  TargetAudience,
  BroadcastChannel,
  CtaStyle,
  TAG_METADATA,
} from "@/lib/admin/platform-broadcasts-types";
import {
  BroadcastsSummary,
  createBroadcastAction,
  updateBroadcastStatusAction,
  deleteBroadcastAction,
  dispatchBroadcastAction,
} from "@/app/actions/admin-broadcasts";
import LiveBroadcastPreview from "./LiveBroadcastPreview";

interface BroadcastsManagerProps {
  initialData: BroadcastsSummary;
}

export default function BroadcastsManager({
  initialData,
}: BroadcastsManagerProps) {
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>(
    initialData.broadcasts
  );
  const [metrics, setMetrics] = useState(initialData.metrics);

  // Form States for Composer
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState<BroadcastTag>("update");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("all");
  const [channels, setChannels] = useState<BroadcastChannel[]>([
    "dashboard_banner",
  ]);
  const [hasCta, setHasCta] = useState(false);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaStyle, setCtaStyle] = useState<CtaStyle>("primary");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailPreviewText, setEmailPreviewText] = useState("");

  // Feedback banner state
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Transitions
  const [isPending, startTransition] = useTransition();

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  // Toggle channel selection
  const handleToggleChannel = (ch: BroadcastChannel) => {
    setChannels((prev) => {
      if (prev.includes(ch)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== ch);
      } else {
        return [...prev, ch];
      }
    });
  };

  // Reset form
  const handleResetForm = () => {
    setTitle("");
    setMessage("");
    setTag("update");
    setTargetAudience("all");
    setChannels(["dashboard_banner"]);
    setHasCta(false);
    setCtaLabel("");
    setCtaUrl("");
    setCtaStyle("primary");
    setEmailSubject("");
    setEmailPreviewText("");
  };

  // Submit Handler
  const handlePublish = (status: "active" | "draft") => {
    if (!title.trim() || !message.trim()) {
      showToast("error", "Please provide both a title and message body.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createBroadcastAction({
          title: title.trim(),
          message: message.trim(),
          tag,
          target_audience: targetAudience,
          channels,
          has_cta: hasCta,
          cta_label: hasCta ? ctaLabel.trim() || "Learn More" : null,
          cta_url: hasCta ? ctaUrl.trim() || "/c/dashboard" : null,
          cta_style: ctaStyle,
          status,
          email_subject: emailSubject.trim() || title.trim(),
          email_preview_text: emailPreviewText.trim() || message.trim().slice(0, 100),
        });

        setBroadcasts((prev) => [res.broadcast, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          activeCount: status === "active" ? prev.activeCount + 1 : prev.activeCount,
          totalDispatched:
            prev.totalDispatched + (res.dispatchResult ? 1 : 0),
        }));

        handleResetForm();
        setActiveTab("history");
        showToast(
          "success",
          status === "active"
            ? "Broadcast published and activated successfully!"
            : "Broadcast saved as draft."
        );
      } catch (err: any) {
        showToast("error", err?.message || "Failed to publish broadcast.");
      }
    });
  };

  // Status Toggle
  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";

    startTransition(async () => {
      try {
        await updateBroadcastStatusAction(id, newStatus);
        setBroadcasts((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        setMetrics((prev) => ({
          ...prev,
          activeCount:
            newStatus === "active"
              ? prev.activeCount + 1
              : Math.max(0, prev.activeCount - 1),
        }));
        showToast("success", `Broadcast is now ${newStatus}.`);
      } catch (err: any) {
        showToast("error", err?.message || "Failed to update status.");
      }
    });
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this broadcast?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteBroadcastAction(id);
        setBroadcasts((prev) => prev.filter((b) => b.id !== id));
        showToast("success", "Broadcast deleted successfully.");
      } catch (err: any) {
        showToast("error", err?.message || "Failed to delete broadcast.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight">
              Broadcasts & Announcements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {metrics.activeCount} Active Banners
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-1">
            Dispatch announcements, platform updates, and alerts across user dashboard banners, in-app notification feeds, and email inboxes.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-1 bg-[#0C101A] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans transition-colors ${
              activeTab === "compose"
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Compose New</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans transition-colors ${
              activeTab === "history"
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcast Registry ({broadcasts.length})</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-sans transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Active Banners
            </span>
            <Monitor className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {metrics.activeCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Currently live on dashboards
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Dispatched Broadcasts
            </span>
            <Send className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {broadcasts.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Total announcement campaigns
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Audience Reach
            </span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {metrics.totalAudienceReach.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Registered creators & brands
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">
              Total CTA Clicks
            </span>
            <MousePointer className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {metrics.totalClicks.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Audience interactions recorded
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: COMPOSER WITH LIVE MULTI-CHANNEL PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Target Audience & Channels */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                1. Target Audience & Delivery Channels
              </h3>

              {/* Audience Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "All Users" },
                    { id: "creators", label: "Creators Only" },
                    { id: "brands", label: "Brands Only" },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setTargetAudience(aud.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-sans text-center transition-all ${
                        targetAudience === aud.id
                          ? "bg-indigo-600 text-white font-semibold shadow-xs"
                          : "bg-gray-50 dark:bg-[#080B14] text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-800"
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channels Multi-Select */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block">
                  Delivery Channels (Select multiple)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "dashboard_banner",
                      label: "Dashboard Banner",
                      desc: "User dashboard alert",
                      icon: <Monitor className="w-4 h-4 text-emerald-400" />,
                    },
                    {
                      id: "in_app",
                      label: "In-App Notification",
                      desc: "Knock bell stream",
                      icon: <Bell className="w-4 h-4 text-amber-400" />,
                    },
                    {
                      id: "email",
                      label: "Email Broadcast",
                      desc: "Resend HTML delivery",
                      icon: <Mail className="w-4 h-4 text-purple-400" />,
                    },
                  ].map((ch) => {
                    const isSelected = channels.includes(ch.id as any);
                    return (
                      <div
                        key={ch.id}
                        onClick={() => handleToggleChannel(ch.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                            : "bg-gray-50 dark:bg-[#080B14] border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="mt-0.5">{ch.icon}</div>
                        <div>
                          <p className="font-semibold text-xs text-slate-200">
                            {ch.label}
                          </p>
                          <p className="text-[10px] text-slate-500">{ch.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Purpose Tag Taxonomy */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-3">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                2. Purpose Tag
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-sans">
                Classifies the announcement style, color badge, and priority.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(Object.keys(TAG_METADATA) as BroadcastTag[]).map((tagKey) => {
                  const item = TAG_METADATA[tagKey];
                  const isSelected = tag === tagKey;
                  return (
                    <button
                      key={tagKey}
                      type="button"
                      onClick={() => setTag(tagKey)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all border ${
                        isSelected
                          ? `${item.badgeClass} ring-2 ring-indigo-500/30 font-semibold`
                          : "bg-[#080B14] border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Message Content */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                3. Announcement Content
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                    Headline / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Instant Payout Settlements Are Now Live!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080B14] border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Explain what has changed, any action required from the user, or details about the update..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080B14] border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Optional Email Subject & Preview Text if email is selected */}
                {channels.includes("email") && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-3">
                    <span className="text-[11px] font-mono text-purple-400 uppercase font-semibold">
                      Email Dispatch Details
                    </span>

                    <div>
                      <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                        Email Subject Line
                      </label>
                      <input
                        type="text"
                        placeholder="Leave blank to use announcement headline"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-[#080B14] border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                        Inbox Preview Snippet
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Withdraw your campaign earnings directly to your bank account with zero delay."
                        value={emailPreviewText}
                        onChange={(e) => setEmailPreviewText(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-[#080B14] border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Call to Action (CTA) Builder */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white">
                    4. Call to Action (CTA) Button
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                    Attach an interactive button directing users to an internal route or external link.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setHasCta(!hasCta)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    hasCta ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      hasCta ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {hasCta && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. View Wallet & Payouts"
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#080B14] border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                      Target Link / URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /wallet or https://..."
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#080B14] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-700 dark:text-slate-300 font-sans block mb-1">
                      Button Visual Style
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { id: "primary", label: "Primary Indigo" },
                        { id: "success", label: "Emerald Success" },
                        { id: "outline", label: "Dark Outline" },
                      ].map((styleOption) => (
                        <button
                          key={styleOption.id}
                          type="button"
                          onClick={() => setCtaStyle(styleOption.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors ${
                            ctaStyle === styleOption.id
                              ? "bg-slate-700 text-white font-semibold border border-slate-500"
                              : "bg-[#080B14] text-slate-400 border border-slate-800 hover:text-white"
                          }`}
                        >
                          {styleOption.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer Bar */}
            <div className="p-4 rounded-xl bg-[#0A0E1A] border border-slate-800/80 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetForm}
                className="text-xs text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Clear Form
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handlePublish("draft")}
                  className="text-xs font-sans"
                >
                  Save as Draft
                </Button>

                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handlePublish("active")}
                  className="flex items-center gap-1.5 text-xs font-sans bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isPending ? "Dispatching..." : "Publish & Dispatch"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Multi-Channel Preview (5 cols) */}
          <div className="lg:col-span-5 sticky top-6 self-start">
            <LiveBroadcastPreview
              title={title}
              message={message}
              tag={tag}
              targetAudience={targetAudience}
              channels={channels}
              hasCta={hasCta}
              ctaLabel={ctaLabel}
              ctaUrl={ctaUrl}
              ctaStyle={ctaStyle}
              emailSubject={emailSubject}
              emailPreviewText={emailPreviewText}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: BROADCAST REGISTRY & ACTIVE BANNERS TABLE */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="rounded-2xl bg-white dark:bg-[#0C101A] border border-gray-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-none">
          <div className="overflow-x-auto">
            <Table className="text-left text-xs font-sans">
              <TableHeader className="bg-gray-50 dark:bg-[#080B14] border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-mono text-[11px] uppercase">
                <TableRow>
                  <TableCell isHeader className="py-3.5 px-4 font-semibold">Purpose Tag</TableCell>
                  <TableCell isHeader className="py-3.5 px-4 font-semibold">Title & Announcement</TableCell>
                  <TableCell isHeader className="py-3.5 px-4 font-semibold">Target</TableCell>
                  <TableCell isHeader className="py-3.5 px-4 font-semibold">Channels</TableCell>
                  <TableCell isHeader className="py-3.5 px-4 font-semibold">Status</TableCell>
                  <TableCell isHeader className="py-3.5 px-4 font-semibold text-right">Reach / Clicks</TableCell>
                  <TableCell isHeader className="py-3.5 px-4 font-semibold">Created</TableCell>
                  <TableCell isHeader className="py-3.5 px-4 font-semibold text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-sans">
                {broadcasts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-slate-500">
                      <p className="text-sm font-semibold">No announcements dispatched yet</p>
                      <p className="text-xs mt-1">Click &quot;Compose New&quot; to publish your first platform broadcast.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  broadcasts.map((b) => {
                    const tagInfo = TAG_METADATA[b.tag] || TAG_METADATA.update;

                    return (
                      <TableRow
                        key={b.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        {/* Tag */}
                        <TableCell className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${tagInfo.badgeClass}`}
                          >
                            <span>{tagInfo.emoji}</span>
                            <span>{tagInfo.label}</span>
                          </span>
                        </TableCell>

                        {/* Title & Message */}
                        <TableCell className="py-3.5 px-4 max-w-sm">
                          <p className="font-bold text-gray-900 dark:text-white text-xs font-display truncate">
                            {b.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                            {b.message}
                          </p>
                          {b.has_cta && b.cta_label && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 mt-1">
                              <span>CTA: {b.cta_label}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </TableCell>

                        {/* Target Audience */}
                        <TableCell className="py-3.5 px-4 font-mono text-xs uppercase text-slate-300">
                          {b.target_audience === "all"
                            ? "All Users"
                            : b.target_audience === "creators"
                            ? "Creators"
                            : "Brands"}
                        </TableCell>

                        {/* Channels */}
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {b.channels.includes("dashboard_banner") && (
                              <span
                                title="Dashboard Banner"
                                className="p-1 rounded bg-slate-800 text-emerald-400"
                              >
                                <Monitor className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {b.channels.includes("in_app") && (
                              <span
                                title="Knock In-App Feed"
                                className="p-1 rounded bg-slate-800 text-amber-400"
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {b.channels.includes("email") && (
                              <span
                                title="Resend Email"
                                className="p-1 rounded bg-slate-800 text-purple-400"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              b.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : b.status === "paused"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {b.status}
                          </span>
                        </TableCell>

                        {/* Reach & Clicks */}
                        <TableCell className="py-3.5 px-4 text-right font-mono">
                          <span className="text-white font-bold text-xs">
                            {b.sent_count.toLocaleString()} sent
                          </span>
                          <p className="text-[10px] text-slate-500">
                            {b.click_count} clicks
                          </p>
                        </TableCell>

                        {/* Created At */}
                        <TableCell className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {new Date(b.created_at).toLocaleDateString()}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(b.id, b.status)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                b.status === "active"
                                  ? "text-amber-400 hover:bg-amber-500/10"
                                  : "text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                              title={
                                b.status === "active"
                                  ? "Pause broadcast"
                                  : "Activate broadcast"
                              }
                            >
                              {b.status === "active" ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(b.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete broadcast"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          <div className="p-3.5 bg-gray-50 dark:bg-[#080B14] border-t border-gray-200 dark:border-slate-800 text-[11px] font-mono text-gray-500 dark:text-slate-500 flex items-center justify-between">
            <span>Showing {broadcasts.length} platform announcements</span>
            <span>Multi-Channel Dispatch Engine</span>
          </div>
        </div>
      )}
    </div>
  );
}
