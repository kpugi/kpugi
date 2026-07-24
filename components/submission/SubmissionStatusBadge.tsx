import React from 'react';

export function SubmissionStatusBadge({ status }: { status: 'pending' | 'verified_pass' | 'verified_fail' | 'forfeited' | 'paid' }) {
  const badgeMap = {
    pending: { label: 'Pending Verification', class: 'bg-amber-50 text-kpugi-amber border-amber-200' },
    verified_pass: { label: 'Verified Pass', class: 'bg-emerald-50 text-kpugi-naira border-emerald-200' },
    verified_fail: { label: 'Verified Fail', class: 'bg-red-50 text-kpugi-cliff border-red-200' },
    forfeited: { label: 'Forfeited', class: 'bg-red-50 text-kpugi-cliff border-red-200' },
    paid: { label: 'Paid Out', class: 'bg-blue-50 text-kpugi-primary border-blue-200' },
  };

  const item = badgeMap[status] || badgeMap.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.class}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {item.label}
    </span>
  );
}
