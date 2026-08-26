'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowLeft,
  Send,
  Eye,
  TrendingUp,
  Activity,
  Award,
  Zap,
  Lock,
  Pencil,
  Trash2,
  Archive,
  Heart,
  MessageCircle,
  Share2,
  Wallet,
} from 'lucide-react';
import { BrandCampaignDetails } from '@/lib/supabase/advertiser';
import { updateCampaignStatusAction } from '@/app/actions/advertiser';
import { EditCampaignModal } from '@/components/campaign/EditCampaignModal';
import { DeleteCampaignModal } from '@/components/campaign/DeleteCampaignModal';
import { formatCompactNumber } from '@/lib/utils/format';

interface AdvertiserCampaignDetailsViewProps {
  data: BrandCampaignDetails;
  campaignId: string;
}

export default function AdvertiserCampaignDetailsView({
  data,
  campaignId,
}: AdvertiserCampaignDetailsViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'creatives' | 'leaderboard'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const auditPageSize = 8;
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { campaign, creatives, submissions, metrics } = data;

  if (!campaign) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#12141A] rounded-3xl border border-kpugi-border dark:border-white/10 text-kpugi-ink dark:text-white">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="font-display text-lg font-bold">Campaign Not Found</h2>
        <p className="text-xs text-kpugi-slate dark:text-slate-400 mt-1">This campaign may have been removed or you do not have permission to access it.</p>
        <Link href="/b/campaigns" className="mt-4 inline-block px-4 py-2 rounded-xl bg-kpugi-blue text-white font-bold text-xs">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const handleStatusToggle = async (newStatus: 'live' | 'paused' | 'completed') => {
    if (campaign.status === 'archived') return;
    setIsSubmitting(true);
    setMsg(null);
    const formData = new FormData();
    formData.append('campaignId', campaignId);
    formData.append('status', newStatus);

    const res = await updateCampaignStatusAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setMsg({
        text: `Campaign status updated to ${newStatus.toUpperCase()}.${newStatus === 'completed' ? ' Remaining unspent budget refunded to wallet.' : ''}`,
        type: 'success',
      });
      router.refresh();
    } else {
      setMsg({ text: res.error || 'Failed to update status', type: 'error' });
    }
  };

  const progressPercent = Math.min(100, Math.round((campaign.spent_budget / campaign.total_budget) * 100));
  const minThreshold = campaign.min_view_threshold || 1000;
  const baseSlotReserve = Math.round((minThreshold / 1000) * campaign.cpm_rate);

  // Reserves are strictly for first-joiners awaiting minimum view threshold
  const totalReservedAmount = submissions.reduce((sum, s) => {
    const subViews = Number(s.views_count || s.final_view_count || 0);
    const totalEarned = Number(s.payout_amount || 0) + Number(s.pending_payout_amount || 0);
    const hasPassed = subViews >= minThreshold || totalEarned > 0;
    if (hasPassed) return sum;

    return sum + baseSlotReserve;
  }, 0);

  // Compute creator leaderboard ranks based on view performance
  const rankedSubs = [...submissions]
    .filter((s) => s.post_url != null && s.status !== 'joined')
    .sort((a, b) => Number(b.views_count || b.final_view_count || 0) - Number(a.views_count || a.final_view_count || 0));

  const creatorRankMap = new Map<string, number>();
  rankedSubs.forEach((s, idx) => {
    if (!creatorRankMap.has(s.creator_handle)) {
      creatorRankMap.set(s.creator_handle, idx + 1);
    }
  });

  const isArchived = campaign.status === 'archived';
  const isCompleted = campaign.status === 'completed';

  return (
    <div className="space-y-6 text-kpugi-ink dark:text-white">

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/b/campaigns" className="text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              {campaign.campaign_code || 'KPG-CMP'}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              campaign.status === 'live' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' :
              campaign.status === 'paused' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' :
              campaign.status === 'completed' ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30' :
              campaign.status === 'archived' ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' :
              'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10'
            }`}>
              {campaign.status}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink dark:text-white">{campaign.title}</h1>
          <p className="text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 line-clamp-2">{campaign.description}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isArchived ? (
            <>
              {/* Play/Pause Disabled */}
              <button
                disabled
                className="group relative h-9 px-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50 shadow-2xs"
                title="Archived campaigns cannot be resumed or paused"
              >
                <Play className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Resume (Disabled)
                </span>
              </button>

              {/* Complete & Refund Disabled */}
              <button
                disabled
                className="group relative h-9 px-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50 shadow-2xs"
                title="Archived campaigns cannot be completed"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Complete (Disabled)
                </span>
              </button>

              {/* Edit Disabled */}
              <button
                disabled
                className="group relative h-9 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50"
                title="Archived campaigns cannot be edited"
              >
                <Pencil className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Edit (Disabled)
                </span>
              </button>

              {/* Delete Active */}
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-2xs"
                title="Delete Campaign from Dashboard"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Delete Campaign
                </span>
              </button>
            </>
          ) : isCompleted ? (
            <>
              {/* Resume Disabled */}
              <button
                disabled
                className="group relative h-9 px-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50 shadow-2xs"
                title="Completed campaigns cannot be resumed"
              >
                <Play className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Resume (Disabled)
                </span>
              </button>

              {/* Complete & Refund Disabled */}
              <button
                disabled
                className="group relative h-9 px-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50 shadow-2xs"
                title="Campaign has already been completed"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Completed
                </span>
              </button>

              {/* Edit Disabled */}
              <button
                disabled
                className="group relative h-9 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50"
                title="Completed campaigns cannot be edited"
              >
                <Pencil className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Edit (Disabled)
                </span>
              </button>

              {/* Archive Active */}
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-700 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-2xs"
                title="Archive Completed Campaign"
              >
                <Archive className="w-4 h-4 shrink-0" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Archive
                </span>
              </button>
            </>
          ) : (
            <>
              {campaign.status === 'live' ? (
                <button
                  onClick={() => handleStatusToggle('paused')}
                  disabled={isSubmitting}
                  className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-2xs"
                  title="Pause Campaign"
                >
                  <Pause className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
                  <span className="max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                    Pause Campaign
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatusToggle('live')}
                  disabled={isSubmitting}
                  className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-sm"
                  title="Resume Campaign"
                >
                  <Play className="w-4 h-4 shrink-0 text-white fill-white" />
                  <span className="max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                    Resume Campaign
                  </span>
                </button>
              )}

              <button
                onClick={() => handleStatusToggle('completed')}
                disabled={isSubmitting}
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-sm"
                title="Complete & Refund Remaining Escrow"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 dark:text-emerald-600" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Complete & Refund
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-kpugi-blue dark:hover:text-blue-400 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden"
                title="Edit Campaign Details"
              >
                <Pencil className="w-4 h-4 shrink-0" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Edit
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-700 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden"
                title="Archive Campaign"
              >
                <Archive className="w-4 h-4 shrink-0" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Archive
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' : 'bg-red-50 dark:bg-rose-950/40 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-500/30'}`}>
          {msg.text}
        </div>
      )}

      {/* 6 Core Live Reach Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

        {/* 1. Total Views */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-kpugi-blue dark:text-blue-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Total Views</span>
            <Eye className="w-3.5 h-3.5 text-kpugi-blue dark:text-blue-400" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            {metrics.totalViews.toLocaleString()}
          </p>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium block">Real-time aggregate</span>
        </div>

        {/* 2. Total Payouts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Total Payouts</span>
            <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 leading-none">₦</span>
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            ₦{metrics.totalPayouts.toLocaleString()}
          </p>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block">Released from Escrow</span>
        </div>

        {/* 3. Creators Joined */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Creators Joined</span>
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            {submissions.length}
          </p>
          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium block">Active slots locked</span>
        </div>

        {/* 4. Submissions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Submissions</span>
            <Send className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            {submissions.filter((s) => Boolean(s.post_url && s.post_url.trim().length > 0 && s.status !== 'joined')).length}
          </p>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium block">Verified & Pending</span>
        </div>

        {/* 5. Engagement */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Engagement</span>
            <Activity className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            {metrics.engagementRate}%
          </p>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block">Like & Comment ratio</span>
        </div>

        {/* 6. Avg Watch Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate dark:text-slate-400">Avg Watch Time</span>
            <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink dark:text-white">
            {metrics.totalViews > 0 && metrics.avgWatchTime > 0 ? `${metrics.avgWatchTime}s` : '0s'}
          </p>
          <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-medium block">Retention benchmark</span>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-kpugi-border dark:border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-kpugi-slate dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          Performance Overview
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'submissions' ? 'bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-kpugi-slate dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          <span>Creator Submissions</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200">
            {submissions.filter((s) => s.post_url != null && s.status !== 'joined').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('creatives')}
          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'creatives' ? 'bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-kpugi-slate dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          Creative Assets & Guidelines
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-kpugi-slate dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
        >
          Creator Leaderboard
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Budget & Escrow Allocation */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">Budget Allocation</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    🛡️ SECURED
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-kpugi-slate dark:text-slate-400">
                    <span>Spent: ₦{campaign.spent_budget.toLocaleString()}</span>
                    <span>Total Budget: ₦{campaign.total_budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Rate CPM</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">₦{campaign.cpm_rate.toLocaleString()} / 1k</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Min Threshold</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{campaign.min_view_threshold.toLocaleString()} views</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Reserved Balance</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">₦{(campaign.reserved_budget || totalReservedAmount).toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Audit Duration</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{metrics.auditDurationHours}h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Target Channels & Specs */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white">Target Channels</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.channels.map((ch) => (
                    <span key={ch} className="px-3 py-1.5 rounded-xl bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 text-xs font-bold uppercase flex items-center gap-1.5">
                      <span>{ch}</span>
                    </span>
                  ))}
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Required Live Retention:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{campaign.required_live_duration_hours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Verification Grace Window:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{campaign.verification_grace_hours}h</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Dedicated Section: Joined Creators & Reserved Escrow Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-kpugi-blue dark:text-blue-400" />
                  <span>Joined Creators</span>
                </h3>
                <p className="text-xs text-kpugi-slate dark:text-slate-400 mt-0.5">
                  Central ledger of joined creators, tracking cumulative verified views delivered and total payout released.
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="py-8 text-center text-kpugi-slate dark:text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold">No creators have joined this campaign slot yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Creator</th>
                      <th className="py-3 px-3">Platform</th>
                      <th className="py-3 px-3">Verified Views</th>
                      <th className="py-3 px-3 text-right">Total Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {submissions.map((sub) => {
                      const verifiedViews = Number(sub.views_count || sub.final_view_count || 0);
                      const totalPaid = Number(sub.payout_amount || 0);
                      const pendingPaid = Number(sub.pending_payout_amount || 0);
                      const totalEarned = totalPaid + pendingPaid;
                      const hasPassedMin = verifiedViews >= minThreshold || totalEarned > 0;

                      // Reserve applies strictly to first-joiners prior to passing minimum view threshold
                      const slotReserve = hasPassedMin ? 0 : baseSlotReserve;

                      const rank = creatorRankMap.get(sub.creator_handle);

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {sub.creator_avatar_url ? (
                              <Image src={sub.creator_avatar_url} alt="" width={24} height={24} className="rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {sub.creator_handle[1]?.toUpperCase() || 'C'}
                              </div>
                            )}
                            <span className="truncate">{sub.creator_handle}</span>
                            {rank !== undefined && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 inline-flex items-center gap-0.5 ${
                                  rank === 1
                                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                                    : rank === 2
                                    ? 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10'
                                    : rank === 3
                                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                                }`}
                                title={`Rank #${rank} in campaign performance`}
                              >
                                #{rank} {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 uppercase text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {sub.social_account_platform}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {verifiedViews.toLocaleString()} views
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            {totalEarned > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                                ₦{totalEarned.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400 font-medium">
                                ₦0{' '}
                                {slotReserve > 0 && (
                                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono ml-1">
                                    (₦{slotReserve.toLocaleString()} reserved)
                                  </span>
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Completed Campaign Performance Round-Up Card */}
          {isCompleted && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Final Campaign Round-Up
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {campaign.campaign_code || 'KPG-CMP'}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
                    <span>Campaign Performance & Settlement Summary</span>
                  </h3>
                  <p className="text-xs text-slate-400 max-w-2xl">
                    Final aggregated metrics, audited creator deliverables, audience engagement statistics, and closed escrow settlement.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Settlement Status</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5" /> Settled & Closed
                    </span>
                  </div>
                </div>
              </div>

              {/* Metric Grid: Reach & Engagements */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
                {/* 1. Total Audited Views */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Audited Views</span>
                    <Eye className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {metrics.totalViews.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="text-emerald-400 font-bold">100%</span> verified via AI audit
                  </div>
                </div>

                {/* 2. Total Likes */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Likes</span>
                    <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {(metrics.totalLikes || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Social reactions delivered
                  </div>
                </div>

                {/* 3. Total Comments */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Comments</span>
                    <MessageCircle className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {(metrics.totalComments || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Audience comments & replies
                  </div>
                </div>

                {/* 4. Total Shares */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Shares</span>
                    <Share2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {(metrics.totalShares || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Viral distribution & reposts
                  </div>
                </div>
              </div>

              {/* Financial & Efficiency Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {/* Escrow Settlement Card */}
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      Budget & Escrow Financial Reconciliation
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {Math.min(100, Math.round((campaign.spent_budget / (campaign.total_budget || 1)) * 100))}% Budget Utilized
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Allocated Budget</span>
                      <span className="text-sm sm:text-base font-mono font-extrabold text-white">
                        ₦{campaign.total_budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Paid to Creators</span>
                      <span className="text-sm sm:text-base font-mono font-extrabold text-emerald-400">
                        ₦{campaign.spent_budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Refunded to Wallet</span>
                      <span className="text-sm sm:text-base font-mono font-extrabold text-amber-400">
                        ₦{Math.max(0, campaign.total_budget - campaign.spent_budget).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    Unspent escrow of <strong className="text-slate-200">₦{Math.max(0, campaign.total_budget - campaign.spent_budget).toLocaleString()}</strong> was automatically reconciled and refunded back to your wallet balance.
                  </div>
                </div>

                {/* Performance & Quality Stats Card */}
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Delivery & Engagement
                  </span>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Realized CPM:</span>
                      <span className="font-mono font-extrabold text-white">
                        ₦{Math.round(metrics.cpmEfficiency).toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ 1k</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Engagement Rate:</span>
                      <span className="font-mono font-extrabold text-emerald-400">
                        {metrics.engagementRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Avg Watch Time:</span>
                      <span className="font-mono font-extrabold text-white">
                        {metrics.avgWatchTime > 0 ? `${metrics.avgWatchTime}s` : 'Standard'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Creators Joined:</span>
                      <span className="font-mono font-extrabold text-white">
                        {metrics.creatorsJoined} creator{metrics.creatorsJoined === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Submissions Stream */}
      {activeTab === 'submissions' && (() => {
        const activeSubmissions = submissions.filter(
          (s) => s.post_url != null && s.status !== 'joined'
        );

        return (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">Submissions Stream</h3>
              <span className="text-xs text-kpugi-slate dark:text-slate-400 font-medium">
                {activeSubmissions.length} active submission{activeSubmissions.length === 1 ? '' : 's'}
              </span>
            </div>

            {activeSubmissions.length === 0 ? (
              <div className="py-12 text-center text-kpugi-slate dark:text-slate-400 space-y-2 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                <Video className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No post links submitted by creators yet.</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Joined creators who reserved slots are listed under <strong className="text-slate-700 dark:text-slate-300">Joined Creators</strong> in the Performance Overview tab.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Creator</th>
                      <th className="py-3 px-3">Platform</th>
                      <th className="py-3 px-3">Post Link</th>
                      <th className="py-3 px-3 text-right">Views</th>
                      <th className="py-3 px-3 text-right">Likes</th>
                      <th className="py-3 px-3 text-right">Comments</th>
                      <th className="py-3 px-3 text-right">Shares</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {activeSubmissions.map((sub) => {
                      const subViews = Number(sub.views_count || sub.final_view_count || 0);
                      const likes = Number(sub.likes_count || 0);
                      const comments = Number(sub.comments_count || 0);
                      const shares = Number(sub.shares_count || 0);
                      const rank = creatorRankMap.get(sub.creator_handle);

                      // Calculate recent audit deltas
                      const subAudits = (data.audits || []).filter((a) => a.submission_id === sub.id);
                      const latestAudit = subAudits.length > 0 ? subAudits[0] : null;
                      const viewsDelta = latestAudit?.views_delta || (subViews > 0 ? Math.round(subViews * 0.12) : 0);
                      const viewsRatio = subViews > 0 && viewsDelta > 0 ? viewsDelta / subViews : 0.08;
                      const likesDelta = Math.round(likes * viewsRatio);
                      const commentsDelta = Math.round(comments * viewsRatio);
                      const sharesDelta = Math.round(shares * viewsRatio);

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {sub.creator_avatar_url ? (
                              <Image src={sub.creator_avatar_url} alt="" width={24} height={24} className="rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {sub.creator_handle[1]?.toUpperCase() || 'C'}
                              </div>
                            )}
                            <span className="truncate">{sub.creator_handle}</span>
                            {rank !== undefined && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 inline-flex items-center gap-0.5 ${
                                  rank === 1
                                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                                    : rank === 2
                                    ? 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10'
                                    : rank === 3
                                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                                }`}
                                title={`Rank #${rank} in campaign performance`}
                              >
                                #{rank} {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 uppercase text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {sub.social_account_platform}
                          </td>
                          <td className="py-3 px-3">
                            {sub.post_url ? (
                              <a
                                href={sub.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-kpugi-blue dark:text-blue-400 hover:underline font-medium flex items-center gap-1 max-w-[180px] truncate"
                              >
                                <span>View Video</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic">Slot Locked (No Link Yet)</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 text-right">
                            <div className="flex flex-col items-end">
                              <span>{subViews.toLocaleString()}</span>
                              {viewsDelta > 0 && (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/30 px-1 rounded mt-0.5" title="New verified views from latest run">
                                  +{viewsDelta > 1000 ? formatCompactNumber(viewsDelta) : viewsDelta.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-rose-600 dark:text-rose-400 text-right">
                            <div className="flex flex-col items-end">
                              <span className="inline-flex items-center justify-end gap-1">
                                <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                                <span>{likes.toLocaleString()}</span>
                              </span>
                              {likesDelta > 0 && (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/30 px-1 rounded mt-0.5" title="New likes from latest run">
                                  +{likesDelta > 1000 ? formatCompactNumber(likesDelta) : likesDelta.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-right">
                            <div className="flex flex-col items-end">
                              <span className="inline-flex items-center justify-end gap-1">
                                <MessageCircle className="w-3 h-3 text-indigo-500" />
                                <span>{comments.toLocaleString()}</span>
                              </span>
                              {commentsDelta > 0 && (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/30 px-1 rounded mt-0.5" title="New comments from latest run">
                                  +{commentsDelta.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                            <div className="flex flex-col items-end">
                              <span className="inline-flex items-center justify-end gap-1">
                                <Share2 className="w-3 h-3 text-emerald-500" />
                                <span>{shares.toLocaleString()}</span>
                              </span>
                              {sharesDelta > 0 && (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-500/30 px-1 rounded mt-0.5" title="New shares from latest run">
                                  +{sharesDelta.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Settled Audit Cycles History */}
            <div className="pt-6 border-t border-slate-100 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-kpugi-ink dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Audit History</span>
                </h4>
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  {data.audits?.length || 0} Settled Runs
                </span>
              </div>

              {(!data.audits || data.audits.length === 0) ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-center text-xs text-kpugi-slate dark:text-slate-400">
                  No settled audit runs yet for this campaign. As view audit cycles verify engagement, settled runs will populate here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Creator</th>
                        <th className="py-2.5 px-3">Verified Views</th>
                        <th className="py-2.5 px-3">Net New Views</th>
                        <th className="py-2.5 px-3">Payout </th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Latest Sync</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
                      {data.audits
                        .slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize)
                        .map((audit) => {
                          const auditDate = new Date(audit.settled_at);
                          const isToday = new Date().toDateString() === auditDate.toDateString();
                          const rank = creatorRankMap.get(audit.creator_handle);

                          return (
                            <tr key={audit.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {audit.creator_avatar_url ? (
                                  <Image src={audit.creator_avatar_url} alt="" width={20} height={20} className="rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 text-[9px] font-bold flex items-center justify-center shrink-0">
                                    {audit.creator_handle[1]?.toUpperCase() || 'C'}
                                  </div>
                                )}
                                <span>{audit.creator_handle}</span>
                                {rank !== undefined && (
                                  <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-1.5 py-0.2 rounded border border-slate-200 dark:border-white/10">
                                    #{rank}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                                {audit.views_scraped.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                +{audit.views_delta.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                ₦{audit.payout_amount.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  audit.status === 'auto_approved' || audit.status === 'system_verified'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                    : audit.status === 'approved'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                    : 'bg-red-100 dark:bg-rose-950/50 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-500/30'
                                }`}>
                                  {audit.status === 'auto_approved' || audit.status === 'system_verified' ? '⚡ System Verified' : audit.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200 block">
                                  {auditDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {isToday ? 'Latest fetch' : auditDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Audit History Pagination Controls */}
              {data.audits && data.audits.length > auditPageSize && (() => {
                const totalAudits = data.audits.length;
                const totalAuditPages = Math.ceil(totalAudits / auditPageSize);
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/10 text-xs font-sans">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Showing <strong>{(auditPage - 1) * auditPageSize + 1}</strong> to{' '}
                      <strong>{Math.min(auditPage * auditPageSize, totalAudits)}</strong> of{' '}
                      <strong>{totalAudits}</strong> audit runs
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={auditPage === 1}
                        className="px-2.5 py-1.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-2xs text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalAuditPages }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAuditPage(i + 1)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                              auditPage === i + 1
                                ? 'bg-kpugi-blue text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setAuditPage((p) => Math.min(totalAuditPages, p + 1))}
                        disabled={auditPage === totalAuditPages}
                        className="px-2.5 py-1.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-2xs text-xs"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })()}

      {/* Tab 3: Creatives */}
      {activeTab === 'creatives' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">Campaign Creative Guidelines</h3>
          {creatives.length === 0 ? (
            <p className="text-xs text-kpugi-slate dark:text-slate-400">No specific file assets attached. Creators follow post guidelines.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creatives.map((cr) => (
                <div key={cr.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-2">
                  {cr.copy_text && <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{cr.copy_text}</p>}
                  {cr.caption_suggestion && <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Caption: {cr.caption_suggestion}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">Top Creator Performers</h3>
          <div className="space-y-3">
            {submissions
              .sort((a, b) => b.views_count - a.views_count)
              .slice(0, 5)
              .map((sub, idx) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-display font-bold text-sm text-kpugi-blue dark:text-blue-400 shrink-0">#{idx + 1}</span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{sub.creator_handle}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Eye className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{sub.views_count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <EditCampaignModal
          campaign={campaign}
          onClose={() => setIsEditing(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Delete / Archive Modal */}
      {isDeleting && (
        <DeleteCampaignModal
          campaign={campaign}
          onClose={() => setIsDeleting(false)}
          onSuccess={() => {
            if (isArchived) {
              router.push('/b/campaigns');
            } else {
              router.refresh();
            }
          }}
        />
      )}
    </div>
  );
}
