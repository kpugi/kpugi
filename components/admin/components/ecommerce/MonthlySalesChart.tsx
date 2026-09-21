"use client";

import React, { useState } from "react";
import { Eye, TrendingUp, Sparkles } from "lucide-react";
import { NairaIcon } from "../../icons";

export interface MonthMetric {
  name: string;
  views: number; // raw views count
  spend: number; // raw spend in Naira (₦)
  posts: number; // count of posts
}

interface MonthlySalesChartProps {
  data?: MonthMetric[];
}

const defaultMonths: MonthMetric[] = [
  { name: "Jan", views: 0, spend: 0, posts: 0 },
  { name: "Feb", views: 0, spend: 0, posts: 0 },
  { name: "Mar", views: 0, spend: 0, posts: 0 },
  { name: "Apr", views: 0, spend: 0, posts: 0 },
  { name: "May", views: 0, spend: 0, posts: 0 },
  { name: "Jun", views: 0, spend: 0, posts: 0 },
  { name: "Jul", views: 0, spend: 2500000, posts: 12 },
  { name: "Aug", views: 532711, spend: 7615000, posts: 8 },
  { name: "Sep", views: 674297, spend: 1000000, posts: 8 },
  { name: "Oct", views: 0, spend: 0, posts: 0 },
  { name: "Nov", views: 0, spend: 0, posts: 0 },
  { name: "Dec", views: 0, spend: 0, posts: 0 },
];

export default function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  const months = data && data.length === 12 ? data : defaultMonths;
  const [activeMetric, setActiveMetric] = useState<"views" | "spend">("views");
  const [hoveredMonth, setHoveredMonth] = useState<MonthMetric | null>(null);

  // Formatting helpers
  const formatViews = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const formatNaira = (val: number) => {
    if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}k`;
    return `₦${val.toLocaleString()}`;
  };

  // Metric-specific maximums & tick calculations
  const maxViews = Math.max(...months.map((m) => m.views), 100_000);
  const maxSpend = Math.max(...months.map((m) => m.spend), 1_000_000);

  // Round up to clean increments for Y-axis
  const ceilViews = Math.ceil(maxViews / 200_000) * 200_000 || 800_000;
  const ceilSpend = Math.ceil(maxSpend / 2_500_000) * 2_500_000 || 10_000_000;

  const currentMax = activeMetric === "views" ? ceilViews : ceilSpend;

  // Find peaks
  const peakViewsMonth = months.reduce((max, m) => (m.views > max.views ? m : max), months[0]);
  const peakSpendMonth = months.reduce((max, m) => (m.spend > max.spend ? m : max), months[0]);

  const totalViewsAll = months.reduce((sum, m) => sum + m.views, 0);
  const totalSpendAll = months.reduce((sum, m) => sum + m.spend, 0);

  return (
    <div className="relative rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 font-sans">
      {/* Header with Title and Mode Switcher Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
            Campaign Spend &amp; Post Velocity
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {activeMetric === "views"
              ? "Monthly verified CPM post impressions delivered across all active campaigns"
              : "Monthly brand advertising capital committed & funded into campaigns"}
          </p>
        </div>

        {/* Dual Mode Switcher Tabs (1: Views | 2: Spend) */}
        <div className="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shrink-0">
          <button
            onClick={() => setActiveMetric("views")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeMetric === "views"
                ? "bg-white text-brand-600 shadow-xs dark:bg-gray-900 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Verified Views</span>
          </button>
          <button
            onClick={() => setActiveMetric("spend")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeMetric === "spend"
                ? "bg-white text-emerald-600 shadow-xs dark:bg-gray-900 dark:text-emerald-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <NairaIcon className="w-3.5 h-3.5" />
            <span>Campaign Spend</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Bar Chart */}
      <div className="mt-6">
        <div className="relative h-52 w-full">
          <svg
            viewBox="0 0 600 160"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Views Gradient (Brand Blue) */}
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2F49E8" stopOpacity="1" />
                <stop offset="100%" stopColor="#4A65F6" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="viewsGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E32B8" stopOpacity="1" />
                <stop offset="100%" stopColor="#2F49E8" stopOpacity="0.9" />
              </linearGradient>

              {/* Spend Gradient (Emerald Green) */}
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="1" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="spendGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#047857" stopOpacity="1" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal grid lines (5 intervals) */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
              const val = ratio * currentMax;
              const y = 140 - ratio * 130;
              return (
                <g key={ratio}>
                  <line
                    x1="0"
                    y1={y}
                    x2="600"
                    y2={y}
                    stroke="currentColor"
                    className="text-gray-100 dark:text-gray-800"
                    strokeWidth="1"
                    strokeDasharray={ratio === 0 ? "0" : "3 3"}
                  />
                  <text
                    x="2"
                    y={y - 4}
                    className="fill-gray-400 dark:fill-gray-600 text-[9px] font-mono select-none"
                  >
                    {ratio > 0
                      ? activeMetric === "views"
                        ? formatViews(val)
                        : formatNaira(val)
                      : ""}
                  </text>
                </g>
              );
            })}

            {/* 12 Monthly Bars */}
            {months.map((m, idx) => {
              const totalWidth = 600;
              const slotWidth = totalWidth / months.length;
              const barWidth = 24;
              const x = idx * slotWidth + (slotWidth - barWidth) / 2;

              const val = activeMetric === "views" ? m.views : m.spend;
              const barRatio = currentMax > 0 ? Math.min(1, val / currentMax) : 0;
              const barHeight = val > 0 ? Math.max(8, barRatio * 130) : 4;
              const y = 140 - barHeight;
              const isHovered = hoveredMonth?.name === m.name;

              const fill =
                activeMetric === "views"
                  ? isHovered
                    ? "url(#viewsGradientHover)"
                    : "url(#viewsGradient)"
                  : isHovered
                  ? "url(#spendGradientHover)"
                  : "url(#spendGradient)";

              return (
                <g
                  key={m.name}
                  className="cursor-pointer transition-transform"
                  onMouseEnter={() => setHoveredMonth(m)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Invisible hit-box for easy hovering */}
                  <rect
                    x={idx * slotWidth}
                    y="0"
                    width={slotWidth}
                    height="160"
                    fill="transparent"
                  />
                  {/* Visual Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="5"
                    ry="5"
                    fill={fill}
                    className="transition-all duration-300"
                    opacity={val > 0 ? 1 : 0.3}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip displaying BOTH metrics simultaneously */}
          {hoveredMonth && (
            <div className="absolute top-1 right-2 bg-gray-950/95 dark:bg-white/95 text-white dark:text-gray-900 px-3.5 py-2 rounded-xl shadow-xl text-xs font-mono backdrop-blur-sm pointer-events-none transition-all flex items-center gap-3 border border-white/10 dark:border-gray-200 z-10">
              <span className="font-bold text-sm font-display">{hoveredMonth.name}</span>
              <span className="text-gray-500">•</span>
              <span className="text-brand-300 dark:text-brand-600 font-semibold flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(hoveredMonth.views)} views
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-emerald-400 dark:text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {formatNaira(hoveredMonth.spend)} spend
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-purple-300 dark:text-purple-600">
                {hoveredMonth.posts} posts
              </span>
            </div>
          )}
        </div>

        {/* X-Axis Month Labels */}
        <div className="mt-2 flex justify-between px-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
          {months.map((m) => (
            <span
              key={m.name}
              className={`w-6 text-center transition-colors ${
                hoveredMonth?.name === m.name
                  ? activeMetric === "views"
                    ? "text-brand-500 font-bold"
                    : "text-emerald-500 font-bold"
                  : "hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              activeMetric === "views" ? "bg-brand-500" : "bg-emerald-500"
            }`}
          ></span>
          <span>
            {activeMetric === "views"
              ? `Total Verified Views Delivered: ${formatViews(totalViewsAll)}`
              : `Total Campaign Capital Funded: ${formatNaira(totalSpendAll)}`}
          </span>
        </div>
        <div className="font-mono font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>
            {activeMetric === "views"
              ? `Peak: ${formatViews(peakViewsMonth.views)} views (${peakViewsMonth.name})`
              : `Peak: ${formatNaira(peakSpendMonth.spend)} (${peakSpendMonth.name})`}
          </span>
        </div>
      </div>
    </div>
  );
}
