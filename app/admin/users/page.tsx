import React from 'react';
import { requireAdminSession } from '@/lib/admin/auth';
import UserAdminToggle from '@/components/admin/UserAdminToggle';
import { Users, Shield } from 'lucide-react';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const { supabase, profileId: currentAdminId } = await requireAdminSession();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, clerk_id, email, full_name, role, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const list = profiles || [];
  const adminCount = list.filter((p: any) => p.is_admin).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Users & RBAC Roles</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Platform accounts, roles, and administrator authorization grants.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-[#0C101A] border border-slate-800 text-xs font-mono flex items-center gap-2 text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Active Administrators: {adminCount}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0C101A] border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080B11] border-b border-slate-800/80 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Role</th>
                <th className="py-3.5 px-4 font-semibold">Admin Toggle</th>
                <th className="py-3.5 px-4 font-semibold">Profile ID</th>
                <th className="py-3.5 px-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                list.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 block">{u.full_name || 'No Name'}</span>
                        {u.id === currentAdminId && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-slate-800 text-slate-300">
                        {u.role || 'creator'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <UserAdminToggle
                        profileId={u.id}
                        isAdmin={!!u.is_admin}
                        isSelf={u.id === currentAdminId}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {u.id.slice(0, 8)}...
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
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
