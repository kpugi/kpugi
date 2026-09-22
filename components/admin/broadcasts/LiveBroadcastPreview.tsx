"use client";

import React, { useState } from "react";
import {
  Monitor,
  Bell,
  Mail,
  ExternalLink,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Eye,
} from "lucide-react";
import {
  BroadcastTag,
  TargetAudience,
  BroadcastChannel,
  CtaStyle,
  TAG_METADATA,
} from "@/lib/admin/platform-broadcasts-types";

interface LiveBroadcastPreviewProps {
  title: string;
  message: string;
  tag: BroadcastTag;
  targetAudience: TargetAudience;
  channels: BroadcastChannel[];
  hasCta: boolean;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaStyle: CtaStyle;
  emailSubject?: string | null;
  emailPreviewText?: string | null;
}

export default function LiveBroadcastPreview({
  title,
  message,
  tag,
  targetAudience,
  channels,
  hasCta,
  ctaLabel,
  ctaUrl,
  ctaStyle,
  emailSubject,
  emailPreviewText,
}: LiveBroadcastPreviewProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<"banner" | "in_app" | "email">("banner");

  const tagInfo = TAG_METADATA[tag] || TAG_METADATA.update;
  const displayTitle = title.trim() || "Announcement Title Preview";
  const displayMessage =
    message.trim() ||
    "This is a live preview of how your announcement message will appear across your selected dispatch channels.";
  const displayCtaLabel = ctaLabel?.trim() || "Learn More";
  const displaySubject = emailSubject?.trim() || `📢 ${displayTitle}`;

  // CTA button styling for preview
  const getCtaButtonClasses = () => {
    switch (ctaStyle) {
      case "success":
        return "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs";
      case "outline":
        return "bg-transparent border border-slate-600 hover:border-slate-400 text-white";
      default:
        return "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs";
    }
  };

  return (
    <div className="rounded-2xl bg-[#0C101A] border border-slate-800/80 overflow-hidden flex flex-col h-full">
      {/* Preview Header & Channel Switcher */}
      <div className="p-4 bg-[#080B14] border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold font-display text-white">
            Live Channel Preview
          </span>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center gap-1 bg-[#0C101A] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActivePreviewTab("banner")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans transition-colors ${
              activePreviewTab === "banner"
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Dashboard Banner</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePreviewTab("in_app")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans transition-colors ${
              activePreviewTab === "in_app"
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bell className="w-3 h-3" />
            <span>In-App Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePreviewTab("email")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans transition-colors ${
              activePreviewTab === "email"
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="w-3 h-3" />
            <span>Email Client</span>
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="p-6 flex-1 flex flex-col justify-center bg-radial from-[#0e1424] to-[#080B14]">
        {/* ============================================================== */}
        {/* 1. DASHBOARD BANNER PREVIEW */}
        {/* ============================================================== */}
        {activePreviewTab === "banner" && (
          <div className="space-y-3 max-w-xl mx-auto w-full">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
              <span>Preview on User Dashboard (/c/dashboard or /b/dashboard)</span>
              <span className="capitalize">{targetAudience} Audience</span>
            </div>

            {/* The Actual Banner Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl bg-[#0E1528] border ${tagInfo.borderClass} shadow-xl relative overflow-hidden transition-all`}
            >
              {/* Top Row: Tag Badge & Dismiss Button */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${tagInfo.badgeClass}`}
                  >
                    <span>{tagInfo.emoji}</span>
                    <span>{tagInfo.label}</span>
                  </span>

                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded">
                    {targetAudience === "all"
                      ? "All Users"
                      : targetAudience === "creators"
                      ? "Creators"
                      : "Advertisers"}
                  </span>
                </div>

                <button
                  type="button"
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                  title="Dismiss banner preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Body Text */}
              <div className="space-y-1.5">
                <h4 className="text-sm sm:text-base font-bold font-display text-white tracking-tight">
                  {displayTitle}
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {displayMessage}
                </p>
              </div>

              {/* CTA Action Button */}
              {hasCta && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${getCtaButtonClasses()}`}
                  >
                    <span>{displayCtaLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {ctaUrl && (
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                      {ctaUrl}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. IN-APP FEED NOTIFICATION PREVIEW (KNOCK STREAM) */}
        {/* ============================================================== */}
        {activePreviewTab === "in_app" && (
          <div className="space-y-3 max-w-md mx-auto w-full">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
              <span>In-App Notification Feed (Knock Bell Dropdown)</span>
              <span>Unread</span>
            </div>

            {/* Notification Center Popup Mockup */}
            <div className="rounded-2xl bg-[#0E1528] border border-slate-700/80 shadow-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                {/* Notification Avatar / Icon */}
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {tagInfo.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white font-display truncate">
                      {displayTitle}
                    </p>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  </div>

                  <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                    {displayMessage}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      Just now • Kpugi Announcements
                    </span>

                    {hasCta && (
                      <span className="text-[11px] font-sans font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        <span>{displayCtaLabel}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. EMAIL INBOX CLIENT PREVIEW (RESEND TEMPLATE) */}
        {/* ============================================================== */}
        {activePreviewTab === "email" && (
          <div className="space-y-3 max-w-xl mx-auto w-full">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
              <span>Email Client Preview (Resend HTML Delivery)</span>
              <span>Responsive HTML</span>
            </div>

            {/* Email Client Window Frame */}
            <div className="rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-2xl overflow-hidden text-xs">
              {/* Email Envelope Header */}
              <div className="p-3.5 bg-slate-100 border-b border-slate-200 font-sans space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>From: Kpugi Platform &lt;notifications@kpugi.com&gt;</span>
                  <span>Today, 10:45 AM</span>
                </div>
                <p className="font-bold text-sm text-slate-900 font-display">
                  {displaySubject}
                </p>
                {emailPreviewText && (
                  <p className="text-[11px] text-slate-500 font-sans truncate">
                    {emailPreviewText}
                  </p>
                )}
              </div>

              {/* Email Body Card */}
              <div className="p-6 bg-slate-50 space-y-5">
                {/* Brand Logo */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    K
                  </div>
                  <span className="font-bold font-display text-slate-900 text-sm">
                    Kpugi
                  </span>
                </div>

                {/* Main Card */}
                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{tagInfo.emoji}</span>
                    <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {tagInfo.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-display text-slate-900">
                    {displayTitle}
                  </h3>

                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {displayMessage}
                  </p>

                  {hasCta && (
                    <div className="pt-2">
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-sans font-semibold text-center hover:bg-indigo-500 shadow-xs"
                      >
                        {displayCtaLabel}
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer Disclaimer */}
                <div className="text-[10px] text-slate-400 font-sans text-center space-y-0.5">
                  <p>You received this announcement because you are a registered user on Kpugi.</p>
                  <p>© {new Date().getFullYear()} Kpugi Inc. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#080B14] border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span>Selected channels: {channels.join(", ")}</span>
        <span>Target: {targetAudience}</span>
      </div>
    </div>
  );
}
