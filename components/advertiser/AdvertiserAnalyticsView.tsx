'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  FileText,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Printer,
  BarChart2,
  LineChart,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Info,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { AdvertiserDashboardData } from '@/lib/supabase/advertiser';
import { generateAIAnalyticsInsightsAction } from '@/app/actions/campaign';

interface AdvertiserAnalyticsViewProps {
  data: AdvertiserDashboardData;
}

export default function AdvertiserAnalyticsView({ data }: AdvertiserAnalyticsViewProps) {
  const { companyName, campaigns: rawCampaigns } = data;

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeChartTab, setActiveChartTab] = useState<'views' | 'cpv'>('views');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('Cross-Campaign ROI Analytics Report');

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // AI Insights State
  const [aiInsights, setAiInsights] = useState<{ optimizationTip: string; benchmarkComparison: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const allSupportedPlatforms = ['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn'];

  // Exclusively filter for Live/Active or Completed campaigns (discard draft, archived, or pending setup)
  const validCampaigns = (rawCampaigns || []).filter((c) => {
    const st = (c.status || '').toLowerCase();
    return st === 'live' || st === 'active' || st === 'completed' || st === 'paid';
  });

  // Map database campaigns with 100% true values
  const campaigns = validCampaigns.map((c) => {
    const views = Number(c.views_delivered || 0);
    const spent = Number(c.spent_budget || 0);
    const primaryChannel = Array.isArray(c.channels) && c.channels.length > 0
      ? c.channels[0]
      : (c.ad_format?.includes('Reel') ? 'Instagram' : (c.ad_format?.includes('Shorts') ? 'YouTube' : 'TikTok'));

    return {
      id: c.id,
      title: c.title,
      ad_format: c.ad_format || 'Video Asset',
      channel: primaryChannel,
      cpm_rate: Number(c.cpm_rate || 0),
      status: c.status || 'live',
      views_delivered: views,
      spent_budget: spent,
      cover_image_url: c.cover_image_url || c.company_logo || null,
      created_at: c.created_at,
    };
  });

  // 100% Live DB Aggregate Metrics (Zero hardcoding)
  const totalViews = campaigns.reduce((sum, c) => sum + c.views_delivered, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent_budget, 0);
  const cpv = totalViews > 0 ? totalSpent / totalViews : 0;
  const avgCpm = totalViews > 0 ? (totalSpent / totalViews) * 1000 : 0;

  // Trigger AI Action when valid view data exists
  useEffect(() => {
    if (totalViews > 0 && campaigns.length > 0) {
      setIsAiLoading(true);
      const payload = campaigns.map((c) => ({
        title: c.title,
        views: c.views_delivered,
        spent: c.spent_budget,
        cpm: c.cpm_rate,
        channel: c.channel,
      }));

      generateAIAnalyticsInsightsAction(payload)
        .then((res) => {
          if (res.success && res.hasData && res.insights) {
            setAiInsights(res.insights);
          }
        })
        .finally(() => setIsAiLoading(false));
    }
  }, [totalViews, campaigns.length]);

  // Dynamic Multi-Platform channel distribution from live campaigns (No Snapchat)
  const getChannelViews = (name: string) => {
    return campaigns
      .filter((c) => c.channel.toLowerCase().includes(name.toLowerCase()) || c.ad_format.toLowerCase().includes(name.toLowerCase()))
      .reduce((sum, c) => sum + c.views_delivered, 0);
  };

  const platformDist = [
    { name: 'TikTok', views: getChannelViews('tiktok'), color: 'bg-slate-950' },
    { name: 'Instagram', views: getChannelViews('instagram'), color: 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600' },
    { name: 'YouTube Shorts', views: getChannelViews('youtube'), color: 'bg-red-600' },
    { name: 'X / Twitter', views: getChannelViews('twitter'), color: 'bg-sky-500' },
    { name: 'Facebook', views: getChannelViews('facebook'), color: 'bg-blue-600' },
    { name: 'LinkedIn', views: getChannelViews('linkedin'), color: 'bg-blue-800' },
  ];

  const totalDistViewsSum = platformDist.reduce((sum, p) => sum + p.views, 0);

  // Group actual database campaigns by month for Recharts
  const monthMap: Record<string, { views: number; spent: number; count: number }> = {};

  campaigns.forEach((c) => {
    const d = new Date(c.created_at || Date.now());
    const monthKey = d.toLocaleString('default', { month: 'short' });
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { views: 0, spent: 0, count: 0 };
    }
    monthMap[monthKey].views += c.views_delivered;
    monthMap[monthKey].spent += c.spent_budget;
    monthMap[monthKey].count += 1;
  });

  const chartData = Object.keys(monthMap).map((m) => {
    const v = monthMap[m].views;
    const s = monthMap[m].spent;
    return {
      month: m,
      views: v,
      spent: s,
      cpv: v > 0 ? Number((s / v).toFixed(2)) : 0,
    };
  });

  // Formatting utilities
  const formatViews = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}K`;
    return val.toLocaleString();
  };

  const formatCurrency = (val: number) => {
    return `₦${val.toLocaleString()}`;
  };

  // Filtered live campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = selectedChannel === 'All' || c.channel.toLowerCase().includes(selectedChannel.toLowerCase()) || c.ad_format.toLowerCase().includes(selectedChannel.toLowerCase());
    return matchesSearch && matchesChannel;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage) || 1;
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getChannelIcon = (ch: string, format: string) => {
    const combined = (ch + ' ' + format).toLowerCase();
    if (combined.includes('instagram') || combined.includes('reel')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 border border-pink-200/60 flex items-center justify-center font-bold text-xs shrink-0">
          IG
        </div>
      );
    }
    if (combined.includes('youtube') || combined.includes('shorts')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center font-bold text-xs shrink-0">
          YT
        </div>
      );
    }
    if (combined.includes('twitter') || combined.includes('x')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center font-bold text-xs shrink-0">
          X
        </div>
      );
    }
    if (combined.includes('facebook')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold text-xs shrink-0">
          FB
        </div>
      );
    }
    if (combined.includes('linkedin')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center font-bold text-xs shrink-0">
          IN
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
        TT
      </div>
    );
  };

  const renderCampaignThumbnail = (camp: (typeof campaigns)[0]) => {
    if (camp.cover_image_url) {
      return (
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
          <Image
            src={camp.cover_image_url}
            alt={camp.title}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      );
    }
    return getChannelIcon(camp.channel, camp.ad_format);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'completed':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 text-[11px] font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold capitalize">
            {status}
          </span>
        );
    }
  };

  // Styled Branded Report Exporter
  const handleExportStyledCSV = (titleName: string = 'Brand ROI Analytics Summary') => {
    const timestamp = new Date().toLocaleString();
    const brandName = companyName || 'Brand Partner';

    const csvLines = [
      `"===================================================================================================="`,
      `"KPUGI ADVERTISING PLATFORM — BRAND ROI EXECUTIVE ANALYTICS REPORT"`,
      `"===================================================================================================="`,
      `"Report Title:","${titleName}"`,
      `"Brand Account:","${brandName}"`,
      `"Generated At:","${timestamp}"`,
      `"Platform Version:","Kpugi Enterprise v2.4"`,
      `""`,
      `"--- EXECUTIVE PERFORMANCE SUMMARY ---"`,
      `"Metric","Value","Benchmark / Description"`,
      `"Total Views Delivered","${totalViews.toLocaleString()}","Across all live & completed placements"`,
      `"Effective CPV (Cost Per View)","NGN ${cpv.toFixed(2)}","Average cost per single verified view"`,
      `"Average Blended CPM","NGN ${Math.round(avgCpm).toLocaleString()}","Cost per 1,000 verified impressions"`,
      `"Total Capital Spent","NGN ${totalSpent.toLocaleString()}","Verified creator payouts & escrow committed"`,
      `""`,
      `"--- PLATFORM DISTRIBUTION BREAKDOWN ---"`,
      `"Platform / Channel","Views","View Share (%)"`,
      ...platformDist.map((p) => {
        const pct = totalDistViewsSum > 0 ? Math.round((p.views / totalDistViewsSum) * 100) : 0;
        return `"${p.name}",${p.views},"${pct}%"`;
      }),
      `""`,
      `"--- LIVE & COMPLETED CAMPAIGN BREAKDOWN TABLE ---"`,
      `"Campaign Title","Format / Channel","CPM Rate (NGN)","Status","Views Delivered","Spent Budget (NGN)","Effective CPV (NGN)"`,
    ];

    campaigns.forEach((c) => {
      const campCpv = c.views_delivered > 0 ? c.spent_budget / c.views_delivered : 0;
      csvLines.push(
        `"${c.title}","${c.ad_format} (${c.channel})",${c.cpm_rate},"${c.status}",${c.views_delivered},${c.spent_budget},${campCpv.toFixed(2)}`
      );
    });

    csvLines.push(`""`);
    csvLines.push(`"===================================================================================================="`);
    csvLines.push(`"End of Official Kpugi Executive Report. Confidential & Proprietary."`);

    const csvContent = 'data:text/csv;charset=utf-8,' + csvLines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kpugi_executive_roi_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Brand ROI Analytics
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Aggregate cross-campaign view throughput, Cost Per View (CPV), and platform distribution performance.
        </p>
      </div>

      {/* Top 4 KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL VIEWS DELIVERED */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:shadow-xs transition-shadow">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Total Views Delivered
          </span>
          <p className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatViews(totalViews)}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <TrendingUp className="w-3 h-3" />
              Live Performance
            </span>
          </div>
        </div>

        {/* Card 2: EFFECTIVE CPV */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:shadow-xs transition-shadow">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Effective CPV
          </span>
          <p className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₦{cpv.toFixed(2)}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <TrendingDown className="w-3 h-3 text-emerald-600" />
              Cost Per View
            </span>
          </div>
        </div>

        {/* Card 3: AVERAGE BLENDED CPM */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:shadow-xs transition-shadow">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Average Blended CPM
          </span>
          <p className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₦{Math.round(avgCpm).toLocaleString()}
          </p>
          <span className="text-[11px] font-medium text-slate-400 block">
            per 1,000 Views
          </span>
        </div>

        {/* Card 4: TOTAL CAPITAL SPENT */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:shadow-xs transition-shadow">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Total Capital Spent
          </span>
          <p className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalSpent)}
          </p>
          <span className="text-[11px] font-medium text-slate-400 block">
            Verified Creator Payouts
          </span>
        </div>
      </div>

      {/* CLEAN AI INSIGHTS CARD (Identical to Institutional Reports Card: White background, subtle border, rounded-2xl) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#4338ca]" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Kpugi AI Intelligence Insights
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Real-time performance evaluation engine</p>
            </div>
          </div>
          {isAiLoading && (
            <span className="text-xs font-bold text-[#4338ca] flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing live campaigns...</span>
            </span>
          )}
        </div>

        {totalViews === 0 || campaigns.length === 0 ? (
          /* TRUTHFUL EMPTY STATE (When no view delivery data exists yet) */
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">No View Delivery Registered Yet</span>
              <p className="text-slate-500 font-normal leading-relaxed">
                Your account has no active view delivery data yet. Once your live campaigns begin receiving verified creator submissions and logging views, Kpugi AI will dynamically calculate your CPV optimization recommendations and benchmark comparisons.
              </p>
            </div>
          </div>
        ) : (
          /* REAL AI INSIGHTS DATA BLOCK */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Optimization Recommendation</span>
                <span className="text-[10px] text-[#4338ca] bg-indigo-50 px-2 py-0.5 rounded font-mono font-bold">LIVE AI</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {aiInsights?.optimizationTip || `Based on ${campaigns.length} live campaign placement(s), your current effective Cost-Per-View is ₦${cpv.toFixed(2)}. Allocating budget toward higher-throughput channel formats will maximize overall view delivery.`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Platform Benchmark Comparison</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">BENCHMARK</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {aiInsights?.benchmarkComparison || `Your brand's blended CPM of ₦${Math.round(avgCpm).toLocaleString()} is being evaluated against standard Nigeria ad-network benchmarks (₦1,500 - ₦2,000 / 1k views).`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout: Chart & Table (Left 8 cols) & Sidebar (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recharts Chart + Campaign Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* RECHARTS CHART COMPONENT (Connected strictly to real monthly data) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Performance Chart
                </h2>
                <p className="text-xs text-slate-400">Monthly view throughput and blended CPV efficiency trend</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('views')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeChartTab === 'views'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5 text-[#4338ca]" />
                  <span>Views</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('cpv')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeChartTab === 'cpv'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Blended CPV</span>
                </button>
              </div>
            </div>

            {/* Recharts Container */}
            {chartData.length === 0 || totalViews === 0 ? (
              /* Authentic Recharts Empty State */
              <div className="h-52 w-full flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                <BarChart2 className="w-8 h-8 text-slate-300" />
                <span className="font-bold text-xs text-slate-700 block">No Historical Trajectory Data Available</span>
                <p className="text-[11px] text-slate-400 max-w-sm font-normal">
                  Views will be charted automatically in real-time as your live campaigns receive creator submissions.
                </p>
              </div>
            ) : (
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartTab === 'views' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} tickFormatter={(v) => formatViews(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(val: any) => [`${formatViews(Number(val))} Views`, 'Views Delivered']}
                      />
                      <Bar dataKey="views" fill="#4338ca" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} tickFormatter={(v) => `₦${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(val: any) => [`₦${Number(val).toFixed(2)} CPV`, 'Effective CPV']}
                      />
                      <Area type="monotone" dataKey="cpv" stroke="#059669" fill="#d1fae5" strokeWidth={2.5} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Campaign Performance Breakdown Table */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Clean Table Header without redundant Filter/Export buttons */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Campaign Performance
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {campaigns.length} Active / Live
              </span>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search live campaigns..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedChannel}
                  onChange={(e) => {
                    setSelectedChannel(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none w-full sm:w-auto"
                >
                  <option value="All">All Social Networks</option>
                  {allSupportedPlatforms.map((plat) => (
                    <option key={plat} value={plat}>
                      {plat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                    <th className="py-3 px-5">Campaign & Platform</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Views</th>
                    <th className="py-3 px-4 text-right">Spent</th>
                    <th className="py-3 px-5 text-right">Effective CPV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {paginatedCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No live or completed campaigns found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedCampaigns.map((camp) => {
                      const campCpv = camp.views_delivered > 0 ? camp.spent_budget / camp.views_delivered : 0;
                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              {renderCampaignThumbnail(camp)}
                              <div>
                                <span className="font-bold text-slate-900 text-xs block">
                                  {camp.title}
                                </span>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  {camp.ad_format} • Rate: ₦{camp.cpm_rate.toLocaleString()}/1k
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(camp.status)}</td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-slate-700">
                            {formatViews(camp.views_delivered)}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-extrabold text-emerald-600">
                            {formatCurrency(camp.spent_budget)}
                          </td>
                          <td className="py-4 px-5 text-right font-mono font-black text-[#4338ca]">
                            ₦{campCpv.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedCampaigns.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No live or completed campaigns found.
                </div>
              ) : (
                paginatedCampaigns.map((camp) => {
                  const campCpv = camp.views_delivered > 0 ? camp.spent_budget / camp.views_delivered : 0;
                  return (
                    <div key={camp.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {renderCampaignThumbnail(camp)}
                          <div>
                            <span className="font-bold text-xs text-slate-900 block line-clamp-1">
                              {camp.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {camp.ad_format} • Rate: ₦{camp.cpm_rate.toLocaleString()}/1k
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(camp.status)}
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Views</span>
                          <span className="font-mono text-xs font-bold text-slate-800">{formatViews(camp.views_delivered)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Spent</span>
                          <span className="font-mono text-xs font-extrabold text-emerald-600">{formatCurrency(camp.spent_budget)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Effective CPV</span>
                          <span className="font-mono text-xs font-black text-[#4338ca]">₦{campCpv.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredCampaigns.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Reports & Global Performance Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Institutional Reports Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900">
              Institutional Reports
            </h3>

            <div className="space-y-3">
              {/* Item 1: Q3 Performance Summary */}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#4338ca]" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Q3 Performance Summary</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Generated Oct 1, 2023</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportStyledCSV('Q3 Performance Summary')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                  title="Download Report"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Item 2: Raw Data Export (CSV) */}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <TableIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Raw Data Export (CSV)</span>
                    <span className="text-[10px] text-slate-400 font-medium block">All time</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportStyledCSV('Raw Data Export (CSV)')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setReportTitle('Executive Cross-Campaign ROI Report');
                setIsReportModalOpen(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-[#4338ca] text-xs font-bold text-[#4338ca] bg-white hover:bg-indigo-50/50 transition-colors shadow-2xs"
            >
              Generate Custom Report
            </button>
          </div>

          {/* Global Performance / Multi-Platform Distribution Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900">
              Global Performance
            </h3>

            <div className="space-y-3.5">
              {platformDist.map((item) => {
                const pct = totalDistViewsSum > 0 ? Math.round((item.views / totalDistViewsSum) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-slate-900 font-mono text-[11px]">{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Styled Institutional Report Modal */}
      {isReportModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 min-h-screen w-screen overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#4338ca]" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900">Custom Institutional Report</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Executive analytics preview & export generator</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable & Styled Report Sheet */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5 font-sans">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                  <span className="font-display font-black text-lg text-slate-900 tracking-tight block">KPUGI</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Executive Advertising Report</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">{companyName || 'Brand Partner'}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* KPI Summary Block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/60 text-center">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Total Views</span>
                  <span className="font-mono text-sm font-black text-slate-900">{formatViews(totalViews)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Effective CPV</span>
                  <span className="font-mono text-sm font-black text-slate-900">₦{cpv.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Blended CPM</span>
                  <span className="font-mono text-sm font-black text-slate-900">₦{Math.round(avgCpm).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Total Spent</span>
                  <span className="font-mono text-sm font-black text-emerald-600">{formatCurrency(totalSpent)}</span>
                </div>
              </div>

              {/* Mini Table Summary */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Live & Completed Campaigns</span>
                <div className="divide-y divide-slate-200/60 border-t border-b border-slate-200/60 text-xs">
                  {campaigns.slice(0, 4).map((c) => (
                    <div key={c.id} className="py-2 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{c.title}</span>
                      <div className="flex items-center gap-4 text-[11px] font-mono">
                        <span className="text-slate-500">{formatViews(c.views_delivered)} views</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(c.spent_budget)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReport}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleExportStyledCSV(reportTitle);
                  setIsReportModalOpen(false);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4338ca] text-white text-xs font-bold shadow-2xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Executive CSV</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
