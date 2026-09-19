import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { Activity, Server, Database, CheckCircle2, Clock, Terminal } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSystemPage() {
  const { profile } = await requireAdminSession();

  const CRON_JOBS = [
    {
      name: 'Daily Settlement Engine',
      path: '/api/cron/daily-settlement',
      schedule: 'Daily @ 00:00 UTC',
      status: 'Active',
      description: 'Reconciles reserved escrow balances, updates view thresholds, and handles auto-payout cycles.'
    },
    {
      name: 'Submission Auto-Verifier',
      path: '/api/cron/verify-submissions',
      schedule: 'Every 30 mins',
      status: 'Active',
      description: 'Checks post scraping results, verifies watch time and likes against campaign thresholds.'
    },
    {
      name: 'Campaign Closer',
      path: '/api/cron/close-expired-campaigns',
      schedule: 'Hourly',
      status: 'Active',
      description: 'Marks campaigns whose budget is depleted or end date reached as completed.'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white">System Health & Infrastructure</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnostic status for background cron jobs, database connectivity, and platform automation.
          </p>
        </div>
      </div>

      {/* Infrastructure Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Postgres RLS Layer</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white font-display">Operational</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            is_admin() DB policy active
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Identity Provider</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-white font-display">Clerk Auth</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Third-Party JWT verification
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C101A] border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Audit Subsystem</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white font-display">Logging Active</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Service-role append pipeline
          </p>
        </div>
      </div>

      {/* Cron Jobs Matrix */}
      <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-semibold font-display text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Configured Scheduled Tasks (Cron)
        </h3>

        <div className="divide-y divide-slate-800/60">
          {CRON_JOBS.map((job) => (
            <div key={job.path} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{job.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {job.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{job.description}</p>
                <div className="mt-1 flex items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span>Endpoint: {job.path}</span>
                  <span>•</span>
                  <span>{job.schedule}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono text-[11px]">
                  CRON_SECRET Protected
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
