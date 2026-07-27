'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { CreatorSubmissionsData, DetailedSubmissionItem } from '@/lib/supabase/creator';
import { submitCampaignVideoAction, resyncSubmissionScraperAction } from '@/app/actions/creator';
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

  // Submit new post link handler
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    const formData = new FormData();
    formData.append('campaignId', selectedCampaignId);
    formData.append('videoUrl', postUrlInput);

    const res = await submitCampaignVideoAction(formData);
    setSubmitting(false);

    if (res.success) {
      setSubmitSuccess('Post submitted successfully! Scraper audit initiated.');
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
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink pb-12 font-sans">
      {/* ─────────────────────────────────────────────────────
         HEADER & ACTION ROW
      ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-kpugi-ink tracking-tight">
            Submissions & Audits
          </h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
            Real-time scraper verification and performance clearing across all connected platforms
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
         TOP STATS CARDS ROW (4 CARDS MATCHING MOCKUP)
      ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: TOTAL POSTS SUBMITTED */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex flex-col justify-between space-y-4">
          <span className="font-sans text-[11px] font-bold text-kpugi-slate uppercase tracking-wider">
            Total Posts Submitted
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink">
              {data.totalSubmitted}
            </span>
            <span className="text-[11px] font-bold text-kpugi-blue bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              +{data.submittedThisWeek} this week
            </span>
          </div>
        </div>

        {/* Card 2: CLEARED & APPROVED */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex flex-col justify-between space-y-4">
          <span className="font-sans text-[11px] font-bold text-kpugi-slate uppercase tracking-wider">
            Cleared & Approved
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink">
              {data.approvedCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {data.approvedRate}% Rate
            </span>
          </div>
        </div>

        {/* Card 3: AUDITING / PENDING SCRAPER */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex flex-col justify-between space-y-4">
          <span className="font-sans text-[11px] font-bold text-kpugi-slate uppercase tracking-wider">
            Auditing / Pending Scraper
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink">
              {data.auditingCount}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-kpugi-blue animate-pulse" />
            </div>
          </div>
        </div>

        {/* Card 4: TOTAL VERIFIED VIEWS */}
        <div className="p-6 rounded-3xl bg-white border border-kpugi-border shadow-xs flex flex-col justify-between space-y-4">
          <span className="font-sans text-[11px] font-bold text-kpugi-slate uppercase tracking-wider">
            Total Verified Views
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono font-extrabold text-3xl text-kpugi-ink">
              {(data.totalVerifiedViews / 1000000).toFixed(1)}M
            </span>
            <span className="text-[11px] font-bold text-kpugi-slate">
              Verified Viewport
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         FILTER & TOOLBAR CONTROL BOX
      ───────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-kpugi-border shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedStatusTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'all'
                ? 'bg-kpugi-blue text-white shadow-sm'
                : 'text-kpugi-slate hover:text-kpugi-ink'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatusTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'approved'
                ? 'bg-kpugi-blue text-white shadow-sm'
                : 'text-kpugi-slate hover:text-kpugi-ink'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setSelectedStatusTab('auditing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'auditing'
                ? 'bg-kpugi-blue text-white shadow-sm'
                : 'text-kpugi-slate hover:text-kpugi-ink'
            }`}
          >
            Auditing
          </button>
          <button
            onClick={() => setSelectedStatusTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'rejected'
                ? 'bg-kpugi-blue text-white shadow-sm'
                : 'text-kpugi-slate hover:text-kpugi-ink'
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kpugi-border bg-slate-50 text-xs font-sans focus:outline-none focus:border-kpugi-blue focus:bg-white transition-all"
            />
          </div>

          <select
            value={selectedPlatformFilter}
            onChange={(e) => setSelectedPlatformFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-kpugi-border bg-white text-xs font-sans font-bold text-kpugi-ink focus:outline-none focus:border-kpugi-blue"
          >
            <option value="all">All Platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter / X</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         SUBMISSIONS LEDGER TABLE (MATCHING MOCKUP)
      ───────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white border border-kpugi-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-kpugi-border bg-slate-50/70 text-[10px] font-bold text-kpugi-slate uppercase tracking-wider font-sans">
                <th className="py-4 px-6">Campaign & Code</th>
                <th className="py-4 px-6">Platform & URL</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kpugi-border text-xs font-sans">
              {filteredSubmissions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Campaign & Code */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-kpugi-ink text-sm">{item.campaignTitle}</div>
                    <div className="font-mono text-[11px] text-kpugi-slate mt-0.5">{item.campaignCode}</div>
                  </td>

                  {/* Platform & URL */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-kpugi-border flex items-center justify-center shrink-0">
                        {renderPlatformIcon(item.platform, 'w-4 h-4')}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-kpugi-ink capitalize block text-xs">
                          {item.platform}
                        </span>
                        <a
                          href={item.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-kpugi-blue font-mono hover:underline inline-flex items-center gap-1 truncate max-w-[180px] sm:max-w-[220px]"
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider font-mono">
                        <Check className="w-3.5 h-3.5" />
                        APPROVED
                      </span>
                    ) : item.status === 'auditing' || item.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-kpugi-blue border border-blue-200 text-[11px] font-bold uppercase tracking-wider font-mono">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        AUDITING
                      </span>
                    ) : (
                      <button
                        onClick={() => setRejectionModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold uppercase tracking-wider font-mono hover:bg-red-100 transition-colors"
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
                        className="p-2 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-50 transition-colors"
                        title="Copy Link"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Resync Scraper */}
                      {(item.status === 'auditing' || item.status === 'pending') && (
                        <button
                          onClick={() => handleResync(item.id)}
                          disabled={resyncingId === item.id}
                          className="p-2 rounded-xl border border-kpugi-border bg-white text-kpugi-blue hover:bg-blue-50 transition-colors disabled:opacity-50"
                          title="Re-sync Scraper Audit"
                        >
                          <RefreshCw className={`w-4 h-4 ${resyncingId === item.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}

                      {/* Open Campaign Workspace */}
                      <Link
                        href={`/campaigns`}
                        className="p-2 rounded-xl bg-kpugi-blue text-white hover:bg-blue-700 transition-colors shadow-xs"
                        title="Open Campaign Workspace"
                      >
                        <Rocket className="w-4 h-4" />
                      </Link>

                      {/* Rejection Info */}
                      {item.status === 'rejected' && (
                        <button
                          onClick={() => setRejectionModalItem(item)}
                          className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
                  <td colSpan={4} className="py-12 text-center text-kpugi-slate font-sans text-xs">
                    No submissions found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Footer / Pagination */}
        <div className="p-4 border-t border-kpugi-border bg-slate-50/50 flex items-center justify-between text-xs font-sans">
          <span className="text-kpugi-slate font-medium">
            Showing <strong className="text-kpugi-ink">{filteredSubmissions.length}</strong> of{' '}
            <strong className="text-kpugi-ink">{data.totalSubmitted}</strong> submissions
          </span>

          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-kpugi-border bg-white text-kpugi-slate hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-kpugi-blue text-white font-bold text-xs">1</button>
            <button className="w-7 h-7 rounded-lg border border-kpugi-border bg-white text-kpugi-slate hover:bg-slate-50 font-bold text-xs">2</button>
            <button className="p-1.5 rounded-lg border border-kpugi-border bg-white text-kpugi-slate hover:bg-slate-50">
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border">
            <div>
              <h3 className="font-display font-bold text-xl text-kpugi-ink">Submit Campaign Post</h3>
              <p className="font-sans text-xs text-kpugi-slate mt-1">
                Paste your post URL (TikTok, Instagram, YouTube, X/Twitter, Facebook, Threads, LinkedIn). Scraper audit will begin instantly.
              </p>
            </div>

            {submitError && <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">{submitError}</p>}
            {submitSuccess && <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">{submitSuccess}</p>}

            <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">
                  Select Campaign
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-kpugi-border font-sans text-xs focus:outline-none focus:border-kpugi-blue bg-white font-bold"
                  required
                >
                  {data.activeCampaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title} ({camp.campaignCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1 uppercase tracking-wider">
                  Post URL Link
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@user/video/..."
                    value={postUrlInput}
                    onChange={(e) => setPostUrlInput(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-kpugi-border font-mono text-xs focus:outline-none focus:border-kpugi-blue bg-slate-50"
                  />
                  {postUrlInput && (
                    <div className="absolute right-3">
                      {renderPlatformIcon(detectPlatform(postUrlInput), 'w-4 h-4')}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-kpugi-slate mt-1 block">
                  Detected Platform: <strong className="text-kpugi-ink uppercase">{detectPlatform(postUrlInput)}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-kpugi-border bg-white text-kpugi-slate hover:text-kpugi-ink hover:bg-slate-50 font-sans text-xs font-bold transition-all"
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
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────
         MODAL 2: REJECTION REASON DETAILS (PORTALED TO BODY)
      ───────────────────────────────────────────────────── */}
      {rejectionModalItem && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-kpugi-border">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-kpugi-ink">Submission Audit Issue</h3>
                <span className="font-mono text-xs text-kpugi-slate">{rejectionModalItem.campaignCode}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-2">
              <span className="text-xs font-bold text-red-900 block uppercase tracking-wider">Scraper Error Report:</span>
              <p className="text-xs text-red-800 leading-relaxed font-sans">
                {rejectionModalItem.rejectionReason || 'Video settings set to private or post URL unreachable by anti-fraud scrapers. Switch post visibility to public and resubmit.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalItem(null)}
                className="w-full py-3 rounded-xl bg-kpugi-ink text-white font-sans text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
