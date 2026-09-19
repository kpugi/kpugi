import React from 'react';
import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin/auth';
import {
  Megaphone,
  CheckSquare,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

export const revalidate = 0; // Dynamic data for live ops

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdminSession();

  // Parallel data fetching through RLS-enforced user-scoped Supabase client
  const [
    campaignsResult,
    submissionsResult,
    walletsResult,
    payoutsResult,
    auditLogsResult
  ] = await Promise.allSettled([
    supabase
      .from('campaigns')
      .select('id, title, status, is_featured, is_hero_pinned, total_budget, spent_budget, created_at'),
    supabase
      .from('submissions')
      .select('id, campaign_id, status, submitted_at, reserved_amount, payout_amount'),
    supabase
      .from('wallets')
      .select('balance, wallet_type'),
    supabase
      .from('payout_requests')
      .select('id, amount, status, created_at')
      .eq('status', 'pending'),
    supabase
      .from('audit_log')
      .select('id, actor_role, action, target_table, target_id, payload, ip_address, created_at')
      .order('created_at', { ascending: false })
      .limit(15)
  ]);

  const campaigns = campaignsResult.status === 'fulfilled' ? campaignsResult.value.data || [] : [];
  const submissions = submissionsResult.status === 'fulfilled' ? submissionsResult.value.data || [] : [];
  const wallets = walletsResult.status === 'fulfilled' ? walletsResult.value.data || [] : [];
  const pendingPayouts = payoutsResult.status === 'fulfilled' ? payoutsResult.value.data || [] : [];
  const auditLogs = auditLogsResult.status === 'fulfilled' ? auditLogsResult.value.data || [] : [];

  // Metrics computation
  const totalCampaigns = campaigns.length;
  const liveCampaigns = campaigns.filter((c: any) => c.status === 'live').length;
  const heroPinnedCount = campaigns.filter((c: any) => c.is_hero_pinned).length;
  const featuredCount = campaigns.filter((c: any) => c.is_featured).length;

  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter((s: any) => s.status === 'pending').length;
  const verifiedSubmissions = submissions.filter((s: any) => s.status === 'verified_pass' || s.status === 'approved').length;
  const failedSubmissions = submissions.filter((s: any) => s.status === 'verified_fail' || s.status === 'rejected').length;

  // Stale submissions: submitted > 96 hours ago and still pending
  const ninetySixHoursAgo = new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString();
  const staleSubmissions = submissions.filter(
    (s: any) => s.status === 'pending' && s.submitted_at && s.submitted_at < ninetySixHoursAgo
  );

  // Escrow & financial balances
  const totalPlatformBalance = wallets.reduce(
    (sum: number, w: any) => sum + (Number(w.balance) || 0),
    0
  );
  const totalPendingPayoutAmount = pendingPayouts.reduce(
    (sum: number, p: any) => sum + (Number(p.amount) || 0),
    0
  );

  const formatNaira = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#0E1424] to-[#0A0E18] border border-indigo-500/20 shadow-xl shadow-indigo-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Admin Workspace
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Signed in as <strong className="text-slate-200">{profile.full_name || profile.email}</strong>
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">
            Kpugi Platform Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Operational dashboard with live PostgreSQL Row-Level Security checks on every query.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/campaigns"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-indigo-600/30 active:scale-95 inline-flex items-center gap-1.5"
          >
            <Megaphone className="w-3.5 h-3.5" />
            Manage Campaigns
          </Link>
          <Link
            href="/admin/submissions"
            className="px-4 py-2 rounded-xl bg-[#141A29] hover:bg-[#1A2236] text-slate-200 text-xs font-semibold tracking-wide transition-all border border-slate-700 active:scale-95 inline-flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Review Submissions
          </Link>
        </div>
      </div>

      {/* Flagged Alerts Bar (if any stuck items) */}
      {staleSubmissions.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-4 text-xs text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-amber-300">Action Required:</span>{' '}
              <span>{staleSubmissions.length} submission(s) pending review for over 96 hours.</span>
            </div>
          </div>
          <Link
            href="/admin/submissions?filter=stuck"
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40 transition-colors flex-shrink-0"
          >
            Inspect Stale Submissions →
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campaigns KPI */}
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Campaigns</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{totalCampaigns}</span>
            <span className="text-xs text-emerald-400 font-mono font-medium">
              {liveCampaigns} live
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {heroPinnedCount}/5 Hero Pinned
            </span>
            <span>{featuredCount} Featured</span>
          </div>
        </div>

        {/* Submissions KPI */}
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{totalSubmissions}</span>
            <span className="text-xs text-amber-400 font-mono font-medium">
              {pendingSubmissions} pending
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              {verifiedSubmissions} Verified
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <XCircle className="w-3 h-3" />
              {failedSubmissions} Rejected
            </span>
          </div>
        </div>

        {/* Platform Balances KPI */}
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Platform Escrow</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">
              {formatNaira(totalPlatformBalance)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>{wallets.length} active wallets</span>
            <span className="text-emerald-400 font-mono font-medium">Funded</span>
          </div>
        </div>

        {/* Pending Payout Requests KPI */}
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80 hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Pending Payouts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">
              {formatNaira(totalPendingPayoutAmount)}
            </span>
            <span className="text-xs text-amber-400 font-mono font-medium">
              ({pendingPayouts.length} req)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Creator bank transfers</span>
            <Link href="/admin/payouts" className="text-indigo-400 hover:underline">
              Process →
            </Link>
          </div>
        </div>
      </div>

      {/* Split Section: Quick Operator Controls & Audit Log Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide): Quick Actions & System Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Operations Matrix */}
          <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-display text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Quick Operations
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Live controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/admin/campaigns"
                className="p-4 rounded-xl bg-[#0E1422] border border-slate-800 hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Hero Slider Configuration
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pin up to 5 campaigns directly to the top browse hero slider with the <code className="text-indigo-300 font-mono">is_hero_pinned</code> flag.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-indigo-400">
                  <span>Currently pinned: {heroPinnedCount}/5</span>
                </div>
              </Link>

              <Link
                href="/admin/submissions"
                className="p-4 rounded-xl bg-[#0E1422] border border-slate-800 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Submission Verification Overrides
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Manually force verify or fail submissions that got stuck during automated scraping, with mandatory audit logging.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                  <span>{pendingSubmissions} awaiting review</span>
                </div>
              </Link>

              <Link
                href="/admin/users"
                className="p-4 rounded-xl bg-[#0E1422] border border-slate-800 hover:border-amber-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    RBAC & Staff Authorization
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Grant or revoke <code className="text-amber-300 font-mono">is_admin</code> status on user profiles to expand the operations team.
                </p>
              </Link>

              <Link
                href="/admin/system"
                className="p-4 rounded-xl bg-[#0E1422] border border-slate-800 hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Cron Settlement & Diagnostics
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Inspect daily settlement runs, Apify scraper health, and trigger manual test pings against platform endpoints.
                </p>
              </Link>
            </div>
          </div>

          {/* Active Campaigns Snapshot */}
          <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-display text-white">
                Recent Campaigns
              </h3>
              <Link href="/admin/campaigns" className="text-xs text-indigo-400 hover:underline">
                View all ({totalCampaigns}) →
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No campaigns found.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {campaigns.slice(0, 5).map((campaign: any) => (
                  <div key={campaign.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 truncate">{campaign.title}</span>
                        {campaign.is_hero_pinned && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Hero Pinned
                          </span>
                        )}
                        {campaign.is_featured && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Featured
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Budget: {formatNaira(Number(campaign.total_budget) || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          campaign.status === 'live'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : campaign.status === 'draft'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {campaign.status}
                      </span>
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col wide): Real-time Audit Log Feed */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold font-display text-white">Live Audit Feed</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Append-Only
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Every sensitive action across Kpugi (admin toggles, payouts, verification overrides) is recorded here.
            </p>

            {auditLogs.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#080B11] border border-dashed border-slate-800 text-center flex-1 flex flex-col items-center justify-center">
                <p className="text-xs text-slate-500">No audit logs recorded yet.</p>
                <p className="text-[10px] text-slate-600 mt-1">Actions performed in this console will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
                {auditLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#080B11] border border-slate-800/80 hover:border-slate-700 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-300 truncate">
                        {log.action}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                          log.actor_role === 'admin'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : log.actor_role === 'system'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {log.actor_role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>
                        {log.target_table}
                        {log.target_id ? ` #${String(log.target_id).slice(0, 8)}` : ''}
                      </span>
                      <span>
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {log.payload && (
                      <pre className="text-[9px] font-mono bg-[#05070A] p-2 rounded text-slate-400 overflow-x-auto max-h-20">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <Link
                href="/admin/audit"
                className="block text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                View full audit trail →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
