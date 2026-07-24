import React from 'react';

export function ConnectedAccountCard({ platform, handle }: { platform: string; handle: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-kpugi-border flex items-center justify-between">
      <div>
        <span className="font-semibold text-sm capitalize">{platform}</span>
        <span className="text-xs text-kpugi-slate block">@{handle}</span>
      </div>
      <button className="btn btn-ghost btn-xs text-kpugi-cliff">Disconnect</button>
    </div>
  );
}
