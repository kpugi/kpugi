import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import SubmissionRowActions from '@/components/admin/SubmissionRowActions';
import { CheckSquare } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSubmissionsPage() {
  const { supabase } = await requireAdminSession();

  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, campaign_id, creator_id, status, post_url, reserved_amount, payout_amount, submitted_at, verified_at')
    .order('submitted_at', { ascending: false })
    .limit(50);

  const list = submissions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Submission Verification</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review creator submissions, trigger scraper re-checks, and apply manual verification overrides.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0C101A] border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080B11] border-b border-slate-800/80 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Submission ID</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Reserved NGN</th>
                <th className="py-3.5 px-4 font-semibold">Payout NGN</th>
                <th className="py-3.5 px-4 font-semibold">Post Link</th>
                <th className="py-3.5 px-4 font-semibold">Override Action</th>
                <th className="py-3.5 px-4 font-semibold">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                list.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      #{s.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          s.status === 'verified_pass' || s.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : s.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₦{Number(s.reserved_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₦{Number(s.payout_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.post_url ? (
                        <a
                          href={s.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline max-w-xs block truncate"
                        >
                          {s.post_url}
                        </a>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <SubmissionRowActions
                        submissionId={s.id}
                        currentStatus={s.status}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}
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
