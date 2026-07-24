import React from 'react';

export function CampaignCard({ title }: { title: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-kpugi-border">
      <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
    </div>
  );
}
