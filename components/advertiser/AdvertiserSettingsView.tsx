'use client';

import React, { useState } from 'react';
import { Building2, Save, Globe, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { updateBrandProfileDetailsAction } from '@/app/actions/advertiser';

interface AdvertiserSettingsViewProps {
  companyName: string;
  advertiserAvatarUrl: string | null;
}

export default function AdvertiserSettingsView({
  companyName: initialCompanyName,
  advertiserAvatarUrl,
}: AdvertiserSettingsViewProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName || '');
  const [industry, setIndustry] = useState('E-commerce');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('industry', industry);
    formData.append('websiteUrl', websiteUrl);

    const res = await updateBrandProfileDetailsAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setMsg({ text: 'Brand company details updated successfully!', type: 'success' });
    } else {
      setMsg({ text: res.error || 'Failed to update brand details', type: 'error' });
    }
  };

  return (
    <div className="max-w-3xl space-y-6">

      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-kpugi-blue/10 text-kpugi-blue flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-kpugi-ink">Brand Profile & Invoicing Settings</h1>
          <p className="text-xs text-kpugi-slate mt-0.5">Manage official company profile details, industry category, and campaign billing information.</p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company / Brand Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Media Ltd"
              className="w-full p-3 rounded-xl border border-kpugi-border text-xs focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Industry Category</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full p-3 rounded-xl border border-kpugi-border text-xs focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 bg-white"
            >
              <option value="E-commerce">E-commerce & Retail</option>
              <option value="Fintech">Fintech & Finance</option>
              <option value="SaaS & Software">SaaS & Tech Tools</option>
              <option value="Gaming & Apps">Gaming & Mobile Apps</option>
              <option value="Lifestyle & Fashion">Fashion & Consumer Goods</option>
              <option value="Media & Entertainment">Media & Content</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Official Website URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://acme.com"
              className="w-full p-3 rounded-xl border border-kpugi-border text-xs focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Brand Settings</span>
        </button>
      </form>

    </div>
  );
}
