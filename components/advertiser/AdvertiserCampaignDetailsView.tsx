'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import { BrandCampaignDetails } from '@/lib/supabase/advertiser';
import { updateCampaignStatusAction, reviewCreatorSubmissionAction } from '@/app/actions/advertiser';

interface AdvertiserCampaignDetailsViewProps {
  data: BrandCampaignDetails;
  campaignId: string;
}

export default function AdvertiserCampaignDetailsView({
  data,
  campaignId,
}: AdvertiserCampaignDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'creatives' | 'leaderboard'>('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
    } else {
      setMsg({ text: res.error || 'Failed to process submission review', type: 'error' });
    }
  };

  const progressPercent = Math.min(100, Math.round((campaign.spent_budget / campaign.total_budget) * 100));

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
          {campaign.status === 'live' ? (
            <button
              onClick={() => handleStatusToggle('paused')}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Campaign</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusToggle('live')}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Campaign</span>
            </button>
          )}

          {campaign.status !== 'completed' && (
            <button
              onClick={() => handleStatusToggle('completed')}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all shadow-sm"
            >
              Complete & Refund
            </button>
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
            {metrics.creatorsJoined}
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
            {metrics.totalSubmissions}
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
            {metrics.avgWatchTime}s
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
            {submissions.length}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Budget & Escrow Allocation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-kpugi-ink">Budget & Escrow Allocation</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  🛡️ SECURED IN ESCROW
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
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Reserved</span>
                  <span className="font-bold text-amber-700 text-xs">₦{metrics.reservedBudget.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Audit Duration</span>
                  <span className="font-bold text-slate-900 text-xs">{metrics.auditDurationHours}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Channels & Verification Specs */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-kpugi-ink">Target Channels & Specs</h3>
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
      )}

      {/* Tab 2: Submissions Stream */}
      {activeTab === 'submissions' && (
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-kpugi-ink">Creator Submissions Stream</h3>
            <span className="text-xs text-kpugi-slate font-medium">{submissions.length} total posts submitted</span>
          </div>

          {submissions.length === 0 ? (
            <div className="py-12 text-center text-kpugi-slate space-y-2">
              <Video className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">No submissions yet for this campaign.</p>
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
                  {submissions.map((sub) => (
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
                          <span className="text-slate-400">No URL</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {sub.views_count.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          sub.status === 'verified_pass' || sub.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          sub.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-kpugi-border">
            <h3 className="font-display font-bold text-lg text-kpugi-ink">Review Creator Submission</h3>
            <p className="text-xs text-kpugi-slate">
              Creator <span className="font-bold text-kpugi-ink">{selectedSubmission.creator_handle}</span> submitted a post with {selectedSubmission.views_count.toLocaleString()} views.
            </p>

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
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                Approve & Pay
              </button>
              <button
                onClick={() => handleReviewDecision('reject')}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
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
      )}

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

    </div>
  );
}
