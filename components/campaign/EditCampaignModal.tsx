'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Save, Loader2, FileText, AlertCircle, Coins, Target, TrendingUp, Clock, Sparkle, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { updateCampaignDetailsAction, generateAICampaignPolishAction } from '@/app/actions/campaign';
import { PlatformBadge } from '@/components/ui/SocialIcons';
import { optimizeImageFile } from '@/lib/utils/imageOptimizer';

interface EditCampaignModalProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    cover_image_url?: string;
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
  const [coverImageUrl, setCoverImageUrl] = useState((campaign as any).cover_image_url || '');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await optimizeImageFile(file, 1200, 1200, 0.82);
      setCoverImageUrl(compressedBase64);
    } catch (err) {
      setImageError('Failed to process image. Please try another file.');
    }
  };

  const removeCoverImage = () => {
    setCoverImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      cover_image_url: coverImageUrl,
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

  const isLive = campaign.status === 'live';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-[#12141A] rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] text-kpugi-ink dark:text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-900 dark:bg-[#161820] text-white shrink-0">
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
            className="w-8 h-8 rounded-full bg-slate-800 dark:bg-white/10 hover:bg-slate-700 dark:hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs font-sans">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-500/30 text-red-700 dark:text-rose-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLive && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-xs">Financial & Title Parameters Locked</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-400">
                  Campaign Title, CPM Rate, Total Budget, and Minimum View Goal cannot be changed while a campaign is Live to protect joined creators. Cover image, brief description, target channels, and creative guidelines remain fully editable.
                </p>
              </div>
            </div>
          )}

          {/* Cover Image Re-upload Section */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-kpugi-blue dark:text-blue-400" />
                <span>Campaign Cover Image</span>
              </label>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="text-[10px] text-red-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {imageError && (
              <p className="text-[11px] font-bold text-red-600 dark:text-rose-400">{imageError}</p>
            )}

            {coverImageUrl ? (
              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-900">
                <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold"
                >
                  <Upload className="w-4 h-4" />
                  <span>Re-upload New Cover Image</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-24 border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-kpugi-blue/50 rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer bg-white dark:bg-white/5 transition-colors text-center"
              >
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload cover image</span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP (Auto-optimized in browser)</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCoverImageUpload}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          {/* Section 1: Campaign Title & Ad Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Campaign Title *</span>
                {isLive && <span className="text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 rounded text-[9px]">🔒 Locked</span>}
              </label>
              {isLive ? (
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between select-none">
                  <span className="truncate">{title}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">READ ONLY</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                  placeholder="Campaign Title"
                  required
                />
              )}
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Ad Format</label>
              <select
                value={adFormat}
                onChange={(e) => setAdFormat(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-slate-900 dark:text-white bg-white dark:bg-[#161820] focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
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
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Brief Description *</label>
              <button
                type="button"
                onClick={handleAiExpandBrief}
                disabled={isAiLoading}
                className="text-[10px] font-bold text-kpugi-blue dark:text-blue-400 hover:text-indigo-700 flex items-center gap-1 bg-kpugi-paper dark:bg-white/5 px-2 py-0.5 rounded-md border border-kpugi-border dark:border-white/10"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isAiLoading ? 'AI Polishing...' : 'Polish with AI'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
              placeholder="Brief description for creators..."
              required
            />
          </div>

          {/* Section 3: Pricing & Campaign Budget Breakdown */}
          <div className={`p-4 rounded-2xl border space-y-3 ${isLive ? 'bg-slate-100/70 dark:bg-white/5 border-slate-200 dark:border-white/10' : 'bg-[#f8f7ff] dark:bg-indigo-950/20 border-[#e2e0fb] dark:border-indigo-500/20'}`}>
            <div className="text-[11px] font-extrabold text-[#4338ca] dark:text-indigo-400 uppercase tracking-wide flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                <span>CPM Rate & Budget Allocation</span>
              </div>
              {isLive && (
                <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full font-bold">
                  🔒 Locked Live Parameters
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase">CPM Rate (₦ / 1k)</label>
                {isLive ? (
                  <div className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-200/70 dark:bg-white/10 font-mono font-bold text-slate-700 dark:text-slate-300 select-none">
                    ₦{cpmRate.toLocaleString()}
                  </div>
                ) : (
                  <input
                    type="number"
                    min={2000}
                    step={250}
                    value={cpmRate}
                    onChange={(e) => setCpmRate(Math.max(2000, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase">Total Budget (₦)</label>
                {isLive ? (
                  <div className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-200/70 dark:bg-white/10 font-mono font-bold text-slate-700 dark:text-slate-300 select-none">
                    ₦{totalBudget.toLocaleString()}
                  </div>
                ) : (
                  <input
                    type="number"
                    min={10000}
                    step={5000}
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Math.max(10000, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase">Min View Goal</label>
                {isLive ? (
                  <div className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-200/70 dark:bg-white/10 font-mono font-bold text-slate-700 dark:text-slate-300 select-none">
                    {minViewThreshold.toLocaleString()} views
                  </div>
                ) : (
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={minViewThreshold}
                    onChange={(e) => setMinViewThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Target Social Networks */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#4338ca] dark:text-indigo-400" />
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
                        ? 'bg-[#4338ca] dark:bg-indigo-600 text-white border-[#4338ca] dark:border-indigo-600 shadow-2xs'
                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{plat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Creative Copy & External Assets */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-white/10">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Approved Caption / Text Copy</label>
              <textarea
                rows={2}
                value={creativeCopy}
                onChange={(e) => setCreativeCopy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                placeholder="Ready-to-post caption for creators..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Google Drive Folder URL</label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 text-[11px]"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Google Doc Brief URL</label>
                <input
                  type="url"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 text-[11px]"
                  placeholder="https://docs.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Section 6: Tags & Min Followers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Min Follower Goal</label>
              <input
                type="number"
                min={0}
                value={minFollowers}
                onChange={(e) => setMinFollowers(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Mandatory Hashtags</label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={(e) => setHashtagsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200"
                placeholder="#KpugiLaunch, #Ad"
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Mandatory Mentions</label>
              <input
                type="text"
                value={mentionsStr}
                onChange={(e) => setMentionsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200"
                placeholder="@KpugiApp"
              />
            </div>
          </div>

          {/* Section 7: Featured Promotion Toggle */}
          <div
            onClick={() => setIsFeatured(!isFeatured)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
              isFeatured
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300'
                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className={`w-4 h-4 ${isFeatured ? 'text-amber-600' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold text-xs">Featured Campaign Status</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Sticky top placement on creator dashboard</div>
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
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-3 shrink-0">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-500/30 text-red-700 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
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
