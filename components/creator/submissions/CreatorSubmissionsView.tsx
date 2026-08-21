'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { CreatorSubmissionsData, DetailedSubmissionItem } from '@/lib/supabase/creator';
import { submitCampaignVideoAction, resyncSubmissionScraperAction, deleteSubmissionLinkAction } from '@/app/actions/creator';
import { validatePostUrlOwnership } from '@/lib/utils/social-url';
import ConfirmModal from '@/components/common/ConfirmModal';
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  TwitterXIcon,
  FacebookIcon,
} from '@/components/ui/SocialIcons';
import {
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Rocket,
  RefreshCw,
  Info,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Radio,
  Eye,
  Sparkles,
} from 'lucide-react';

interface CreatorSubmissionsViewProps {
  data: CreatorSubmissionsData;
}

export default function CreatorSubmissionsView({ data }: CreatorSubmissionsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [submissionsList, setSubmissionsList] = useState<DetailedSubmissionItem[]>(data.submissions);
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'approved' | 'auditing' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('all');

  // Modals state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [rejectionModalItem, setRejectionModalItem] = useState<DetailedSubmissionItem | null>(null);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resyncingId, setResyncingId] = useState<string | null>(null);

  // Submit modal inputs
  const [selectedCampaignId, setSelectedCampaignId] = useState(data.activeCampaigns[0]?.id || '');
  const [postUrlInput, setPostUrlInput] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSubmissionsList(data.submissions);
  }, [data.submissions]);

  // Copy link helper
  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Resync scraper handler
  async function handleResync(id: string) {
    setResyncingId(id);
    const res = await resyncSubmissionScraperAction(id);
    setResyncingId(null);
    if (res.success) {
      setSubmissionsList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'auditing' } : item))
      );
    }
  }

  // Delete / Reset link handler
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ campaignId: string; submissionId: string } | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.submissionId);
    try {
      const res = await deleteSubmissionLinkAction(deleteTarget.campaignId);
      if (res.success) {
        setSubmissionsList(prev => prev.filter(s => s.id !== deleteTarget.submissionId));
        setDeleteTarget(null);
      } else {
        alert(res.error || 'Failed to remove link');
        setDeleteTarget(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove link');
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  }

  // Submit new post link handler
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Instant Anti-Fraud URL Check
    const ownershipCheck = validatePostUrlOwnership(postUrlInput);
    if (!ownershipCheck.isValid) {
      setSubmitError(ownershipCheck.error || 'Please enter a valid post link from your account.');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('campaignId', selectedCampaignId);
    formData.append('videoUrl', postUrlInput);

    const res = await submitCampaignVideoAction(formData);
    setSubmitting(false);

    if (res.success) {
      setSubmitSuccess('Post submitted successfully! Automated view audit initiated.');
      const newSub: DetailedSubmissionItem = {
        id: `sub-${Date.now()}`,
        campaignId: selectedCampaignId,
        campaignTitle: data.activeCampaigns.find((c) => c.id === selectedCampaignId)?.title || 'Campaign Submission',
        campaignCode: data.activeCampaigns.find((c) => c.id === selectedCampaignId)?.campaignCode || 'KP-CAMP-00000',
        platform: detectPlatform(postUrlInput),
        postUrl: postUrlInput,
        viewsCount: 0,
        engagementRate: 0,
        cpmRate: 3500,
        earnedAmount: 0,
        status: 'auditing',
        submittedAt: new Date().toISOString(),
      };
      setSubmissionsList((prev) => [newSub, ...prev]);
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess('');
        setPostUrlInput('');
      }, 1500);
    } else {
      setSubmitError(res.error || 'Failed to submit post URL. Please check campaign and URL.');
    }
  }

  // Platform auto-detection helper
  function detectPlatform(url: string = ''): string {
    const u = url.toLowerCase();
    if (u.includes('tiktok.com')) return 'tiktok';
    if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram';
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
    if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
    if (u.includes('threads.net')) return 'threads';
    if (u.includes('linkedin.com')) return 'linkedin';
    return 'tiktok';
  }

  // Helper to render platform icon
  function renderPlatformIcon(platformName: string, className: string = 'w-4 h-4') {
    const p = platformName.toLowerCase();
    if (p === 'tiktok') return <TikTokIcon className={className} />;
    if (p === 'instagram') return <InstagramIcon className={className} />;
    if (p === 'youtube') return <YouTubeIcon className={className} />;
    if (p === 'twitter' || p === 'x') return <TwitterXIcon className={className} />;
    if (p === 'facebook') return <FacebookIcon className={className} />;
    return <Sparkles className={`${className} text-kpugi-blue`} />;
  }

  // Filter submissions list
  const filteredSubmissions = submissionsList.filter((item) => {
    // Status filter tab
    if (selectedStatusTab === 'approved' && item.status !== 'approved') return false;
    if (selectedStatusTab === 'auditing' && item.status !== 'auditing' && item.status !== 'pending') return false;
    if (selectedStatusTab === 'rejected' && item.status !== 'rejected') return false;

    // Platform filter
    if (selectedPlatformFilter !== 'all' && item.platform.toLowerCase() !== selectedPlatformFilter.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.campaignTitle.toLowerCase().includes(q);
      const matchCode = item.campaignCode.toLowerCase().includes(q);
      const matchUrl = item.postUrl.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchUrl) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink dark:text-white pb-12 font-sans">
      {/* ─────────────────────────────────────────────────────
         HEADER & ACTION ROW
      ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-kpugi-ink dark:text-white tracking-tight">
            Submissions & Audits
          </h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
            Real-time metric verification and performance clearing across all connected platforms
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-6 py-3.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Link</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────
         TOP 4 STATS CARDS
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: TOTAL SUBMITTED */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
          <span className="font-sans text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
            Total Submitted
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink dark:text-white">
              {data.totalSubmitted}
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 2: CLEARED & APPROVED */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
          <span className="font-sans text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
            Cleared & Approved
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink dark:text-white">
              {data.approvedCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-500/20">
              {data.approvedRate}% Rate
            </span>
          </div>
        </div>

        {/* Card 3: AUDITING / VERIFICATION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
          <span className="font-sans text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
            Auditing / Verification
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink dark:text-white">
              {data.auditingCount}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-kpugi-blue dark:text-blue-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Card 4: TOTAL VERIFIED VIEWS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
          <span className="font-sans text-[11px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider">
            Total Verified Views
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink dark:text-white">
              {data.totalVerifiedViews >= 1000000
                ? `${(data.totalVerifiedViews / 1000000).toFixed(1)}M`
                : data.totalVerifiedViews.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-kpugi-slate dark:text-slate-400">
              Verified Viewport
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         FILTER & TOOLBAR CONTROL BOX
      ───────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedStatusTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'all'
                ? 'bg-kpugi-blue text-white shadow-sm'
                : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatusTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'approved'
                ? 'bg-kpugi-blue text-white shadow-sm'
                : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setSelectedStatusTab('auditing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'auditing'
                ? 'bg-kpugi-blue text-white shadow-sm'
                : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
            }`}
          >
            Auditing
          </button>
          <button
            onClick={() => setSelectedStatusTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'rejected'
                ? 'bg-kpugi-blue text-white shadow-sm'
                : 'text-kpugi-slate dark:text-slate-400 hover:text-kpugi-ink dark:hover:text-white'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Right: Search Input + Platform Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by campaign code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-sans text-kpugi-ink dark:text-white placeholder-kpugi-slate dark:placeholder-slate-400 focus:outline-none focus:border-kpugi-blue focus:bg-white dark:focus:bg-[#13151A] transition-all"
            />
          </div>

          <select
            value={selectedPlatformFilter}
            onChange={(e) => setSelectedPlatformFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-[#13151A] text-xs font-sans font-bold text-kpugi-ink dark:text-white focus:outline-none focus:border-kpugi-blue"
          >
            <option value="all" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">All Platforms</option>
            <option value="tiktok" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">TikTok</option>
            <option value="instagram" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">Instagram</option>
            <option value="youtube" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">YouTube</option>
            <option value="twitter" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">Twitter / X</option>
            <option value="facebook" className="bg-white dark:bg-[#13151A] text-kpugi-ink dark:text-white">Facebook</option>
          </select>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         SUBMISSIONS LEDGER TABLE (MATCHING MOCKUP)
      ───────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-kpugi-border dark:border-white/10 bg-slate-50/70 dark:bg-[#161820] text-[10px] font-bold text-kpugi-slate dark:text-slate-400 uppercase tracking-wider font-sans">
                <th className="py-4 px-6">Campaign & Code</th>
                <th className="py-4 px-6">Platform & URL</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kpugi-border dark:divide-white/5 text-xs font-sans">
              {filteredSubmissions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors">
                  {/* Campaign & Code */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-kpugi-ink dark:text-white text-sm">{item.campaignTitle}</div>
                    <div className="font-mono text-[11px] text-kpugi-slate dark:text-slate-400 mt-0.5">{item.campaignCode}</div>
                  </td>

                  {/* Platform & URL */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 border border-kpugi-border dark:border-white/10 flex items-center justify-center shrink-0">
                        {renderPlatformIcon(item.platform, 'w-4 h-4')}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-kpugi-ink dark:text-white capitalize block text-xs">
                          {item.platform}
                        </span>
                        <a
                          href={item.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-kpugi-blue dark:text-blue-400 font-mono hover:underline inline-flex items-center gap-1 truncate max-w-[180px] sm:max-w-[220px]"
                        >
                          <span className="truncate">{item.postUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-6">
                    {item.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider font-mono">
                        <Check className="w-3.5 h-3.5" />
                        APPROVED
                      </span>
                    ) : item.status === 'auditing' || item.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 text-[11px] font-bold uppercase tracking-wider font-mono">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        AUDITING
                      </span>
                    ) : (
                      <button
                        onClick={() => setRejectionModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-[11px] font-bold uppercase tracking-wider font-mono hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                        REJECTED
                      </button>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopy(item.postUrl, item.id)}
                        className="p-2 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                        title="Copy Link"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Resync Audit */}
                      {(item.status === 'auditing' || item.status === 'pending') && (
                        <button
                          onClick={() => handleResync(item.id)}
                          disabled={resyncingId === item.id}
                          className="p-2 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                          title="Re-sync View Audit"
                        >
                          <RefreshCw className={`w-4 h-4 ${resyncingId === item.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}

                      {/* Open Campaign Workspace */}
                      <Link
                        href={`/c/campaigns/${item.campaignId}`}
                        className="p-2 rounded-xl bg-kpugi-blue text-white hover:bg-blue-700 transition-colors shadow-xs"
                        title="Open Campaign Workspace"
                      >
                        <Rocket className="w-4 h-4" />
                      </Link>

                      {/* Delete / Reset Post Link */}
                      {item.status !== 'approved' && (
                        <button
                          onClick={() => setDeleteTarget({ campaignId: item.campaignId, submissionId: item.id })}
                          disabled={deletingId === item.id}
                          className="p-2 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
                          title="Remove Post Link & Reset Stats"
                        >
                          <Trash2 className={`w-4 h-4 ${deletingId === item.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}

                      {/* Rejection Info */}
                      {item.status === 'rejected' && (
                        <button
                          onClick={() => setRejectionModalItem(item)}
                          className="p-2 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          title="View Rejection Reason"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 mb-1">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-sm text-kpugi-ink dark:text-white">No Video Submissions Found</p>
                      <p className="text-xs text-kpugi-slate dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Submit your live video link (TikTok, Instagram Reels, YouTube Shorts) to start real-time view auditing and anti-fraud verification.
                      </p>
                      <button
                        onClick={() => setShowSubmitModal(true)}
                        className="mt-2 px-4 py-2 rounded-xl bg-kpugi-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Submit New Link</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Footer / Pagination */}
        <div className="p-4 border-t border-kpugi-border dark:border-white/10 bg-slate-50/50 dark:bg-[#161820]/40 flex items-center justify-between text-xs font-sans">
          <span className="text-kpugi-slate dark:text-slate-400 font-medium">
            Showing <strong className="text-kpugi-ink dark:text-white">{filteredSubmissions.length}</strong> of{' '}
            <strong className="text-kpugi-ink dark:text-white">{data.totalSubmitted}</strong> submissions
          </span>

          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-kpugi-blue text-white font-bold text-xs">1</button>
            <button className="w-7 h-7 rounded-lg border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 font-bold text-xs">2</button>
            <button className="p-1.5 rounded-lg border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         MODAL 1: SUBMIT NEW POST LINK (PORTALED TO BODY)
      ───────────────────────────────────────────────────── */}
      {showSubmitModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12141A] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border dark:border-white/10 text-kpugi-ink dark:text-white">
            <div>
              <h3 className="font-display font-bold text-xl text-kpugi-ink dark:text-white">Submit Campaign Post</h3>
              <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 mt-1">
                Paste your post URL (TikTok, Instagram, YouTube, X/Twitter, Facebook, Threads, LinkedIn). View audit will begin shortly.
              </p>
            </div>

            {submitError && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-500/30">{submitError}</p>}
            {submitSuccess && <p className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20">{submitSuccess}</p>}

            {(() => {
              const availableCampaigns = data.activeCampaigns.filter(
                (camp) => !submissionsList.some((s) => s.campaignId === camp.id && s.postUrl && s.status !== 'rejected')
              );

              if (availableCampaigns.length === 0) {
                return (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center space-y-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <h4 className="font-display font-bold text-sm text-kpugi-ink dark:text-white">All Campaign Posts Active</h4>
                    <p className="text-xs text-kpugi-slate dark:text-slate-400 leading-relaxed">
                      You have already submitted post links for all joined campaigns. Automated hourly view audits are currently running.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="w-full py-2.5 rounded-xl bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                    >
                      Close
                    </button>
                  </div>
                );
              }

              return (
                <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block text-xs font-bold text-kpugi-slate dark:text-slate-400 mb-1 uppercase tracking-wider">
                      Select Campaign
                    </label>
                    <select
                      value={selectedCampaignId || availableCampaigns[0]?.id}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-white/10 font-sans text-xs focus:outline-none focus:border-kpugi-blue bg-white dark:bg-white/5 font-bold text-slate-900 dark:text-white"
                      required
                    >
                      {availableCampaigns.map((camp) => (
                        <option key={camp.id} value={camp.id} className="bg-white dark:bg-[#12141A] text-slate-900 dark:text-white">
                          {camp.title} ({camp.campaignCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-kpugi-slate dark:text-slate-400 mb-1 uppercase tracking-wider">
                      Post URL Link
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        placeholder="https://tiktok.com/@user/video/... or https://x.com/..."
                        value={postUrlInput}
                        onChange={(e) => setPostUrlInput(e.target.value)}
                        required
                        className="w-full pl-4 pr-10 py-3.5 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-xs text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-kpugi-blue focus:ring-4 focus:ring-kpugi-blue/10 transition-all shadow-sm"
                      />
                      {postUrlInput && (
                        <div className="absolute right-3">
                          {renderPlatformIcon(detectPlatform(postUrlInput), 'w-4 h-4')}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-kpugi-slate dark:text-slate-400 mt-1 block">
                      Detected Platform: <strong className="text-kpugi-ink dark:text-white uppercase">{detectPlatform(postUrlInput)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="w-1/2 py-3 rounded-xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-kpugi-slate dark:text-slate-300 hover:text-kpugi-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-sans text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-1/2 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-kpugi-blue/20"
                    >
                      {submitting ? 'Submitting...' : 'Submit Post Link'}
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 2: REJECTION REASON DETAILS (PORTALED TO BODY)
      ───────────────────────────────────────────────────── */}
      {rejectionModalItem && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12141A] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border dark:border-white/10 text-kpugi-ink dark:text-white">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-kpugi-ink dark:text-white">Submission Audit Issue</h3>
                <span className="font-mono text-xs text-kpugi-slate dark:text-slate-400">{rejectionModalItem.campaignCode}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 space-y-2">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 block uppercase tracking-wider">Verification Audit Report:</span>
              <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed font-sans">
                {rejectionModalItem.rejectionReason || 'Video settings set to private or post URL unreachable by verification auditors. Switch post visibility to public and resubmit.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalItem(null)}
                className="w-full py-3 rounded-xl bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 font-sans text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal: Delete / Reset Post Link */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Post Link?"
        description="All verified stats and views for this post link will be reset to 0. You will return to the Joined state so you can submit a new link afresh."
        confirmText="Remove Link & Reset"
        cancelText="Keep Post Link"
        variant="danger"
        isLoading={Boolean(deletingId)}
        theme="light"
      />
    </div>
  );
}
