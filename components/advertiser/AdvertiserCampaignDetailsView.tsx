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
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowLeft,
  DollarSign,
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
import { updateCampaignStatusAction, reviewCreatorSubmissionAction } from '@/app/actions/advertiser';
import { EditCampaignModal } from '@/components/campaign/EditCampaignModal';
import { DeleteCampaignModal } from '@/components/campaign/DeleteCampaignModal';

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
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { campaign, creatives, submissions, metrics } = data;

  if (!campaign) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-kpugi-border">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="font-display text-lg font-bold">Campaign Not Found</h2>
        <p className="text-xs text-kpugi-slate mt-1">This campaign may have been removed or you do not have permission to access it.</p>
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

  const handleReviewDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedSubmission) return;
    setIsSubmitting(true);
    setMsg(null);

    const formData = new FormData();
    formData.append('submissionId', selectedSubmission.id);
    formData.append('decision', decision);
    if (decision === 'reject') formData.append('rejectionReason', rejectionReason);

    const res = await reviewCreatorSubmissionAction(formData);
    setIsSubmitting(false);
    setSelectedSubmission(null);
    setRejectionReason('');

    if (res.success) {
      setMsg({ text: `Submission ${decision === 'approve' ? 'Approved & Paid' : 'Rejected'}.`, type: 'success' });
      router.refresh();
    } else {
      setMsg({ text: res.error || 'Failed to process submission review', type: 'error' });
    }
  };

  const progressPercent = Math.min(100, Math.round((campaign.spent_budget / campaign.total_budget) * 100));
  const minThreshold = campaign.min_view_threshold || 1000;
  const baseSlotReserve = Math.round((minThreshold / 1000) * campaign.cpm_rate);

  // Reserves are strictly for first-joiners awaiting minimum view threshold
  const totalReservedAmount = submissions.reduce((sum, s) => {
    const subViews = Number(s.views_count || s.final_view_count || 0);
    const totalPaid = Number(s.payout_amount || 0);
    const hasPassed = subViews >= minThreshold || totalPaid > 0;
    if (hasPassed) return sum;

    return sum + baseSlotReserve;
  }, 0);

  const isArchived = campaign.status === 'archived';
  const isCompleted = campaign.status === 'completed';

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/b/campaigns" className="text-kpugi-slate hover:text-kpugi-ink transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {campaign.campaign_code || 'KPG-CMP'}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              campaign.status === 'live' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              campaign.status === 'paused' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              campaign.status === 'completed' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
              campaign.status === 'archived' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
              'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
              {campaign.status}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink">{campaign.title}</h1>
          <p className="text-xs sm:text-sm text-kpugi-slate line-clamp-2">{campaign.description}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isArchived ? (
            <>
              {/* Play/Pause Disabled */}
              <button
                disabled
                className="group relative h-9 px-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50 shadow-2xs"
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
                className="group relative h-9 px-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50 shadow-2xs"
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
                className="group relative h-9 px-2.5 rounded-xl border border-slate-200 text-slate-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50"
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
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 text-rose-600 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-2xs"
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
                className="group relative h-9 px-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50 shadow-2xs"
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
                className="group relative h-9 px-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50 shadow-2xs"
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
                className="group relative h-9 px-2.5 rounded-xl border border-slate-200 text-slate-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-50"
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
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-amber-700 hover:border-amber-300 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-2xs"
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
                  className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-2xs"
                  title="Pause Campaign"
                >
                  <Pause className="w-4 h-4 shrink-0 text-amber-700" />
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
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden shadow-sm"
                title="Complete & Refund Remaining Escrow"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
                  Complete & Refund
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-kpugi-blue hover:border-slate-300 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden"
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
                className="group relative h-9 px-2.5 hover:px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-amber-700 hover:border-amber-300 font-bold text-xs transition-all duration-300 ease-in-out flex items-center gap-2 overflow-hidden"
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
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* 6 Core Live Reach Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

        {/* 1. Total Views */}
        <div className="p-4 rounded-2xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-kpugi-blue">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate">Total Views</span>
            <Eye className="w-3.5 h-3.5 text-kpugi-blue" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink">
            {metrics.totalViews.toLocaleString()}
          </p>
          <span className="text-[9px] text-emerald-600 font-medium block">Real-time aggregate</span>
        </div>

        {/* 2. Total Payouts */}
        <div className="p-4 rounded-2xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate">Total Payouts</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink">
            ₦{metrics.totalPayouts.toLocaleString()}
          </p>
          <span className="text-[9px] text-slate-500 font-medium block">Released from Escrow</span>
        </div>

        {/* 3. Creators Joined */}
        <div className="p-4 rounded-2xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate">Creators Joined</span>
            <Users className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink">
            {submissions.length}
          </p>
          <span className="text-[9px] text-indigo-600 font-medium block">Active slots locked</span>
        </div>

        {/* 4. Submissions */}
        <div className="p-4 rounded-2xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate">Submissions</span>
            <Video className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink">
            {submissions.filter((s) => s.post_url != null && s.status !== 'joined').length}
          </p>
          <span className="text-[9px] text-amber-600 font-medium block">Verified & Pending</span>
        </div>

        {/* 5. Engagement */}
        <div className="p-4 rounded-2xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate">Engagement</span>
            <Activity className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink">
            {metrics.engagementRate}%
          </p>
          <span className="text-[9px] text-slate-500 font-medium block">Like & Comment ratio</span>
        </div>

        {/* 6. Avg Watch Time */}
        <div className="p-4 rounded-2xl bg-white border border-kpugi-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-cyan-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kpugi-slate">Avg Watch Time</span>
            <Zap className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <p className="font-display text-lg sm:text-xl font-black text-kpugi-ink">
            {metrics.totalViews > 0 && metrics.avgWatchTime > 0 ? `${metrics.avgWatchTime}s` : '0s'}
          </p>
          <span className="text-[9px] text-cyan-600 font-medium block">Retention benchmark</span>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-kpugi-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-kpugi-ink text-white shadow-sm' : 'text-kpugi-slate hover:bg-slate-100'
          }`}
        >
          Performance Overview
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'submissions' ? 'bg-kpugi-ink text-white shadow-sm' : 'text-kpugi-slate hover:bg-slate-100'
          }`}
        >
          <span>Creator Submissions</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {submissions.filter((s) => s.post_url != null && s.status !== 'joined').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('creatives')}
          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'creatives' ? 'bg-kpugi-ink text-white shadow-sm' : 'text-kpugi-slate hover:bg-slate-100'
          }`}
        >
          Creative Assets & Guidelines
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-kpugi-ink text-white shadow-sm' : 'text-kpugi-slate hover:bg-slate-100'
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
              <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-kpugi-ink">Budget Allocation</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    🛡️ SECURED
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-kpugi-slate">
                    <span>Spent: ₦{campaign.spent_budget.toLocaleString()}</span>
                    <span>Total Budget: ₦{campaign.total_budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Rate CPM</span>
                    <span className="font-bold text-slate-900 text-xs">₦{campaign.cpm_rate.toLocaleString()} / 1k</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Min Threshold</span>
                    <span className="font-bold text-slate-900 text-xs">{campaign.min_view_threshold.toLocaleString()} views</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Reserved Balance</span>
                    <span className="font-bold text-amber-700 text-xs">₦{(campaign.reserved_budget || totalReservedAmount).toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Audit Duration</span>
                    <span className="font-bold text-slate-900 text-xs">{metrics.auditDurationHours}h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Target Channels & Specs */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
                <h3 className="font-display font-bold text-base text-kpugi-ink">Target Channels</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.channels.map((ch) => (
                    <span key={ch} className="px-3 py-1.5 rounded-xl bg-kpugi-blue/10 text-kpugi-blue text-xs font-bold uppercase flex items-center gap-1.5">
                      <span>{ch}</span>
                    </span>
                  ))}
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Required Live Retention:</span>
                    <span className="font-bold text-slate-900">{campaign.required_live_duration_hours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Verification Grace Window:</span>
                    <span className="font-bold text-slate-900">{campaign.verification_grace_hours}h</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Dedicated Section: Joined Creators & Reserved Escrow Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-lg text-kpugi-ink flex items-center gap-2">
                  <Users className="w-5 h-5 text-kpugi-blue" />
                  <span>Joined Creators</span>
                </h3>
                <p className="text-xs text-kpugi-slate mt-0.5">
                  Central ledger of joined creators, tracking cumulative verified views delivered and total payout released.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs font-bold shrink-0">
                Total Reserved: ₦{totalReservedAmount.toLocaleString()}
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="py-8 text-center text-kpugi-slate space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold">No creators have joined this campaign slot yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Joined Creator</th>
                      <th className="py-3 px-3">Platform</th>
                      <th className="py-3 px-3">Cumulative Verified Views</th>
                      <th className="py-3 px-3 text-right">Total Earned / Payout Released</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => {
                      const verifiedViews = Number(sub.views_count || sub.final_view_count || 0);
                      const totalPaid = Number(sub.payout_amount || 0);
                      const hasPassedMin = verifiedViews >= minThreshold || totalPaid > 0;

                      // Reserve applies strictly to first-joiners prior to passing minimum view threshold
                      const slotReserve = hasPassedMin ? 0 : baseSlotReserve;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                            {sub.creator_avatar_url ? (
                              <Image src={sub.creator_avatar_url} alt="" width={24} height={24} className="rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-kpugi-blue/10 text-kpugi-blue text-[10px] font-bold flex items-center justify-center">
                                {sub.creator_handle[1]?.toUpperCase() || 'C'}
                              </div>
                            )}
                            <span>{sub.creator_handle}</span>
                          </td>
                          <td className="py-3 px-3 uppercase text-[11px] font-bold text-slate-600">
                            {sub.social_account_platform}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {verifiedViews.toLocaleString()} views
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            {totalPaid > 0 ? (
                              <span className="text-emerald-600 font-extrabold">
                                ₦{totalPaid.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">
                                ₦0{' '}
                                <span className="text-[10px] text-amber-700 font-mono ml-1">
                                  (₦{slotReserve.toLocaleString()} reserved)
                                </span>
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
          <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-kpugi-ink">Creator Submissions Stream</h3>
              <span className="text-xs text-kpugi-slate font-medium">
                {activeSubmissions.length} active submission{activeSubmissions.length === 1 ? '' : 's'}
              </span>
            </div>

            {activeSubmissions.length === 0 ? (
              <div className="py-12 text-center text-kpugi-slate space-y-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                <Video className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No post links submitted by creators yet.</p>
                <p className="text-[11px] text-slate-500">
                  Joined creators who reserved slots are listed under <strong className="text-slate-700">Joined Creators</strong> in the Performance Overview tab.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Creator</th>
                      <th className="py-3 px-3">Platform</th>
                      <th className="py-3 px-3">Post Link</th>
                      <th className="py-3 px-3">Views Count</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeSubmissions.map((sub) => {
                      const subViews = Number(sub.views_count || sub.final_view_count || 0);
                      const minThreshold = campaign.min_view_threshold || 1000;
                      const isBelowMin = sub.status === 'pending' && subViews < minThreshold;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                            {sub.creator_avatar_url ? (
                              <Image src={sub.creator_avatar_url} alt="" width={24} height={24} className="rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-kpugi-blue/10 text-kpugi-blue text-[10px] font-bold flex items-center justify-center">
                                {sub.creator_handle[1]?.toUpperCase() || 'C'}
                              </div>
                            )}
                            <span>{sub.creator_handle}</span>
                          </td>
                          <td className="py-3 px-3 uppercase text-[11px] font-bold text-slate-600">
                            {sub.social_account_platform}
                          </td>
                          <td className="py-3 px-3">
                            {sub.post_url ? (
                              <a
                                href={sub.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-kpugi-blue hover:underline font-medium flex items-center gap-1 max-w-[180px] truncate"
                              >
                                <span>View Video</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">Slot Locked (No Link Yet)</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {subViews.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              sub.status === 'auditing' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              sub.status === 'joined' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                              isBelowMin ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {sub.status === 'joined' ? 'Slot Locked' :
                               isBelowMin ? 'Awaiting Min Views' :
                               sub.status === 'auditing' ? 'Auditing Run' : sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {sub.post_url ? (
                              <button
                                onClick={() => setSelectedSubmission(sub)}
                                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors"
                              >
                                Review
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic">Awaiting Post</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Settled Audit Cycles History */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-kpugi-ink flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Settled Audit Cycles History</span>
                </h4>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {data.audits?.length || 0} Settled Runs
                </span>
              </div>

              {(!data.audits || data.audits.length === 0) ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-kpugi-slate">
                  No settled audit runs yet for this campaign. As 60-min audit cycles complete or receive approval, settled runs will populate here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Creator</th>
                        <th className="py-2.5 px-3">Views Scraped</th>
                        <th className="py-2.5 px-3">Net New Views</th>
                        <th className="py-2.5 px-3">Payout Released</th>
                        <th className="py-2.5 px-3">Settlement Type</th>
                        <th className="py-2.5 px-3 text-right">Settled At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {data.audits.map((audit) => (
                        <tr key={audit.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                            {audit.creator_avatar_url ? (
                              <Image src={audit.creator_avatar_url} alt="" width={20} height={20} className="rounded-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-kpugi-blue/10 text-kpugi-blue text-[9px] font-bold flex items-center justify-center">
                                {audit.creator_handle[1]?.toUpperCase() || 'C'}
                              </div>
                            )}
                            <span>{audit.creator_handle}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            {audit.views_scraped.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                            +{audit.views_delta.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            ₦{audit.payout_amount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              audit.status === 'auto_approved'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : audit.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {audit.status === 'auto_approved' ? '⚡ 60-Min Auto-Credited' : audit.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-500">
                            {new Date(audit.settled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      })()}

      {/* Review Modal */}
      {selectedSubmission && (() => {
        const selectedViews = Number(selectedSubmission.views_count || selectedSubmission.final_view_count || 0);
        const minThreshold = campaign.min_view_threshold || 1000;
        const isBelowMinViews = selectedViews < minThreshold || selectedViews === 0;

        const modalContent = (
          <div className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 min-h-screen w-screen overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-kpugi-border my-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-kpugi-ink">Review Creator Submission</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-kpugi-slate">
                Creator <span className="font-bold text-kpugi-ink">{selectedSubmission.creator_handle}</span> delivered{' '}
                <span className="font-bold text-kpugi-ink">{selectedViews.toLocaleString()} views</span>.
              </p>

              {isBelowMinViews ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Awaiting Minimum View Threshold ({selectedViews.toLocaleString()} / {minThreshold.toLocaleString()} views)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This submission has not reached the campaign minimum threshold of <strong>{minThreshold.toLocaleString()} views</strong> required for payout approval. Payout verification activates automatically once views reach the minimum threshold.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-amber-800">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>60-Min Review Window</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300">
                      {selectedSubmission.auto_approve_at ? (
                        (() => {
                          const diff = Math.max(0, Math.floor((new Date(selectedSubmission.auto_approve_at).getTime() - Date.now()) / 1000));
                          const m = Math.floor(diff / 60);
                          const s = diff % 60;
                          return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
                        })()
                      ) : (
                        '59m 59s'
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Views are verified every 60 mins. If you do not manually reject or approve within this 60-min audit run, payout will <strong>auto-credit to the creator&apos;s balance</strong> automatically.
                  </p>
                  {selectedSubmission.pending_payout_amount > 0 && (
                    <div className="pt-1 flex items-center justify-between text-xs font-bold text-emerald-800 border-t border-amber-200">
                      <span>Audit Run Pending Payout:</span>
                      <span className="font-mono text-sm">₦{Number(selectedSubmission.pending_payout_amount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedSubmission.post_url && (
                <a
                  href={selectedSubmission.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 block text-xs font-bold text-kpugi-blue hover:underline flex items-center justify-between"
                >
                  <span>Open Video Link in New Tab</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Rejection Reason (if rejecting)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify why submission is invalid (e.g. video removed, missing sound track)..."
                  className="w-full p-3 rounded-xl border border-kpugi-border text-xs focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleReviewDecision('approve')}
                  disabled={isSubmitting || isBelowMinViews}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm ${
                    isBelowMinViews
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title={isBelowMinViews ? 'Cannot approve payout for 0 or sub-threshold views' : undefined}
                >
                  Approve & Pay Now
                </button>
                <button
                  onClick={() => handleReviewDecision('reject')}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Reject Submission
                </button>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full py-2 text-xs text-slate-500 font-bold hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        );

        return mounted ? createPortal(modalContent, document.body) : modalContent;
      })()}

      {/* Tab 3: Creatives */}
      {activeTab === 'creatives' && (
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
          <h3 className="font-display font-bold text-lg text-kpugi-ink">Campaign Creative Guidelines</h3>
          {creatives.length === 0 ? (
            <p className="text-xs text-kpugi-slate">No specific file assets attached. Creators follow post guidelines.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creatives.map((cr) => (
                <div key={cr.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  {cr.copy_text && <p className="text-xs text-slate-800 font-medium">{cr.copy_text}</p>}
                  {cr.caption_suggestion && <p className="text-[11px] font-mono text-slate-500">Caption: {cr.caption_suggestion}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
          <h3 className="font-display font-bold text-lg text-kpugi-ink">Top Creator Performers</h3>
          <div className="space-y-3">
            {submissions
              .sort((a, b) => b.views_count - a.views_count)
              .slice(0, 5)
              .map((sub, idx) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-sm text-kpugi-blue">#{idx + 1}</span>
                    <span className="font-bold text-xs text-slate-900">{sub.creator_handle}</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-600">{sub.views_count.toLocaleString()} Views Delivered</span>
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
