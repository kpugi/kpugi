import React from 'react';

export function BudgetProgressBar({
  reservedBudget,
  spentBudget,
  totalBudget,
}: {
  reservedBudget: number;
  spentBudget: number;
  totalBudget: number;
}) {
  const committed = reservedBudget + spentBudget;
  const percentage = Math.min(100, Math.round((committed / totalBudget) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-kpugi-slate">
        <span>Budget Committed</span>
        <span className="font-mono font-medium text-kpugi-ink">{percentage}%</span>
      </div>
      <div className="w-full bg-kpugi-paper rounded-full h-2 overflow-hidden border border-kpugi-border/50">
        <div
          className={`h-full transition-all duration-500 ${
            percentage >= 100 ? 'bg-kpugi-amber' : 'bg-kpugi-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
