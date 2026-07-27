'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { linkSocialAccountAction } from '@/app/actions/creator';
import { PlatformBadge } from '@/components/ui/SocialIcons';

interface CreatorAccountsViewProps {
  socialAccounts: Record<string, string>;
}

export default function CreatorAccountsView({ socialAccounts }: CreatorAccountsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    const res = await linkSocialAccountAction(formData);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to link handle');
    } else {
      setShowModal(false);
    }
  }

  const platforms = [
    { key: 'tiktok', name: 'TikTok', handle: socialAccounts?.tiktok },
    { key: 'instagram', name: 'Instagram', handle: socialAccounts?.instagram },
    { key: 'youtube', name: 'YouTube', handle: socialAccounts?.youtube },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-kpugi-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-kpugi-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-kpugi-ink">Social Accounts</h1>
          <p className="font-sans text-sm text-kpugi-slate mt-1">Connect your verified content creation handles for automatic view audits.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Link Social Handle</span>
        </button>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((p) => (
          <div key={p.key} className="p-6 rounded-2xl bg-white border border-kpugi-border shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlatformBadge platform={p.key} />
                <h3 className="font-display font-bold text-lg text-kpugi-ink">{p.name}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                p.handle ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {p.handle ? 'Connected' : 'Not Linked'}
              </span>
            </div>

            <div>
              <p className="font-sans text-xs text-kpugi-slate">Linked Handle</p>
              <p className="font-mono font-bold text-sm text-kpugi-ink mt-0.5">
                {p.handle ? `@${p.handle}` : 'No handle connected'}
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2 rounded-xl bg-kpugi-paper hover:bg-slate-200 border border-kpugi-border font-sans text-xs font-bold transition-colors"
            >
              {p.handle ? 'Update Handle' : 'Connect Handle'}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-xl text-kpugi-ink">Link Social Handle</h3>
            {errorMsg && <p className="text-xs text-red-500 font-bold">{errorMsg}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1">Platform</label>
                <select
                  name="platform"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-kpugi-border font-sans text-xs focus:outline-none focus:border-kpugi-blue"
                >
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-kpugi-slate mb-1">Social Handle</label>
                <input
                  type="text"
                  name="handle"
                  placeholder="e.g. @creator_name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-kpugi-border font-mono text-xs focus:outline-none focus:border-kpugi-blue"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-kpugi-border font-sans text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark"
                >
                  {loading ? 'Saving...' : 'Link Handle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
