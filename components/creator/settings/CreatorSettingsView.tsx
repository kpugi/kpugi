'use client';

import React, { useState } from 'react';
import { updateCreatorProfileAction } from '@/app/actions/creator';

interface CreatorSettingsViewProps {
  profile: any;
}

export default function CreatorSettingsView({ profile }: CreatorSettingsViewProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const creator = profile?.creator_profiles?.[0] || profile?.creatorProfile || {};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const formData = new FormData(e.currentTarget);
    const res = await updateCreatorProfileAction(formData);
    setLoading(false);
    if (!res.success) {
      setMsg(`Error: ${res.error}`);
    } else {
      setMsg('Profile settings updated successfully!');
    }
  }

  const defaultNiches = ['Comedy', 'Lifestyle', 'Tech & Gadgets', 'Fashion', 'Gaming', 'Entertainment', 'Education'];
  const selectedNiches: string[] = creator.niche_categories || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-kpugi-ink">
      <div className="border-b border-kpugi-border pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-kpugi-ink">Profile Settings</h1>
        <p className="font-sans text-sm text-kpugi-slate mt-1">Manage your creator public profile, bio, and content categories.</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold ${msg.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-kpugi-border shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-kpugi-slate uppercase tracking-wider mb-2">Display Name</label>
          <input
            type="text"
            name="displayName"
            defaultValue={creator.display_name || profile?.full_name || ''}
            required
            className="w-full px-4 py-3 rounded-xl border border-kpugi-border font-sans text-sm focus:outline-none focus:border-kpugi-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-kpugi-slate uppercase tracking-wider mb-2">Bio / Creator Statement</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={creator.bio || ''}
            placeholder="Tell brands about your content style and audience..."
            className="w-full px-4 py-3 rounded-xl border border-kpugi-border font-sans text-sm focus:outline-none focus:border-kpugi-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-kpugi-slate uppercase tracking-wider mb-2">Content Niches & Categories</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {defaultNiches.map((niche) => (
              <label key={niche} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-kpugi-border bg-kpugi-paper text-xs font-bold cursor-pointer hover:bg-slate-200">
                <input
                  type="checkbox"
                  name="niches"
                  value={niche}
                  defaultChecked={selectedNiches.includes(niche)}
                  className="rounded text-kpugi-blue focus:ring-0"
                />
                <span>{niche}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-kpugi-blue text-white font-sans text-xs font-bold hover:bg-kpugi-blue-dark transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
