import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import CampaignRowToggles from '@/components/admin/CampaignRowToggles';
import { Megaphone, Sparkles, Pin } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminCampaignsPage() {
  const { supabase } = await requireAdminSession();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, title, status, cpm_rate, total_budget, reserved_budget, spent_budget, is_featured, is_hero_pinned, created_at')
    .order('created_at', { ascending: false });

  const list = campaigns || [];
  const heroPinnedCount = list.filter((c: any) => c.is_hero_pinned).length;
  const featuredCount = list.filter((c: any) => c.is_featured).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Campaign Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure featured status, hero slider pinning (max 5), and review all platform campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#0C101A] border border-slate-800 text-xs font-mono flex items-center gap-2 text-indigo-300">
            <Pin className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hero Slots: {heroPinnedCount}/5</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#0C101A] border border-slate-800 text-xs font-mono flex items-center gap-2 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Featured: {featuredCount}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0C101A] border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080B11] border-b border-slate-800/80 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Title</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">CPM</th>
                <th className="py-3.5 px-4 font-semibold">Budget</th>
                <th className="py-3.5 px-4 font-semibold">Operations / Flags</th>
                <th className="py-3.5 px-4 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No campaigns found in database.
                  </td>
                </tr>
              ) : (
                list.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block truncate max-w-xs">{c.title}</span>
                      <span className="font-mono text-[10px] text-slate-500">#{c.id.slice(0, 8)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          c.status === 'live'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₦{Number(c.cpm_rate || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₦{Number(c.total_budget || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <CampaignRowToggles
                        campaignId={c.id}
                        isHeroPinned={!!c.is_hero_pinned}
                        isFeatured={!!c.is_featured}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
