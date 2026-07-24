import React from 'react';

export function CampaignRequirementsList({ requirements }: { requirements: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {requirements.map((req, idx) => (
        <span key={idx} className="bg-kpugi-paper text-kpugi-slate border border-kpugi-border text-xs px-2.5 py-1 rounded-md">
          {req}
        </span>
      ))}
    </div>
  );
}
