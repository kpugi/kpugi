import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import { ScrollText, ShieldCheck, Filter } from 'lucide-react';

export const revalidate = 0;

export default async function AdminAuditLogPage() {
  const { supabase } = await requireAdminSession();

  const { data: auditLogs } = await supabase
    .from('audit_log')
    .select('id, actor_role, action, target_table, target_id, payload, ip_address, created_at, profile_id')
    .order('created_at', { ascending: false })
    .limit(100);

  const logs = auditLogs || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-white">Platform Audit Log</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Append-Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable trace of all administrative toggles, status overrides, payouts, and system events.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0C101A] border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080B11] border-b border-slate-800/80 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Actor</th>
                <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                <th className="py-3.5 px-4 font-semibold">Payload Diff</th>
                <th className="py-3.5 px-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <ScrollText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No audit records logged yet. Actions performed in this console will be recorded here.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-300 text-xs">{log.action}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.actor_role === 'admin'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : log.actor_role === 'system'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {log.target_table}
                      {log.target_id ? (
                        <span className="text-slate-500 block text-[10px]">
                          #{String(log.target_id).slice(0, 8)}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {log.payload ? (
                        <pre className="text-[10px] bg-[#06080E] p-1.5 rounded border border-slate-800/60 overflow-x-auto text-slate-400 max-h-16">
                          {JSON.stringify(log.payload)}
                        </pre>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[10px]">
                      {log.ip_address || '—'}
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
