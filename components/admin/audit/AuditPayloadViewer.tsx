"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutGrid,
  Code2,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  Eye,
  Users,
  CheckCircle2,
  AlertCircle,
  Share2,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
  Building2,
  FileText,
  User,
  Database,
  Shield,
  Search,
  Key,
} from "lucide-react";

interface AuditPayloadViewerProps {
  payload: Record<string, any>;
  action: string;
  category?: string;
  details?: string;
  rawEvent?: any;
}

interface DataPointItem {
  section: "system" | "actor" | "target" | "payload";
  path: string;
  label: string;
  type: string;
  value: any;
}

export default function AuditPayloadViewer({
  payload = {},
  action,
  category,
  details,
  rawEvent = {},
}: AuditPayloadViewerProps) {
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [jsonScope, setJsonScope] = useState<"payload" | "full">("full");
  const [filterQuery, setFilterQuery] = useState("");
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>("all");

  const handleCopy = (text: string, keyName: string = "all") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Detect state transition / diff in payload
  const hasDiff =
    (payload.before !== undefined && payload.after !== undefined) ||
    (payload.previous !== undefined && payload.current !== undefined);

  const prevVal = payload.before !== undefined ? payload.before : payload.previous;
  const currVal = payload.after !== undefined ? payload.after : payload.current;

  // Highlights
  const financialAmount =
    payload.amount ??
    payload.total_budget ??
    payload.budget ??
    payload.payout ??
    payload.net_disbursed ??
    payload.fee_charged;

  const countMetric = payload.views ?? payload.followers ?? payload.settled_count;
  const countLabel =
    payload.views !== undefined
      ? "Audited Views"
      : payload.followers !== undefined
      ? "Followers"
      : payload.settled_count !== undefined
      ? "Settled Creators"
      : "Count";

  const campaignTitle = payload.campaign_title || payload.title;
  const socialPlatform = payload.platform;
  const socialHandle = payload.handle;
  const postUrl = payload.post_url;

  // Build the complete array of ALL JSON data points across the entire event
  const allDataPoints: DataPointItem[] = useMemo(() => {
    const items: DataPointItem[] = [
      // 1. System & Ledger Envelope
      {
        section: "system",
        path: "id",
        label: "Event Record UUID",
        type: "uuid",
        value: rawEvent?.id || "—",
      },
      {
        section: "system",
        path: "action",
        label: "Event Action Type",
        type: "string",
        value: rawEvent?.action || action,
      },
      {
        section: "system",
        path: "category",
        label: "Action Category",
        type: "string",
        value: rawEvent?.category || category || "general",
      },
      {
        section: "system",
        path: "ledger_partition",
        label: "Database Ledger Partition",
        type: "string",
        value: rawEvent?.ledger_partition || "audit_log",
      },
      {
        section: "system",
        path: "timestamp",
        label: "Exact UTC Timestamp",
        type: "datetime",
        value: rawEvent?.timestamp || new Date().toISOString(),
      },
      {
        section: "system",
        path: "ip_address",
        label: "Origin IP / Gateway",
        type: "string",
        value: rawEvent?.ip_address || "Internal Origin",
      },

      // 2. Actor & Identity Origin
      {
        section: "actor",
        path: "actor.name",
        label: "Actor Full Name",
        type: "string",
        value: rawEvent?.actor?.name || "Platform User",
      },
      {
        section: "actor",
        path: "actor.email",
        label: "Actor Email",
        type: "string",
        value: rawEvent?.actor?.email || "—",
      },
      {
        section: "actor",
        path: "actor.role",
        label: "Actor Platform Role",
        type: "role",
        value: rawEvent?.actor?.role || "user",
      },
      {
        section: "actor",
        path: "actor.id",
        label: "Actor Profile UUID",
        type: "uuid",
        value: rawEvent?.actor?.id || "—",
      },

      // 3. Target Entity Scope
      {
        section: "target",
        path: "target.table",
        label: "Target Database Table",
        type: "string",
        value: rawEvent?.target?.table || "platform_global",
      },
      {
        section: "target",
        path: "target.id",
        label: "Target Entity Record ID",
        type: "uuid",
        value: rawEvent?.target?.id || "—",
      },
      {
        section: "target",
        path: "details",
        label: "Action Narrative Summary",
        type: "string",
        value: rawEvent?.details || details || "Action recorded in platform ledger",
      },
    ];

    // 4. Payload & Parameters (All custom fields)
    Object.entries(payload).forEach(([k, v]) => {
      let valType: string = typeof v;
      if (v === null || v === undefined) valType = "null";
      else if (typeof v === "number") {
        if (
          k.includes("amount") ||
          k.includes("budget") ||
          k.includes("payout") ||
          k.includes("fee") ||
          k.includes("disbursed") ||
          k.includes("cpm")
        ) {
          valType = "currency";
        }
      } else if (typeof v === "string" && (v.startsWith("http://") || v.startsWith("https://"))) {
        valType = "url";
      }

      items.push({
        section: "payload",
        path: `payload.${k}`,
        label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        type: valType,
        value: v,
      });
    });

    return items;
  }, [rawEvent, payload, action, category, details]);

  // Filtered data points
  const filteredDataPoints = useMemo(() => {
    return allDataPoints.filter((item) => {
      if (activeSectionFilter !== "all" && item.section !== activeSectionFilter) {
        return false;
      }
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q) ||
        String(item.value).toLowerCase().includes(q)
      );
    });
  }, [allDataPoints, activeSectionFilter, filterQuery]);

  const renderValueVisual = (item: DataPointItem) => {
    const val = item.value;

    if (val === null || val === undefined || val === "—") {
      return <span className="text-gray-400 dark:text-gray-500 italic">None</span>;
    }

    if (item.type === "uuid") {
      return (
        <div className="flex items-center gap-1.5 font-mono text-xs text-gray-800 dark:text-gray-200">
          <span className="truncate max-w-[220px]">{String(val)}</span>
          <button
            onClick={() => handleCopy(String(val), item.path)}
            className="p-1 rounded text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
            title="Copy UUID"
          >
            {copiedKey === item.path ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      );
    }

    if (item.type === "role") {
      const r = String(val).toLowerCase();
      return (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            r === "creator"
              ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
              : r === "advertiser" || r === "brand"
              ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
              : r === "admin"
              ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          }`}
        >
          {String(val)}
        </span>
      );
    }

    if (item.type === "currency") {
      return (
        <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
          ₦{Number(val).toLocaleString()}
        </span>
      );
    }

    if (typeof val === "boolean") {
      return (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            val
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {val ? "True / Enabled" : "False / Disabled"}
        </span>
      );
    }

    if (item.type === "url") {
      return (
        <a
          href={String(val)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline break-all font-mono text-xs"
        >
          <span className="truncate max-w-[280px]">{String(val)}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
    }

    if (item.type === "datetime") {
      const d = new Date(val);
      return (
        <div className="text-right sm:text-left">
          <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 block">
            {d.toLocaleString()}
          </span>
          <span className="font-mono text-[10px] text-gray-400">
            {String(val)}
          </span>
        </div>
      );
    }

    if (typeof val === "object") {
      return (
        <pre className="text-[10px] font-mono bg-gray-100 dark:bg-gray-950 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300 overflow-x-auto max-h-32">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }

    return (
      <span className="text-gray-900 dark:text-white font-medium text-xs font-sans">
        {String(val)}
      </span>
    );
  };

  const jsonToDisplay =
    jsonScope === "payload"
      ? JSON.stringify(payload, null, 2)
      : JSON.stringify(
          {
            id: rawEvent?.id || "—",
            action: rawEvent?.action || action,
            category: rawEvent?.category || category || "general",
            actor: rawEvent?.actor || {},
            target: rawEvent?.target || {},
            details: rawEvent?.details || details || "—",
            payload: payload,
            ip_address: rawEvent?.ip_address || "Internal Origin",
            timestamp: rawEvent?.timestamp || new Date().toISOString(),
            ledger_partition: rawEvent?.ledger_partition || "audit_log",
          },
          null,
          2
        );

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900/50 shadow-sm overflow-hidden">
      {/* View Mode Switcher Toolbar */}
      <div className="p-4 sm:p-5 border-b border-gray-200/80 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 w-fit">
            <button
              onClick={() => setViewMode("visual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "visual"
                  ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-brand-500" />
              Visual Inspector ({allDataPoints.length} Data Points)
            </button>

            <button
              onClick={() => setViewMode("json")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "json"
                  ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-brand-500" />
              Raw JSON Data
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "json" ? (
            <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-800/60 rounded-lg p-0.5 font-mono">
              <button
                onClick={() => setJsonScope("full")}
                className={`px-2.5 py-1 rounded text-[11px] ${
                  jsonScope === "full"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold shadow-xs"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Full JSON ({allDataPoints.length} points)
              </button>
              <button
                onClick={() => setJsonScope("payload")}
                className={`px-2.5 py-1 rounded text-[11px] ${
                  jsonScope === "payload"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold shadow-xs"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Payload Only ({Object.keys(payload).length})
              </button>
            </div>
          ) : (
            <div className="relative w-48 sm:w-56">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter data points..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/80 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          <button
            onClick={() => handleCopy(jsonToDisplay, "json")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/60 transition-colors"
          >
            {copiedKey === "json" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode 1: Visual Inspector with Full JSON Data Points */}
      {viewMode === "visual" && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {financialAmount !== undefined && (
              <div className="p-4 rounded-xl border border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-mono uppercase font-semibold">
                  <span>Financial Amount</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <p className="mt-1 text-2xl font-bold font-mono text-gray-900 dark:text-white">
                  ₦{Number(financialAmount).toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-sans">
                  {payload.total_budget !== undefined
                    ? "Total Campaign Pool"
                    : payload.payout !== undefined
                    ? "Verified Creator Payout"
                    : payload.net_disbursed !== undefined
                    ? "Net Settlement Disbursed"
                    : "Transaction Value"}
                </p>
              </div>
            )}

            {countMetric !== undefined && (
              <div className="p-4 rounded-xl border border-blue-200/70 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-xs font-mono uppercase font-semibold">
                  <span>{countLabel}</span>
                  {payload.views !== undefined ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                </div>
                <p className="mt-1 text-2xl font-bold font-mono text-gray-900 dark:text-white">
                  {Number(countMetric).toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-sans">
                  Recorded in audit ledger check
                </p>
              </div>
            )}

            {socialPlatform && (
              <div className="p-4 rounded-xl border border-purple-200/70 bg-purple-50/40 dark:border-purple-900/40 dark:bg-purple-950/20">
                <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-mono uppercase font-semibold">
                  <span>Social Channel</span>
                  <Share2 className="w-4 h-4" />
                </div>
                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white font-sans capitalize">
                  {socialPlatform}
                </p>
                <p className="text-xs font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                  @{socialHandle || "channel"}
                </p>
              </div>
            )}

            {campaignTitle && (
              <div className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 sm:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-mono uppercase font-semibold">
                  <span>Campaign Reference</span>
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="mt-1 text-base font-bold text-gray-900 dark:text-white font-sans">
                  {campaignTitle}
                </p>
                {postUrl && (
                  <a
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 mt-1.5"
                  >
                    Open Live Post URL
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Before & After State Transition (Diff) */}
          {hasDiff && (
            <div className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-gray-600 dark:text-gray-300">
                <Layers className="w-4 h-4 text-brand-500" />
                State Mutation &amp; Diff Comparison
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-900/40">
                  <div className="text-[10px] font-mono font-bold uppercase text-rose-600 dark:text-rose-400 mb-1.5">
                    Before / Previous
                  </div>
                  <div className="text-xs">
                    {renderValueVisual({
                      section: "payload",
                      path: "previous",
                      label: "Previous",
                      type: typeof prevVal,
                      value: prevVal,
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1.5">
                    After / Updated
                  </div>
                  <div className="text-xs">
                    {renderValueVisual({
                      section: "payload",
                      path: "current",
                      label: "Current",
                      type: typeof currVal,
                      value: currVal,
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <button
              onClick={() => setActiveSectionFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSectionFilter === "all"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              All Data Points ({allDataPoints.length})
            </button>
            <button
              onClick={() => setActiveSectionFilter("system")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeSectionFilter === "system"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <Shield className="w-3 h-3" />
              System &amp; Ledger (6)
            </button>
            <button
              onClick={() => setActiveSectionFilter("actor")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeSectionFilter === "actor"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <User className="w-3 h-3" />
              Actor &amp; Auth (4)
            </button>
            <button
              onClick={() => setActiveSectionFilter("target")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeSectionFilter === "target"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <Database className="w-3 h-3" />
              Target &amp; Scope (3)
            </button>
            <button
              onClick={() => setActiveSectionFilter("payload")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeSectionFilter === "payload"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <Tag className="w-3 h-3" />
              Payload Parameters ({Object.keys(payload).length})
            </button>
          </div>

          {/* Complete Visual Data Points Grid / Table */}
          <div className="rounded-xl border border-gray-200/80 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800/80">
            {filteredDataPoints.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No data points match your search filter.
              </div>
            ) : (
              filteredDataPoints.map((item) => (
                <div
                  key={item.path}
                  className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-[260px]">
                    <div className="mt-0.5 shrink-0">
                      {item.section === "system" ? (
                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                      ) : item.section === "actor" ? (
                        <User className="w-3.5 h-3.5 text-purple-500" />
                      ) : item.section === "target" ? (
                        <Database className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <Tag className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block font-sans">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-[10px] text-gray-400 font-mono">
                          {item.path}
                        </code>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:max-w-md break-all">
                    {renderValueVisual(item)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Raw JSON Mode */}
      {viewMode === "json" && (
        <div className="p-4 sm:p-5">
          <pre className="text-xs font-mono bg-gray-50 dark:bg-[#06080E] p-4 sm:p-5 rounded-xl border border-gray-200/80 dark:border-slate-800 overflow-x-auto text-gray-800 dark:text-slate-200 max-h-[500px] leading-relaxed">
            {jsonToDisplay}
          </pre>
        </div>
      )}
    </div>
  );
}
