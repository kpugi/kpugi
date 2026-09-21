"use client";

import React from "react";
import Link from "next/link";
import { Shield, Terminal, Clock, ExternalLink } from "lucide-react";

export interface AdminAuditItem {
  id: string;
  action: string;
  target_table?: string;
  target_id?: string;
  details?: string;
  payload?: any;
  created_at: string;
  profiles?:
    | {
        full_name?: string;
        role?: string;
      }
    | {
        full_name?: string;
        role?: string;
      }[]
    | null;
}

interface AdminAuditStreamProps {
  logs?: AdminAuditItem[];
}

const fallbackAdminLogs: AdminAuditItem[] = [
  {
    id: "log-1",
    action: "pin_hero_campaign",
    target_table: "campaigns",
    target_id: "cmp-chowdeck-01",
    details: "Pinned Chowdeck Midnight Fast Delivery as Hero spotlight",
    payload: { title: "Chowdeck Midnight Fast Delivery" },
    created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    profiles: { full_name: "Tuazor CyberKeed", role: "admin" },
  },
  {
    id: "log-2",
    action: "auto_settlement_reconciled",
    target_table: "wallets",
    target_id: "wal-escrow-main",
    details: "Automated daily batch settlement: 14 creator escrow balances released",
    payload: { settled_count: 14, net_disbursed: 829912 },
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    profiles: null,
  },
  {
    id: "log-3",
    action: "manual_submission_override",
    target_table: "submissions",
    target_id: "sub-7b19c-e2",
    details: "Operator manual pass override after video link resolution",
    payload: { status: "verified_pass" },
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    profiles: { full_name: "Tuazor CyberKeed", role: "admin" },
  },
  {
    id: "log-4",
    action: "rbac_role_granted",
    target_table: "profiles",
    target_id: "usr-4982a",
    details: "Admin clearance and audit role granted to Tuazor CyberKeed",
    payload: { role: "admin", clearance: "level-1" },
    created_at: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
    profiles: { full_name: "Tuazor CyberKeed", role: "admin" },
  },
];

export default function AdminAuditStream({ logs }: AdminAuditStreamProps) {
  const data = logs && logs.length > 0 ? logs : fallbackAdminLogs;

  const formatTimeAgo = (dateString: string) => {
    const ms = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(ms / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatActionTitle = (action: string, payload?: any, details?: string) => {
    switch (action) {
      case "pin_hero_campaign":
        return `Hero Pin: ${payload?.title || "Campaign"}`;
      case "unpin_hero_campaign":
        return "Hero Pin Removed";
      case "feature_campaign_toggle":
      case "feature_campaign":
        return "Featured Campaign Enabled";
      case "auto_settlement_reconciled":
        return "Daily Settlement Auto-Reconciled";
      case "manual_submission_override":
      case "manual_submission_verified":
        return "Manual Verification Override";
      case "submission_flagged":
        return "Submission Flagged for Review";
      case "rbac_role_granted":
        return "RBAC Clearance Role Granted";
      case "user_suspended":
        return "User Suspended";
      case "user_unsuspended":
        return "User Clearance Restored";
      default:
        return details || action.replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  return (
    <div className="relative rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
            Live Audit Stream
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Immutable log of recent operator overrides &amp; clearances
          </p>
        </div>

        <Link
          href="/admin/audit"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          All Logs
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {data.slice(0, 4).map((log) => {
          const isSystem = log.action === "auto_settlement_reconciled" || !log.profiles;
          const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
          const actorName = isSystem ? "System" : profile?.full_name || "Admin";

          return (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isSystem
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-brand-50 text-brand-500 dark:bg-brand-950/40 dark:text-brand-400"
                  }`}
                >
                  {isSystem ? <Terminal className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {formatActionTitle(log.action, log.payload, log.details)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 font-mono">
                    <span className="capitalize text-gray-600 dark:text-gray-300 font-medium">
                      {actorName}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[130px]">
                      {log.target_table ? `${log.target_table} #${String(log.target_id || "").slice(0, 6)}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 shrink-0 flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formatTimeAgo(log.created_at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
