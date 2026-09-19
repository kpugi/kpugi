'use client';

import React, { useTransition } from 'react';
import { toggleUserAdminStatus } from '@/app/actions/admin';
import { Shield, ShieldAlert, Loader2 } from 'lucide-react';

interface UserAdminToggleProps {
  profileId: string;
  isAdmin: boolean;
  isSelf: boolean;
}

export default function UserAdminToggle({
  profileId,
  isAdmin,
  isSelf,
}: UserAdminToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (isSelf && isAdmin) {
      if (!confirm('Warning: You are revoking your own administrator privileges. Continue?')) {
        return;
      }
    }

    startTransition(async () => {
      try {
        await toggleUserAdminStatus(profileId, isAdmin);
      } catch (err: any) {
        alert(err?.message || 'Failed to update user admin status');
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isAdmin ? 'Revoke Admin' : 'Grant Admin'}
      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
        isAdmin
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
          : 'bg-[#0E1422] text-slate-500 hover:text-emerald-400 border border-slate-800'
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
      ) : (
        <Shield className="w-3 h-3" />
      )}
      <span>{isAdmin ? 'Admin' : 'Make Admin'}</span>
    </button>
  );
}
