'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Plus, Megaphone, ArrowRight, Eye, Users, ChevronRight, Pencil, Archive, Trash2 } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils/format';
import { AdvertiserCampaign } from '@/lib/supabase/advertiser';
import { EditCampaignModal } from '@/components/campaign/EditCampaignModal';
import { DeleteCampaignModal } from '@/components/campaign/DeleteCampaignModal';

interface AdvertiserCampaignsViewProps {
  campaigns: AdvertiserCampaign[];
}

function getStatusCardStyles(status: string) {
  switch (status.toLowerCase()) {
    case 'live':
      return {
        cardBg: 'bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/20',
        border: 'border-emerald-300/80 shadow-2xs hover:shadow-md hover:border-emerald-400',
        badge: 'bg-emerald-500 text-white font-bold tracking-wide border border-emerald-600 shadow-2xs',
        codeBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
        progressBg: 'bg-emerald-500',
      };
    case 'paused':
      return {
        cardBg: 'bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20',
        border: 'border-amber-300/80 shadow-2xs hover:shadow-md hover:border-amber-400',
        badge: 'bg-amber-500 text-white font-bold border border-amber-600 shadow-2xs',
        codeBg: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
        progressBg: 'bg-amber-500',
      };
    case 'completed':
      return {
        cardBg: 'bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/20',
        border: 'border-indigo-300/80 shadow-2xs hover:shadow-md hover:border-indigo-400',
        badge: 'bg-indigo-600 text-white font-bold border border-indigo-700 shadow-2xs',
        codeBg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
        progressBg: 'bg-indigo-600',
      };
    case 'draft':
      return {
        cardBg: 'bg-gradient-to-br from-purple-50/50 via-white to-slate-50/20',
        border: 'border-purple-200/80 hover:border-purple-300',
        badge: 'bg-purple-100 text-purple-800 font-bold border border-purple-300',
        codeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        progressBg: 'bg-purple-400',
      };
    case 'archived':
    case 'cancelled':
      return {
        cardBg: 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30',
        border: 'border-rose-300/90 shadow-2xs hover:border-rose-400',
        badge: 'bg-rose-600 text-white font-bold tracking-wide border border-rose-700 shadow-2xs',
        codeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        progressBg: 'bg-rose-500',
      };
    default:
      return {
        cardBg: 'bg-white',
        border: 'border-kpugi-border hover:border-slate-300',
        badge: 'bg-slate-100 text-slate-700 border border-slate-200',
        codeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        progressBg: 'bg-slate-500',
      };
  }
}

export default function AdvertiserCampaignsView({ campaigns }: AdvertiserCampaignsViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<any | null>(null);

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
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kpugi-ink">My Brand Campaigns</h1>
          <p className="font-sans text-xs sm:text-sm text-kpugi-slate mt-1">
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by title, code..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-kpugi-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
          />
        </div>

        {/* Status Filter Buttons with Distinct Hues */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'live', 'paused', 'completed', 'draft'].map((st) => {
            const styles = getStatusCardStyles(st);
            const isActiveTab = statusFilter === st;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  isActiveTab
                    ? 'bg-kpugi-ink text-white shadow-sm'
                    : 'bg-white border border-kpugi-border text-kpugi-slate hover:bg-slate-50'
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
                : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived ({archivedCampaigns.length})</span>
          </button>
        </div>
      </div>

      {/* Main Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <div className="space-y-6">
          {statusFilter === 'archived' && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 p-3 rounded-2xl border border-rose-200">
              <Archive className="w-4 h-4 text-rose-600" />
              <span>Showing Archived Campaigns ({filteredCampaigns.length})</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((c) => {
              const progress = c.total_budget > 0 ? (Number(c.spent_budget || 0) / Number(c.total_budget)) * 100 : 0;
              const isArchived = c.status === 'archived';
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
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider bg-white/80 border border-slate-200 px-2 py-0.5 rounded-lg">
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
                          className="w-10 h-10 rounded-xl object-cover border border-kpugi-border shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-kpugi-blue/10 text-kpugi-blue font-bold text-base flex items-center justify-center shrink-0 border border-kpugi-blue/20">
                          📢
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base text-kpugi-ink leading-tight truncate">{c.title}</h3>
                        <p className="text-xs text-kpugi-slate font-sans mt-0.5 capitalize truncate">
                          {c.channels?.join(', ') || 'TikTok, Instagram'}
                        </p>
                      </div>
                    </div>

                    {/* Budget & Views Bar */}
                    <div className="space-y-2 pt-3 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Spent: {formatCompactCurrency(c.spent_budget || 0)}</span>
                        <span className="font-mono font-bold text-slate-900">Total:{formatCompactCurrency(c.total_budget || 0)}</span>
                      </div>
                      <div className="w-full bg-slate-100/80 rounded-full h-2 overflow-hidden border border-slate-200/40">
                        <div className={`${styles.progressBg} h-full rounded-full transition-all duration-300`} style={{ width: `${Math.min(100, progress)}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>CPM: ₦{c.cpm_rate.toLocaleString()} / 1k</span>
                        <span className="font-bold text-emerald-600">{c.creators_count || 0} Joined Creators</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 mt-2">
                    <Link
                      href={c.status === 'draft' ? `/b/campaigns/new?draftId=${c.id}` : `/b/campaigns/${c.id}`}
                      className="flex-1 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-sans text-xs font-bold text-center rounded-xl transition-colors shadow-2xs"
                    >
                      {c.status === 'draft' ? 'Resume Draft →' : 'Manage →'}
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        if (c.status === 'draft') {
                          router.push(`/b/campaigns/new?draftId=${c.id}`);
                        } else {
                          setEditingCampaign(c);
                        }
                      }}
                      title={c.status === 'draft' ? 'Continue Creation Wizard' : 'Edit Live Campaign Details'}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-kpugi-blue transition-colors shadow-2xs"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingCampaign(c)}
                      title="Archive Campaign"
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-kpugi-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-kpugi-blue/10 text-kpugi-blue text-2xl flex items-center justify-center mx-auto">
            {statusFilter === 'archived' ? '📁' : '📢'}
          </div>
          <h3 className="font-display font-bold text-lg text-kpugi-ink">
            {statusFilter === 'archived' ? 'No Archived Campaigns' : 'No Campaigns Found'}
          </h3>
          <p className="font-sans text-xs text-kpugi-slate max-w-sm mx-auto">
            {statusFilter === 'archived'
              ? 'When you archive campaigns, they will safely appear here for historical reference.'
              : 'You have no campaigns matching the selected status filter.'}
          </p>
        </div>
      )}

      {/* Dedicated Red-Toned Section for Archived Campaigns */}
      {statusFilter === 'all' && archivedCampaigns.length > 0 && (
        <div className="pt-8 border-t border-rose-200/80 space-y-4">
          <div className="flex items-center justify-between">
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
            <button
              onClick={() => setStatusFilter('archived')}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
            >
              <span>View All Archived ({archivedCampaigns.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

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

                <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs">
                  <Link href={`/b/campaigns/${c.id}`} className="font-bold text-rose-700 hover:text-rose-900 hover:underline">
                    View Records →
                  </Link>
                  <button
                    onClick={() => setDeletingCampaign(c)}
                    className="p-1.5 text-rose-600 hover:text-rose-900 rounded-lg hover:bg-rose-100"
                    title="Archive Settings"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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

      {/* Archive Campaign Modal */}
      {deletingCampaign && (
        <DeleteCampaignModal
          campaign={deletingCampaign}
          onClose={() => setDeletingCampaign(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
