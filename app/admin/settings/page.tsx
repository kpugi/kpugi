import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { Sliders, ShieldAlert, KeyRound, Globe, Database } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const { profile } = await requireAdminSession();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Platform Settings & Policies</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational parameters, security keys, and platform-wide defaults.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Policy Settings */}
        <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold font-display text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Marketplace Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1422] border border-slate-800/80">
              <div>
                <p className="font-semibold text-slate-200">Default Commission Rate</p>
                <p className="text-[11px] text-slate-400">Platform fee deducted from payouts</p>
              </div>
              <span className="font-mono font-bold text-indigo-300 text-sm">10%</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1422] border border-slate-800/80">
              <div>
                <p className="font-semibold text-slate-200">Max Hero Slider Slots</p>
                <p className="text-[11px] text-slate-400">Campaigns pinned via is_hero_pinned</p>
              </div>
              <span className="font-mono font-bold text-indigo-300 text-sm">5 slots</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1422] border border-slate-800/80">
              <div>
                <p className="font-semibold text-slate-200">Minimum View Threshold</p>
                <p className="text-[11px] text-slate-400">Baseline before payout unlocks</p>
              </div>
              <span className="font-mono font-bold text-indigo-300 text-sm">100 views</span>
            </div>
          </div>
        </div>

        {/* Security & Access Posture */}
        <div className="p-6 rounded-2xl bg-[#0C101A] border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold font-display text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            Security & RBAC Enforcement
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1422] border border-slate-800/80">
              <div>
                <p className="font-semibold text-slate-200">Admin Authorization Mode</p>
                <p className="text-[11px] text-slate-400">PostgreSQL is_admin() RLS policy</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1422] border border-slate-800/80">
              <div>
                <p className="font-semibold text-slate-200">Subdomain Isolation</p>
                <p className="text-[11px] text-slate-400">admin.kpugi.com rewrite gate</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1422] border border-slate-800/80">
              <div>
                <p className="font-semibold text-slate-200">Current Operator</p>
                <p className="text-[11px] text-slate-400">{profile.email}</p>
              </div>
              <span className="font-mono text-[10px] text-slate-400">ID: {profile.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
