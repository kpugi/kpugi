'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Plus, Megaphone, ArrowRight, Eye, Users, ChevronRight, ChevronDown, Pencil, Archive, Trash2, LayoutGrid, List } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils/format';
import { AdvertiserCampaign } from '@/lib/supabase/advertiser';
import { EditCampaignModal } from '@/components/campaign/EditCampaignModal';
import { DeleteCampaignModal } from '@/components/campaign/DeleteCampaignModal';
import { TikTokIcon, InstagramIcon, YouTubeIcon, FacebookIcon, TwitterXIcon, LinkedInIcon } from '@/components/ui/SocialIcons';

interface AdvertiserCampaignsViewProps {
  campaigns: AdvertiserCampaign[];
}

function getStatusCardStyles(status: string) {
  switch (status.toLowerCase()) {
    case 'live':
      return {
        cardBg: 'bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/20 dark:from-emerald-950/30 dark:via-[#12141A] dark:to-emerald-950/10',
        border: 'border-emerald-300/80 dark:border-emerald-500/30 shadow-2xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-400',
        badge: 'bg-emerald-500 text-white font-bold tracking-wide border border-emerald-600 shadow-2xs',
        codeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-500/30',
        progressBg: 'bg-emerald-500',
      };
    case 'paused':
      return {
        cardBg: 'bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-[#12141A] dark:to-amber-950/10',
        border: 'border-amber-300/80 dark:border-amber-500/30 shadow-2xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-400',
        badge: 'bg-amber-500 text-white font-bold border border-amber-600 shadow-2xs',
        codeBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/20 dark:border-amber-500/30',
        progressBg: 'bg-amber-500',
      };
    case 'completed':
      return {
        cardBg: 'bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/20 dark:from-indigo-950/30 dark:via-[#12141A] dark:to-indigo-950/10',
        border: 'border-indigo-300/80 dark:border-indigo-500/30 shadow-2xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-400',
        badge: 'bg-indigo-600 text-white font-bold border border-indigo-700 shadow-2xs',
        codeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 dark:border-indigo-500/30',
        progressBg: 'bg-indigo-600',
      };
    case 'draft':
      return {
        cardBg: 'bg-gradient-to-br from-purple-50/50 via-white to-slate-50/20 dark:from-purple-950/30 dark:via-[#12141A] dark:to-purple-950/10',
        border: 'border-purple-200/80 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-400',
        badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-500/30',
        codeBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
        progressBg: 'bg-purple-400',
      };
    case 'archived':
    case 'cancelled':
      return {
        cardBg: 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 dark:from-rose-950/30 dark:via-[#12141A] dark:to-rose-950/10',
        border: 'border-rose-300/90 dark:border-rose-500/30 shadow-2xs hover:border-rose-400 dark:hover:border-rose-400',
        badge: 'bg-rose-600 text-white font-bold tracking-wide border border-rose-700 shadow-2xs',
        codeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
        progressBg: 'bg-rose-500',
      };
    default:
      return {
        cardBg: 'bg-white dark:bg-[#12141A]',
        border: 'border-kpugi-border dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20',
        badge: 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10',
        codeBg: 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10',
        progressBg: 'bg-slate-500',
      };
  }
}

function renderNetworkIcon(channel: string) {
  const p = channel?.toLowerCase() || '';
  if (p.includes('tiktok')) {
    return (
      <span key={channel} title="TikTok" className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
        <TikTokIcon className="w-3 h-3 fill-current" />
      </span>
    );
  }
  if (p.includes('instagram') || p.includes('ig')) {
    return (
      <span key={channel} title="Instagram" className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
        <InstagramIcon className="w-3 h-3 stroke-current" />
      </span>
    );
  }
  if (p.includes('youtube') || p.includes('yt') || p.includes('shorts')) {
    return (
      <span key={channel} title="YouTube" className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
        <YouTubeIcon className="w-3 h-3 fill-current" />
      </span>
    );
  }
  if (p.includes('twitter') || p.includes('x')) {
    return (
      <span key={channel} title="X" className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
        <TwitterXIcon className="w-3 h-3 fill-current" />
      </span>
    );
  }
  if (p.includes('facebook') || p.includes('fb')) {
    return (
      <span key={channel} title="Facebook" className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
        <FacebookIcon className="w-3 h-3 fill-current" />
      </span>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <span key={channel} title="LinkedIn" className="w-5 h-5 rounded-md bg-[#0A66C2] text-white flex items-center justify-center shrink-0 shadow-2xs">
        <LinkedInIcon className="w-3 h-3 fill-current" />
      </span>
    );
  }
  return null;
}

export default function AdvertiserCampaignsView({ campaigns }: AdvertiserCampaignsViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [modalState, setModalState] = useState<{
    campaign?: any;
    mode: 'archive' | 'delete' | 'deleteAll';
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kpugi_campaigns_view_mode');
      if (saved === 'grid' || saved === 'list') {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('kpugi_campaigns_view_mode', mode);
    } catch {}
  };

  const toggleCampaignAccordion = (id: string) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const activeCampaigns = campaigns.filter((c) => c.status !== 'archived');
  const archivedCampaigns = campaigns.filter((c) => c.status === 'archived');

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.campaign_code || '').toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'all') {
      return c.status !== 'archived' && matchesSearch;
    }
    return c.status === statusFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans text-kpugi-ink dark:text-white">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink dark:text-white">My Brand Campaigns</h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate dark:text-slate-400 mt-1">
            Manage active view-based creator campaigns, track budgets, and view your archived campaign history.
          </p>
        </div>
        <Link
          href="/b/campaigns/new"
          className="px-5 py-3 bg-kpugi-blue hover:bg-blue-600 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-kpugi-blue/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Campaign</span>
        </Link>
      </div>

      {/* Filters & View Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-white/5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
          />
        </div>

        {/* Right side: Status filters + Grid/List View Mode switcher */}
        <div className="flex items-center justify-between lg:justify-end gap-2 overflow-x-auto pb-1">
          {/* Status Filter Buttons with Distinct Hues */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'live', 'paused', 'completed', 'draft'].map((st) => {
              const styles = getStatusCardStyles(st);
              const isActiveTab = statusFilter === st;

              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                    isActiveTab
                      ? 'bg-kpugi-ink dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-white/5 border border-kpugi-border dark:border-white/10 text-kpugi-slate dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'
                  }`}
                >
                  {st}
                </button>
              );
            })}
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'archived'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived ({archivedCampaigns.length})</span>
            </button>
          </div>

          {/* View Mode Toggle (Grid / List) */}
          <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0 ml-1">
            <button
              type="button"
              onClick={() => handleViewModeChange('grid')}
              title="Grid View"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-white/15 text-kpugi-ink dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              title="List View"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-white/15 text-kpugi-ink dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Campaigns Content */}
      {filteredCampaigns.length > 0 ? (
        <div className="space-y-6">
          {statusFilter === 'archived' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                <Archive className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Showing Archived Campaigns ({filteredCampaigns.length})</span>
              </div>
              {filteredCampaigns.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModalState({ mode: 'deleteAll' })}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Archived</span>
                </button>
              )}
            </div>
          )}

          {/* Render: Grid View vs List View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((c) => {
                const progress = c.total_budget > 0 ? (Number(c.spent_budget || 0) / Number(c.total_budget)) * 100 : 0;
                const isArchived = c.status === 'archived';
                const isCompleted = c.status === 'completed';
                const styles = getStatusCardStyles(c.status);

                return (
                  <div
                    key={c.id}
                    className={`border rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between ${styles.cardBg} ${styles.border}`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 text-[10px] uppercase rounded-full flex items-center gap-1.5 ${styles.badge}`}>
                          {c.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                          <span>{c.status}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {c.campaign_code && (
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${styles.codeBg}`}>
                              {c.campaign_code}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-lg">
                            {c.ad_format}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {c.cover_image_url || c.requirements?.creative_image_url || c.company_logo ? (
                          <Image
                            src={c.cover_image_url || c.requirements?.creative_image_url || c.company_logo!}
                            alt={c.title}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-xl object-cover border border-kpugi-border dark:border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 font-bold text-base flex items-center justify-center shrink-0 border border-kpugi-blue/20 dark:border-blue-800/40">
                            📢
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white leading-tight truncate">{c.title}</h3>
                          <p className="text-xs text-kpugi-slate dark:text-slate-400 font-sans mt-0.5 capitalize truncate">
                            {c.channels?.join(', ') || 'TikTok, Instagram'}
                          </p>
                        </div>
                      </div>

                      {/* Budget & Views Bar */}
                      <div className="space-y-2 pt-3 border-t border-slate-200/60 dark:border-white/10 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span>Spent: {formatCompactCurrency(c.spent_budget || 0)}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">Total: {formatCompactCurrency(c.total_budget || 0)}</span>
                        </div>
                        <div className="w-full bg-slate-100/80 dark:bg-white/10 rounded-full h-2 overflow-hidden border border-slate-200/40 dark:border-white/10">
                          <div className={`${styles.progressBg} h-full rounded-full transition-all duration-300`} style={{ width: `${Math.min(100, progress)}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          <span>CPM: ₦{c.cpm_rate.toLocaleString()} / 1k</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.creators_count || 0} Joined Creators</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-2 mt-2">
                      <Link
                        href={c.status === 'draft' ? `/b/campaigns/new?draftId=${c.id}` : `/b/campaigns/${c.id}`}
                        className="flex-1 py-2.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-sans text-xs font-bold text-center rounded-xl transition-colors shadow-2xs"
                      >
                        {c.status === 'draft' ? 'Resume Draft →' : isArchived || isCompleted ? 'View Records →' : 'Manage →'}
                      </Link>

                      {isArchived ? (
                        <>
                          <button
                            type="button"
                            disabled
                            title="Archived campaigns cannot be edited"
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-40 shadow-2xs"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setModalState({ campaign: c, mode: 'delete' })}
                            title="Delete Archived Campaign from Dashboard"
                            className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors shadow-2xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : isCompleted ? (
                        <>
                          <button
                            type="button"
                            disabled
                            title="Completed campaigns cannot be edited"
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-40 shadow-2xs"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setModalState({ campaign: c, mode: 'archive' })}
                            title="Archive Completed Campaign"
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-700 transition-colors shadow-2xs"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (c.status === 'draft') {
                                router.push(`/b/campaigns/new?draftId=${c.id}`);
                              } else {
                                setEditingCampaign(c);
                              }
                            }}
                            title={c.status === 'draft' ? 'Continue Creation Wizard' : 'Edit Campaign Details'}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-kpugi-blue dark:hover:text-blue-400 transition-colors shadow-2xs"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setModalState({ campaign: c, mode: 'archive' })}
                            title="Archive Campaign"
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-700 transition-colors shadow-2xs"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View: Responsive with Mobile Accordion + Desktop Table */
            <div className="space-y-3">
              {/* 1. Mobile Accordion View (< md) */}
              <div className="md:hidden space-y-3">
                {filteredCampaigns.map((c) => {
                  const isExpanded = !!expandedCampaigns[c.id];
                  const progress = c.total_budget > 0 ? (Number(c.spent_budget || 0) / Number(c.total_budget)) * 100 : 0;
                  const isArchived = c.status === 'archived';
                  const isCompleted = c.status === 'completed';
                  const styles = getStatusCardStyles(c.status);
                  const channels = c.channels && c.channels.length > 0 ? c.channels : ['TikTok', 'Instagram'];

                  return (
                    <div
                      key={c.id}
                      className={`rounded-2xl border bg-white dark:bg-[#12141A] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isExpanded
                          ? 'border-kpugi-blue/50 ring-2 ring-kpugi-blue/15 shadow-sm'
                          : 'border-kpugi-border dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-2xs'
                      }`}
                    >
                      {/* Accordion Header / Trigger Button */}
                      <button
                        type="button"
                        onClick={() => toggleCampaignAccordion(c.id)}
                        className="w-full p-3.5 flex items-center gap-3 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.03] select-none"
                      >
                        {/* Campaign Cover Image */}
                        {c.cover_image_url || c.requirements?.creative_image_url || c.company_logo ? (
                          <Image
                            src={c.cover_image_url || c.requirements?.creative_image_url || c.company_logo!}
                            alt={c.title}
                            width={42}
                            height={42}
                            className="w-10 h-10 rounded-xl object-cover border border-kpugi-border dark:border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 font-bold text-sm flex items-center justify-center shrink-0 border border-kpugi-blue/20 dark:border-blue-800/40">
                            📢
                          </div>
                        )}

                        {/* Title, ID, Format, Network Icons */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-bold text-xs sm:text-sm text-kpugi-ink dark:text-white truncate leading-snug">
                            {c.title}
                          </h4>

                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {c.campaign_code && (
                              <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${styles.codeBg}`}>
                                {c.campaign_code}
                              </span>
                            )}
                            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                              {c.ad_format}
                            </span>

                            {/* Official Network Icons Only */}
                            <div className="flex items-center gap-1">
                              {channels.map((ch) => renderNetworkIcon(ch))}
                            </div>
                          </div>
                        </div>

                        {/* Status badge + Accordion Chevron */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full flex items-center gap-1 ${styles.badge}`}>
                            {c.status === 'live' && <span className="w-1 h-1 rounded-full bg-white animate-ping" />}
                            <span>{c.status}</span>
                          </span>
                          <div
                            className={`p-1.5 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                              isExpanded
                                ? 'rotate-180 text-kpugi-blue bg-kpugi-blue/15 shadow-2xs'
                                : 'rotate-0 text-slate-400 bg-slate-100 dark:bg-white/10'
                            }`}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>

                      {/* Smart Animate Collapsible Body (CSS Grid 0fr -> 1fr with nested transform) */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                        }`}
                      >
                        <div className="overflow-hidden min-h-0">
                          <div
                            className={`p-3.5 pt-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] space-y-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                            }`}
                          >
                            {/* Budget Allocation */}
                            <div className="space-y-1.5 bg-white dark:bg-[#12141A] p-3 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Spent Budget</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  {formatCompactCurrency(c.spent_budget || 0)}{' '}
                                  <span className="text-slate-400 font-normal">/ {formatCompactCurrency(c.total_budget || 0)}</span>
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div className={`${styles.progressBg} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${Math.min(100, progress)}%` }} />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>Allocation Progress</span>
                                <span>{Math.round(progress)}% utilized</span>
                              </div>
                            </div>

                            {/* Key Metrics: CPM Rate & Joined Creators */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white dark:bg-[#12141A] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">CPM Rate</span>
                                <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5 block">
                                  ₦{c.cpm_rate.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">/ 1k</span>
                                </span>
                              </div>
                              <div className="bg-white dark:bg-[#12141A] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Joined Creators</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{c.creators_count || 0} creators</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                              <Link
                                href={c.status === 'draft' ? `/b/campaigns/new?draftId=${c.id}` : `/b/campaigns/${c.id}`}
                                className="flex-1 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-sans text-xs font-bold text-center rounded-xl transition-all shadow-2xs"
                              >
                                {c.status === 'draft' ? 'Resume Draft →' : isArchived || isCompleted ? 'View Records →' : 'Manage Campaign →'}
                              </Link>

                              {isArchived ? (
                                <>
                                  <button
                                    type="button"
                                    disabled
                                    title="Archived campaigns cannot be edited"
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-40 shadow-2xs"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setModalState({ campaign: c, mode: 'delete' })}
                                    title="Delete Archived Campaign from Dashboard"
                                    className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors shadow-2xs"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : isCompleted ? (
                                <>
                                  <button
                                    type="button"
                                    disabled
                                    title="Completed campaigns cannot be edited"
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-40 shadow-2xs"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setModalState({ campaign: c, mode: 'archive' })}
                                    title="Archive Completed Campaign"
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-700 transition-colors shadow-2xs"
                                  >
                                    <Archive className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (c.status === 'draft') {
                                        router.push(`/b/campaigns/new?draftId=${c.id}`);
                                      } else {
                                        setEditingCampaign(c);
                                      }
                                    }}
                                    title={c.status === 'draft' ? 'Continue Creation Wizard' : 'Edit Campaign Details'}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-kpugi-blue dark:hover:text-blue-400 transition-colors shadow-2xs"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setModalState({ campaign: c, mode: 'archive' })}
                                    title="Archive Campaign"
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-700 transition-colors shadow-2xs"
                                  >
                                    <Archive className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto rounded-3xl border border-kpugi-border dark:border-white/10 bg-white dark:bg-[#12141A] shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#161820] text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3.5 px-4">Campaign</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Budget Allocation</th>
                      <th className="py-3.5 px-3">CPM Rate</th>
                      <th className="py-3.5 px-3">Creators</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredCampaigns.map((c) => {
                      const progress = c.total_budget > 0 ? (Number(c.spent_budget || 0) / Number(c.total_budget)) * 100 : 0;
                      const isArchived = c.status === 'archived';
                      const isCompleted = c.status === 'completed';
                      const styles = getStatusCardStyles(c.status);
                      const channels = c.channels && c.channels.length > 0 ? c.channels : ['TikTok', 'Instagram'];

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                          {/* Campaign Title & Meta */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {c.cover_image_url || c.requirements?.creative_image_url || c.company_logo ? (
                                <Image
                                  src={c.cover_image_url || c.requirements?.creative_image_url || c.company_logo!}
                                  alt={c.title}
                                  width={38}
                                  height={38}
                                  className="w-9 h-9 rounded-xl object-cover border border-kpugi-border dark:border-white/10 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-kpugi-blue/10 dark:bg-blue-900/30 text-kpugi-blue dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-kpugi-blue/20 dark:border-blue-800/40">
                                  📢
                                </div>
                              )}
                              <div className="min-w-0 max-w-xs sm:max-w-sm">
                                <Link
                                  href={c.status === 'draft' ? `/b/campaigns/new?draftId=${c.id}` : `/b/campaigns/${c.id}`}
                                  className="font-display font-bold text-sm text-kpugi-ink dark:text-white hover:text-kpugi-blue dark:hover:text-blue-400 transition-colors line-clamp-1 block"
                                >
                                  {c.title}
                                </Link>
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-kpugi-slate dark:text-slate-400 flex-wrap">
                                  {c.campaign_code && (
                                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${styles.codeBg}`}>
                                      {c.campaign_code}
                                    </span>
                                  )}
                                  <span className="capitalize text-[10px] font-medium bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">{c.ad_format}</span>
                                  <div className="flex items-center gap-1">
                                    {channels.map((ch) => renderNetworkIcon(ch))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-[10px] uppercase rounded-full inline-flex items-center gap-1.5 ${styles.badge}`}>
                              {c.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                              <span>{c.status}</span>
                            </span>
                          </td>

                          {/* Budget & Spent */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="space-y-1 min-w-[140px]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Spent: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCompactCurrency(c.spent_budget || 0)}</strong></span>
                                <span className="text-slate-400 font-mono text-[10px]">{Math.round(progress)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div className={`${styles.progressBg} h-full rounded-full`} style={{ width: `${Math.min(100, progress)}%` }} />
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Total: {formatCompactCurrency(c.total_budget || 0)}
                              </div>
                            </div>
                          </td>

                          {/* CPM Rate */}
                          <td className="py-4 px-3 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                            ₦{c.cpm_rate.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans font-normal">/ 1k</span>
                          </td>

                          {/* Creators */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-xl">
                              <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span>{c.creators_count || 0}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                href={c.status === 'draft' ? `/b/campaigns/new?draftId=${c.id}` : `/b/campaigns/${c.id}`}
                                className="px-3 py-1.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-sans text-xs font-bold text-center rounded-xl transition-colors shadow-2xs inline-block"
                              >
                                {c.status === 'draft' ? 'Resume Draft →' : isArchived || isCompleted ? 'View Records →' : 'Manage →'}
                              </Link>

                              {isArchived ? (
                                <>
                                  <button
                                    type="button"
                                    disabled
                                    title="Archived campaigns cannot be edited"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-40 shadow-2xs"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setModalState({ campaign: c, mode: 'delete' })}
                                    title="Delete Archived Campaign from Dashboard"
                                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors shadow-2xs"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : isCompleted ? (
                                <>
                                  <button
                                    type="button"
                                    disabled
                                    title="Completed campaigns cannot be edited"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-40 shadow-2xs"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setModalState({ campaign: c, mode: 'archive' })}
                                    title="Archive Completed Campaign"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-700 transition-colors shadow-2xs"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (c.status === 'draft') {
                                        router.push(`/b/campaigns/new?draftId=${c.id}`);
                                      } else {
                                        setEditingCampaign(c);
                                      }
                                    }}
                                    title={c.status === 'draft' ? 'Continue Creation Wizard' : 'Edit Campaign Details'}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-kpugi-blue dark:hover:text-blue-400 transition-colors shadow-2xs"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setModalState({ campaign: c, mode: 'archive' })}
                                    title="Archive Campaign"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-amber-700 transition-colors shadow-2xs"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-[#12141A] border border-kpugi-border dark:border-white/10 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-400 mx-auto flex items-center justify-center">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-kpugi-ink dark:text-white">
            {statusFilter === 'archived' ? 'No Archived Campaigns' : 'No Campaigns Found'}
          </h3>
          <p className="font-sans text-xs text-kpugi-slate dark:text-slate-400 max-w-sm mx-auto">
            {statusFilter === 'archived'
              ? 'When you archive campaigns, they will safely appear here for historical reference.'
              : 'You have no campaigns matching the selected status filter.'}
          </p>
        </div>
      )}

      {/* Dedicated Red-Toned Section for Archived Campaigns */}
      {statusFilter === 'all' && archivedCampaigns.length > 0 && (
        <div className="pt-8 border-t border-rose-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-900">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-rose-950">
                  Archived Campaigns Section ({archivedCampaigns.length})
                </h3>
                <p className="text-xs text-rose-700/80">
                  Stored historical campaigns kept for your analytics & record history.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStatusFilter('archived')}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
              >
                <span>View All ({archivedCampaigns.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setModalState({ mode: 'deleteAll' })}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Archived</span>
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 border border-rose-300 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-600 text-white border border-rose-700 shadow-2xs">
                        ARCHIVED
                      </span>
                      {c.campaign_code && (
                        <span className="text-[10px] text-rose-700 font-mono font-bold uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          {c.campaign_code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {c.company_logo ? (
                        <Image src={c.company_logo} alt="" width={36} height={36} className="rounded-xl object-cover border border-rose-200 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                          📁
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-sm text-slate-900 truncate">{c.title}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{c.channels?.join(', ') || 'TikTok, Instagram'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-rose-100 font-mono">
                      <span>Total: {formatCompactCurrency(c.total_budget || 0)}</span>
                      <span>CPM: ₦{c.cpm_rate.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs gap-2">
                    <Link href={`/b/campaigns/${c.id}`} className="font-bold text-rose-700 hover:text-rose-900 hover:underline">
                      View Records →
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled
                        title="Archived campaigns cannot be edited"
                        className="p-1.5 text-slate-400 rounded-lg cursor-not-allowed opacity-40 shadow-2xs"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setModalState({ campaign: c, mode: 'delete' })}
                        className="p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors shadow-2xs"
                        title="Delete Campaign from Dashboard"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Archived List View: Mobile Accordion + Desktop Table */
            <div className="space-y-3">
              {/* Mobile Archived Accordion */}
              <div className="md:hidden space-y-2.5">
                {archivedCampaigns.map((c) => {
                  const isExpanded = !!expandedCampaigns[c.id];
                  const channels = c.channels && c.channels.length > 0 ? c.channels : ['TikTok', 'Instagram'];

                  return (
                    <div
                      key={c.id}
                      className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isExpanded
                          ? 'border-rose-300 ring-2 ring-rose-200/50 shadow-sm'
                          : 'border-rose-200 hover:border-rose-300 shadow-2xs'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCampaignAccordion(c.id)}
                        className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-rose-50/40 active:bg-rose-100/50 transition-colors select-none"
                      >
                        {c.company_logo ? (
                          <Image src={c.company_logo} alt="" width={36} height={36} className="rounded-xl object-cover border border-rose-200 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                            📁
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 truncate">{c.title}</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {c.campaign_code && (
                              <span className="font-mono text-rose-700 font-bold text-[9px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                {c.campaign_code}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              {channels.map((ch) => renderNetworkIcon(ch))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-rose-600 text-white">
                            Archived
                          </span>
                          <div
                            className={`p-1.5 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                              isExpanded ? 'rotate-180 text-rose-600 bg-rose-100/80 shadow-2xs' : 'rotate-0 text-slate-400 bg-slate-100'
                            }`}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>

                      {/* Smart Animate Collapsible Body */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                        }`}
                      >
                        <div className="overflow-hidden min-h-0">
                          <div
                            className={`p-3.5 pt-2 border-t border-rose-100 bg-rose-50/30 space-y-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                            }`}
                          >
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Budget</span>
                                <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block">{formatCompactCurrency(c.total_budget || 0)}</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">CPM Rate</span>
                                <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block">₦{c.cpm_rate.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <Link href={`/b/campaigns/${c.id}`} className="flex-1 py-2 text-center font-bold text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 active:scale-[0.99] text-xs transition-all shadow-2xs">
                                View Records →
                              </Link>
                              <button
                                onClick={() => setModalState({ campaign: c, mode: 'delete' })}
                                className="p-2 text-rose-600 bg-white border border-rose-200 hover:bg-rose-600 hover:text-white rounded-xl transition-colors shadow-2xs"
                                title="Delete Campaign from Dashboard"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Archived Table */}
              <div className="hidden md:block overflow-x-auto rounded-3xl border border-rose-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-rose-100 bg-rose-50/60 text-rose-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Archived Campaign</th>
                      <th className="py-3 px-3">Total Budget</th>
                      <th className="py-3 px-3">CPM Rate</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {archivedCampaigns.map((c) => {
                      const channels = c.channels && c.channels.length > 0 ? c.channels : ['TikTok', 'Instagram'];
                      return (
                        <tr key={c.id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {c.company_logo ? (
                                <Image src={c.company_logo} alt="" width={32} height={32} className="rounded-xl object-cover border border-rose-200 shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                                  📁
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-display font-bold text-xs sm:text-sm text-slate-900 truncate">{c.title}</div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  {c.campaign_code && <span className="font-mono text-rose-700 font-bold text-[9px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{c.campaign_code}</span>}
                                  <div className="flex items-center gap-1">
                                    {channels.map((ch) => renderNetworkIcon(ch))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                            {formatCompactCurrency(c.total_budget || 0)}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                            ₦{c.cpm_rate.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <Link href={`/b/campaigns/${c.id}`} className="font-bold text-rose-700 hover:text-rose-900 hover:underline text-xs">
                                View Records →
                              </Link>
                              <button
                                onClick={() => setModalState({ campaign: c, mode: 'delete' })}
                                className="p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                                title="Delete Campaign from Dashboard"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Multi-mode Modal: Archive / Delete / DeleteAll */}
      {modalState && (
        <DeleteCampaignModal
          campaign={modalState.campaign}
          mode={modalState.mode}
          archivedCount={archivedCampaigns.length}
          onClose={() => setModalState(null)}
          onSuccess={() => {
            setModalState(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
