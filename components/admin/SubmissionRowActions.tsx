'use client';

import React, { useState, useTransition } from 'react';
import { overrideSubmissionStatus } from '@/app/actions/admin';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface SubmissionRowActionsProps {
  submissionId: string;
  currentStatus: string;
}

export default function SubmissionRowActions({
  submissionId,
  currentStatus,
}: SubmissionRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleOverride = (status: 'verified_pass' | 'verified_fail') => {
    const reason = prompt(
      `Enter mandatory audit reason for overriding submission to "${status}":`
    );

    if (!reason || reason.trim().length < 5) {
      if (reason !== null) {
        alert('Audit reason must be at least 5 characters long.');
      }
      return;
    }

    startTransition(async () => {
      try {
        await overrideSubmissionStatus(submissionId, status, reason.trim());
      } catch (err: any) {
        alert(err?.message || 'Failed to override submission status');
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleOverride('verified_pass')}
        disabled={isPending || currentStatus === 'verified_pass'}
        title="Override to Verified Pass"
        className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <CheckCircle2 className="w-3 h-3" />
        )}
        <span>Pass</span>
      </button>

      <button
        onClick={() => handleOverride('verified_fail')}
        disabled={isPending || currentStatus === 'verified_fail'}
        title="Override to Verified Fail"
        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        <span>Fail</span>
      </button>
    </div>
  );
}
