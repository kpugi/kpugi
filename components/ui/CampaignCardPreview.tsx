import React from 'react';
import Link from 'next/link';

export interface CampaignPreviewProps {
  id: string;
  title: string;
  brandName: string;
  adFormat: 'video' | 'image' | 'text';
  cpmRate: number;
  totalBudget: number;
  reservedBudget: number;
  spentBudget: number;
  requirements: string[];
}

export default function CampaignCardPreview({
  id,
  title,
  brandName,
  adFormat,
  cpmRate,
  totalBudget,
  reservedBudget,
  spentBudget,
  requirements,
}: CampaignPreviewProps) {
  const committedBudget = reservedBudget + spentBudget;
  const percentageCommitted = Math.min(100, Math.round((committedBudget / totalBudget) * 100));

  return (
    <div className="bg-white rounded-2xl border border-kpugi-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-kpugi-slate uppercase tracking-wider">
            {brandName}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
            adFormat === 'video'
              ? 'bg-blue-50 text-kpugi-primary border border-blue-200'
              : adFormat === 'image'
              ? 'bg-purple-50 text-purple-600 border border-purple-200'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}>
            {adFormat} Ad
          </span>
        </div>

        {/* Campaign Title */}
        <h3 className="font-display font-semibold text-lg text-kpugi-ink mb-4 line-clamp-2">
          {title}
        </h3>

        {/* Advisory Requirement Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {requirements.map((req, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-kpugi-paper text-kpugi-slate px-2.5 py-1 rounded-md border border-kpugi-border/60"
            >
              {req}
            </span>
          ))}
        </div>
      </div>

      <div>
        {/* Financial Details Grid */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-kpugi-border mb-4 text-xs">
          <div>
            <span className="text-kpugi-slate block mb-0.5">CPM Rate</span>
            <span className="font-mono font-bold text-sm text-kpugi-ink tabular-nums">
              ₦{cpmRate.toLocaleString()} <span className="text-[10px] text-kpugi-slate font-sans">/ 1k views</span>
            </span>
          </div>
          <div>
            <span className="text-kpugi-slate block mb-0.5">Total Budget</span>
            <span className="font-mono font-bold text-sm text-kpugi-ink tabular-nums">
              ₦{totalBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Budget Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-[11px] text-kpugi-slate">
            <span>Budget Reserved</span>
            <span className="font-mono font-medium text-kpugi-ink">{percentageCommitted}%</span>
          </div>
          <div className="w-full bg-kpugi-paper rounded-full h-2 overflow-hidden border border-kpugi-border/50">
            <div
              className={`h-full transition-all duration-500 ${
                percentageCommitted >= 100
                  ? 'bg-kpugi-amber'
                  : 'bg-kpugi-primary'
              }`}
              style={{ width: `${percentageCommitted}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/sign-up`}
          className="btn btn-outline btn-sm w-full font-semibold border-kpugi-border text-kpugi-ink hover:bg-kpugi-primary hover:border-kpugi-primary hover:text-white"
        >
          Clock In to Campaign →
        </Link>
      </div>
    </div>
  );
}
