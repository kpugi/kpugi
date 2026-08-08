'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Save, Loader2, FileText, AlertCircle, Coins, Target, TrendingUp, Clock, Sparkle } from 'lucide-react';
import { updateCampaignDetailsAction, generateAICampaignPolishAction } from '@/app/actions/campaign';
import { PlatformBadge } from '@/components/ui/SocialIcons';

interface EditCampaignModalProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    ad_format?: string;
    cpm_rate?: number;
    total_budget?: number;
    min_view_threshold?: number;
    required_live_duration_hours?: number;
    channels?: string[];
    is_featured?: boolean;
    requirements?: any;
    status: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCampaignModal({ campaign, onClose, onSuccess }: EditCampaignModalProps) {
  const [title, setTitle] = useState(campaign.title || '');
  const [description, setDescription] = useState(campaign.description || '');
  const [adFormat, setAdFormat] = useState(campaign.ad_format || 'Video Asset');
  const [cpmRate, setCpmRate] = useState(campaign.cpm_rate || 2000);
  const [totalBudget, setTotalBudget] = useState(campaign.total_budget || 100000);
  const [minViewThreshold, setMinViewThreshold] = useState(campaign.min_view_threshold || 1000);
  const [liveHours, setLiveHours] = useState(campaign.required_live_duration_hours || 72);
  const [channels, setChannels] = useState<string[]>(campaign.channels || ['TikTok', 'Instagram']);
  const [isFeatured, setIsFeatured] = useState(Boolean(campaign.is_featured));

  const [creativeCopy, setCreativeCopy] = useState(campaign.requirements?.creative_text_copy || '');
  const [driveUrl, setDriveUrl] = useState(campaign.requirements?.google_drive_url || '');
  const [docUrl, setDocUrl] = useState(campaign.requirements?.google_doc_url || '');
  const [hashtagsStr, setHashtagsStr] = useState((campaign.requirements?.hashtags || ['#KpugiLaunch']).join(', '));
  const [mentionsStr, setMentionsStr] = useState((campaign.requirements?.mentions || ['@KpugiApp']).join(', '));
  const [minFollowers, setMinFollowers] = useState(campaign.requirements?.min_followers || 1000);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const allPlatforms = ['TikTok', 'Instagram', 'YouTube', 'X/Twitter', 'Facebook'];

  const toggleChannel = (ch: string) => {
    if (channels.includes(ch)) {
      if (channels.length === 1) return; // Keep at least 1
      setChannels(channels.filter((c) => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleAiExpandBrief = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a Campaign Title first.');
      return;
    }
    setErrorMsg('');
    setIsAiLoading(true);

    const contextPrompt = `Campaign Title: ${title.trim()}\nUser Draft: ${description || 'No draft provided'}`;
    const res = await generateAICampaignPolishAction(contextPrompt, 'description');
    setIsAiLoading(false);

    if (res.success && res.text) {
      setDescription(res.text.slice(0, 500));
    } else {
      setErrorMsg(res.error || 'AI generation failed.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Campaign Title cannot be empty.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Campaign Brief description cannot be empty.');
      return;
    }
    if (channels.length === 0) {
      setErrorMsg('Please select at least 1 target channel.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const hashtagsArr = hashtagsStr.split(',').map((s: string) => s.trim()).filter(Boolean);
    const mentionsArr = mentionsStr.split(',').map((s: string) => s.trim()).filter(Boolean);

    const res = await updateCampaignDetailsAction({
      campaignId: campaign.id,
      title: title.trim(),
      description: description.trim(),
      ad_format: adFormat,
      cpm_rate: Math.max(2000, Number(cpmRate)),
      min_view_threshold: Number(minViewThreshold),
      total_budget: Number(totalBudget),
      required_live_duration_hours: Number(liveHours),
      channels,
      is_featured: isFeatured,
      requirements: {
        ...(campaign.requirements || {}),
        creative_text_copy: creativeCopy.trim(),
        google_drive_url: driveUrl.trim(),
        google_doc_url: docUrl.trim(),
        hashtags: hashtagsArr,
        mentions: mentionsArr,
        min_followers: Number(minFollowers),
      },
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to update campaign details.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-extrabold">Edit Live Campaign Parameters</h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                STATUS: {campaign.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Update pricing, channels, creative requirements, and campaign brief.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs font-sans">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Campaign Title & Ad Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Campaign Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                placeholder="Campaign Title"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Ad Format</label>
              <select
                value={adFormat}
                onChange={(e) => setAdFormat(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
              >
                <option value="Video Asset">Video Asset</option>
                <option value="Image Asset">Image Asset</option>
                <option value="Text Copy">Text Copy</option>
              </select>
            </div>
          </div>

          {/* Section 2: Brief Description with AI Polish */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Brief Description *</label>
              <button
                type="button"
                onClick={handleAiExpandBrief}
                disabled={isAiLoading}
                className="text-[10px] font-bold text-kpugi-blue hover:text-indigo-700 flex items-center gap-1 bg-kpugi-paper px-2 py-0.5 rounded-md border border-kpugi-border"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isAiLoading ? 'AI Polishing...' : 'Polish with AI'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
              placeholder="Brief description for creators..."
              required
            />
          </div>

          {/* Section 3: Pricing & Escrow Budget Breakdown */}
          <div className="p-4 rounded-2xl bg-[#f8f7ff] border border-[#e2e0fb] space-y-3">
            <div className="text-[11px] font-extrabold text-[#4338ca] uppercase tracking-wide flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              <span>CPM Rate & Budget Allocation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[10px] uppercase">CPM Rate (₦ / 1k)</label>
                <input
                  type="number"
                  min={2000}
                  step={250}
                  value={cpmRate}
                  onChange={(e) => setCpmRate(Math.max(2000, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[10px] uppercase">Total Budget (₦)</label>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Math.max(10000, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[10px] uppercase">Min View Goal</label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={minViewThreshold}
                  onChange={(e) => setMinViewThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Target Social Networks */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#4338ca]" />
              <span>Target Social Networks *</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {allPlatforms.map((plat) => {
                const isSelected = channels.includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => toggleChannel(plat)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#4338ca] text-white border-[#4338ca] shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{plat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Creative Copy & External Assets */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Approved Caption / Text Copy</label>
              <textarea
                rows={2}
                value={creativeCopy}
                onChange={(e) => setCreativeCopy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                placeholder="Ready-to-post caption for creators..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Google Drive Folder URL</label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 text-[11px]"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Google Doc Brief URL</label>
                <input
                  type="url"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 text-[11px]"
                  placeholder="https://docs.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Section 6: Tags & Min Followers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Min Follower Goal</label>
              <input
                type="number"
                min={0}
                value={minFollowers}
                onChange={(e) => setMinFollowers(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800"
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Mandatory Hashtags</label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={(e) => setHashtagsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800"
                placeholder="#KpugiLaunch, #Ad"
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Mandatory Mentions</label>
              <input
                type="text"
                value={mentionsStr}
                onChange={(e) => setMentionsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800"
                placeholder="@KpugiApp"
              />
            </div>
          </div>

          {/* Section 7: Featured Promotion Toggle */}
          <div
            onClick={() => setIsFeatured(!isFeatured)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
              isFeatured
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className={`w-4 h-4 ${isFeatured ? 'text-amber-600' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold text-xs">Featured Campaign Status</div>
                <div className="text-[10px] text-slate-500">Sticky top placement on creator dashboard</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={() => {}}
              className="w-4 h-4 rounded border-amber-400 text-amber-600"
            />
          </div>

          {/* Footer Action Bar & Error Message */}
          <div className="pt-4 border-t border-slate-100 space-y-3 shrink-0">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-kpugi-blue hover:bg-indigo-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSubmitting ? 'Saving All Parameters...' : 'Save All Details'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
