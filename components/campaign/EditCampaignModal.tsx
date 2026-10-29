'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Save,
  Loader2,
  FileText,
  AlertCircle,
  Coins,
  Target,
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2,
  Video,
  Check,
  Wallet,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  updateCampaignDetailsAction,
  generateAICampaignPolishAction,
  getAdvertiserWalletBalanceAction,
  upgradeCampaignToFeaturedAction,
} from '@/app/actions/campaign';
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  TwitterXIcon,
  LinkedInIcon,
} from '@/components/ui/SocialIcons';
import CampaignBriefEditor from './CampaignBriefEditor';

interface EditCampaignModalProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    cover_image_url?: string | null;
    ad_format?: string;
    cpm_rate?: number;
    total_budget?: number;
    min_view_threshold?: number;
    required_live_duration_hours?: number;
    channels?: string[];
    objective?: string;
    is_featured?: boolean;
    requirements?: any;
    status: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const ALL_PLATFORMS = [
  { id: 'TikTok', name: 'TikTok', icon: TikTokIcon },
  { id: 'Instagram', name: 'Instagram', icon: InstagramIcon },
  { id: 'YouTube', name: 'YouTube Shorts', icon: YouTubeIcon },
  { id: 'Facebook', name: 'Facebook', icon: FacebookIcon },
  { id: 'X', name: 'X (Twitter)', icon: TwitterXIcon },
  { id: 'LinkedIn', name: 'LinkedIn', icon: LinkedInIcon },
];

const AD_FORMAT_OPTIONS = [
  {
    id: 'Video Asset',
    title: 'Video Creative',
    desc: 'Ready-to-post video file for creators to publish.',
    icon: Video,
  },
  {
    id: 'Image Banner',
    title: 'Image & Banner',
    desc: 'Graphic banner, poster, or photo creative.',
    icon: ImageIcon,
  },
  {
    id: 'Text Caption',
    title: 'Text Copy & Caption',
    desc: 'Approved promotional text, copy, or link.',
    icon: FileText,
  },
];

export function EditCampaignModal({ campaign, onClose, onSuccess }: EditCampaignModalProps) {
  // Preload and normalize Ad Format
  const normalizeInitialAdFormat = () => {
    const raw = (campaign.requirements?.display_ad_format || campaign.ad_format || '').toLowerCase();
    if (raw.includes('image') || raw.includes('photo') || raw.includes('banner')) return 'Image Banner';
    if (raw.includes('text') || raw.includes('copy') || raw.includes('caption')) return 'Text Caption';
    return 'Video Asset';
  };

  // Preload and normalize Channels
  const normalizeInitialChannels = (): string[] => {
    const raw = campaign.channels || [];
    if (!raw || raw.length === 0) return ['TikTok', 'Instagram'];
    const set = new Set<string>();
    raw.forEach((c) => {
      const lower = (c || '').toLowerCase();
      if (lower.includes('twitter') || lower === 'x') set.add('X');
      else if (lower.includes('tiktok')) set.add('TikTok');
      else if (lower.includes('instagram')) set.add('Instagram');
      else if (lower.includes('youtube')) set.add('YouTube');
      else if (lower.includes('facebook')) set.add('Facebook');
      else if (lower.includes('linkedin')) set.add('LinkedIn');
      else if (c.trim()) set.add(c.trim());
    });
    return Array.from(set);
  };

  // Form states
  const [title, setTitle] = useState(campaign.title || '');
  const [description, setDescription] = useState(campaign.description || '');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    campaign.cover_image_url || campaign.requirements?.cover_image_url || ''
  );
  const [adFormat, setAdFormat] = useState<string>(normalizeInitialAdFormat());
  const [channels, setChannels] = useState<string[]>(normalizeInitialChannels());

  // Creative assets
  const [creativeVideoUrl, setCreativeVideoUrl] = useState<string>(
    campaign.requirements?.creative_video_url || ''
  );
  const [creativeImageUrl, setCreativeImageUrl] = useState<string>(
    campaign.requirements?.creative_image_url || ''
  );
  const [creativeCopy, setCreativeCopy] = useState<string>(
    campaign.requirements?.creative_text_copy || ''
  );
  const [captionSuggestion, setCaptionSuggestion] = useState<string>(
    campaign.requirements?.caption_suggestion || ''
  );

  // Financial and live settings
  const [cpmRate, setCpmRate] = useState<number>(campaign.cpm_rate || 2000);
  const [totalBudget, setTotalBudget] = useState<number>(campaign.total_budget || 100000);
  const [minViewThreshold, setMinViewThreshold] = useState<number>(campaign.min_view_threshold || 1000);
  const [liveHours, setLiveHours] = useState<number>(campaign.required_live_duration_hours || 72);

  // Requirements & targeting
  const [driveUrl, setDriveUrl] = useState<string>(campaign.requirements?.google_drive_url || '');
  const [docUrl, setDocUrl] = useState<string>(campaign.requirements?.google_doc_url || '');
  const [hashtagsStr, setHashtagsStr] = useState<string>(
    (campaign.requirements?.hashtags || []).join(', ')
  );
  const [mentionsStr, setMentionsStr] = useState<string>(
    (campaign.requirements?.mentions || []).join(', ')
  );
  const [minFollowers, setMinFollowers] = useState<number>(
    campaign.requirements?.min_followers || 1000
  );

  // Featured status & separate checkout state
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(campaign.is_featured));
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [upgradeError, setUpgradeError] = useState<string>('');
  const [upgradeSuccess, setUpgradeSuccess] = useState<string>('');

  // UI state
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [imageError, setImageError] = useState('');
  const [assetError, setAssetError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch advertiser wallet balance for seamless upgrade checks
    getAdvertiserWalletBalanceAction().then((res) => {
      setWalletBalance(res.balance || 0);
    });
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting && !isUpgrading) {
        if (showUpgradeModal) setShowUpgradeModal(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, isUpgrading, showUpgradeModal, onClose]);

  const toggleChannel = (ch: string) => {
    if (channels.includes(ch)) {
      if (channels.length === 1) return; // Must keep at least 1
      setChannels(channels.filter((c) => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  // Upload Cover Image via API proxy
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setImageError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    try {
      setIsUploadingCover(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'covers');

      const res = await fetch('/api/campaigns/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      setIsUploadingCover(false);

      if (data.success && data.url) {
        setCoverImageUrl(data.url);
      } else {
        setImageError(data.error || 'Failed to upload cover banner.');
      }
    } catch {
      setIsUploadingCover(false);
      setImageError('Network error uploading cover image.');
    }
  };

  const removeCoverImage = () => {
    setCoverImageUrl('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Upload Creative File (Video or Image)
  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssetError('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAsset(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'creatives');

      const res = await fetch('/api/campaigns/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      setIsUploadingAsset(false);

      if (data.success && data.url) {
        if (adFormat === 'Video Asset') {
          setCreativeVideoUrl(data.url);
        } else {
          setCreativeImageUrl(data.url);
        }
      } else {
        setAssetError(data.error || 'Failed to upload creative file.');
      }
    } catch {
      setIsUploadingAsset(false);
      setAssetError('Network error uploading creative file.');
    }
  };

  // AI Brief Polish
  const handleAiExpandBrief = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a Campaign Title first.');
      return;
    }
    setErrorMsg('');
    setIsAiLoading(true);

    const cleanDraft = (description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const approvedChannels = channels.length > 0 ? channels.join(', ') : 'approved campaign channels';
    const contextPrompt = `Campaign Title: ${title.trim()}
Primary Campaign Goal: ${campaign.objective || 'Brand Awareness'}
Approved Channels: ${approvedChannels}
Brand Notes / Draft Input: ${cleanDraft || 'No notes provided'}`;

    const res = await generateAICampaignPolishAction(contextPrompt, 'description');
    setIsAiLoading(false);

    if (res.success && res.text) {
      setDescription(res.text.slice(0, 2000));
    } else {
      setErrorMsg(res.error || 'AI generation failed.');
    }
  };

  // AI Caption Generation
  const handleAiGenerateCaption = async () => {
    if (!title.trim() && !description.trim()) {
      setErrorMsg('Please enter a Campaign Title or Brief first.');
      return;
    }
    setErrorMsg('');
    setIsAiLoading(true);

    const rawBrief = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const contextPrompt = `Campaign Title: ${title.trim()}\nCampaign Brief: ${rawBrief || 'N/A'}`;
    const res = await generateAICampaignPolishAction(contextPrompt, 'caption');
    setIsAiLoading(false);

    if (res.success && res.text) {
      setCreativeCopy(res.text);
      if (!captionSuggestion) setCaptionSuggestion(res.text);
    } else {
      setErrorMsg(res.error || 'AI caption generation failed.');
    }
  };

  // Dedicated Featured Campaign Upgrade Flow (₦2,500)
  const handleUpgradeToFeatured = async (method: 'wallet' | 'bachs') => {
    setUpgradeError('');
    setIsUpgrading(true);

    try {
      const res = await upgradeCampaignToFeaturedAction({
        campaignId: campaign.id,
        paymentMethod: method,
      });

      setIsUpgrading(false);

      if (res.success) {
        if (method === 'bachs' && res.checkout_url) {
          window.location.href = res.checkout_url;
          return;
        }
        setIsFeatured(true);
        setUpgradeSuccess('Campaign successfully upgraded to Featured! (₦2,500 deducted from wallet)');
        setShowUpgradeModal(false);
        onSuccess();
      } else {
        setUpgradeError(res.error || 'Failed to upgrade campaign to Featured.');
      }
    } catch (err: any) {
      setIsUpgrading(false);
      setUpgradeError(err?.message || 'Error executing upgrade.');
    }
  };

  // Save All Allowed Details
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
    setSuccessMsg('');

    const hashtagsArr = hashtagsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const mentionsArr = mentionsStr.split(',').map((s) => s.trim()).filter(Boolean);

    const payloadRequirements = {
      ...(campaign.requirements || {}),
      display_ad_format: adFormat,
      cover_image_url: coverImageUrl,
      creative_text_copy: creativeCopy.trim(),
      caption_suggestion: captionSuggestion.trim() || creativeCopy.trim(),
      creative_video_url: adFormat === 'Video Asset' ? creativeVideoUrl.trim() : undefined,
      creative_image_url: adFormat === 'Image Banner' ? creativeImageUrl.trim() : undefined,
      google_drive_url: driveUrl.trim(),
      google_doc_url: docUrl.trim(),
      hashtags: hashtagsArr,
      mentions: mentionsArr,
      min_followers: Number(minFollowers),
    };

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
      requirements: payloadRequirements,
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
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isUpgrading) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-3xl bg-white dark:bg-[#12141A] rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-900 dark:bg-[#161820] text-white shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-display text-base sm:text-lg font-extrabold">Edit Campaign</h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                {campaign.status}
              </span>
              {isFeatured && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Featured
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Preloaded with existing campaign configuration. Edit allowed parameters below.
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
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs font-sans">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-500/30 text-red-700 dark:text-rose-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {upgradeSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{upgradeSuccess}</span>
            </div>
          )}

          {isLive && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-xs">Financial & Title Parameters Locked</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-400">
                  Campaign Title, CPM Rate, Total Budget, and Minimum View Goal cannot be modified while Live to protect joined creators. Cover image, brief description, channels, and creative guidelines remain fully editable.
                </p>
              </div>
            </div>
          )}

          {/* 1. COVER BANNER SECTION */}
          <div className="space-y-2 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-kpugi-blue dark:text-blue-400" />
                <span>Campaign Cover Banner</span>
              </label>
              {coverImageUrl && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="text-xs text-kpugi-blue dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    disabled={isUploadingCover}
                    className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>

            {imageError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{imageError}</p>
            )}

            {coverImageUrl ? (
              <div className="relative h-36 sm:h-44 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-900">
                <img
                  src={coverImageUrl}
                  alt="Campaign Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading new cover...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Click to Replace Cover Image</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div
                onClick={() => !isUploadingCover && coverInputRef.current?.click()}
                className="h-28 border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-kpugi-blue/60 rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer bg-white dark:bg-white/5 transition-colors text-center"
              >
                {isUploadingCover ? (
                  <div className="flex items-center gap-2 text-kpugi-blue font-bold">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading Cover Banner...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Upload Campaign Cover Image
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, or WEBP (Recommended 1200 x 630px)
                    </span>
                  </>
                )}
              </div>
            )}
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          {/* 2. TITLE & AD FORMAT */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Campaign Title *</span>
                {isLive && (
                  <span className="text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded text-[9px]">
                    🔒 Locked Live
                  </span>
                )}
              </label>
              {isLive ? (
                <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between select-none">
                  <span className="truncate">{title}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">READ ONLY</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kpugi-blue/30"
                  placeholder="e.g. Summer Product Launch"
                  required
                />
              )}
            </div>

            {/* Ad Format Selector (Cards with clear preselection) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                Ad Format Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {AD_FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = adFormat === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAdFormat(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-kpugi-blue dark:border-blue-500 text-slate-900 dark:text-white ring-1 ring-kpugi-blue/30'
                          : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-kpugi-blue text-white'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{opt.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-kpugi-blue shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. CREATIVE ASSET ATTACHMENT SECTION */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                {adFormat === 'Video Asset' && 'Official Video Asset'}
                {adFormat === 'Image Banner' && 'Official Graphic Banner / Photo Asset'}
                {adFormat === 'Text Caption' && 'Approved Post Copy & Promotion Text'}
              </label>
              {assetError && (
                <span className="text-[11px] font-bold text-rose-600">{assetError}</span>
              )}
            </div>

            {adFormat === 'Video Asset' && (
              <div className="space-y-2">
                {creativeVideoUrl ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Video className="w-5 h-5 text-kpugi-blue shrink-0" />
                      <span className="font-mono text-xs truncate max-w-xs sm:max-w-md">
                        {creativeVideoUrl}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => assetInputRef.current?.click()}
                        disabled={isUploadingAsset}
                        className="text-xs font-bold text-kpugi-blue hover:underline"
                      >
                        {isUploadingAsset ? 'Uploading...' : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreativeVideoUrl('')}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={() => assetInputRef.current?.click()}
                      disabled={isUploadingAsset}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 hover:border-kpugi-blue text-xs font-bold flex items-center justify-center gap-2"
                    >
                      {isUploadingAsset ? (
                        <Loader2 className="w-4 h-4 animate-spin text-kpugi-blue" />
                      ) : (
                        <Upload className="w-4 h-4 text-kpugi-blue" />
                      )}
                      <span>Upload Video File (MP4, MOV, WebM)</span>
                    </button>
                    <span className="text-[10px] text-slate-400">or enter link:</span>
                    <input
                      type="url"
                      value={creativeVideoUrl}
                      onChange={(e) => setCreativeVideoUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or media URL"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-mono"
                    />
                  </div>
                )}
                <input
                  type="file"
                  ref={assetInputRef}
                  onChange={handleAssetUpload}
                  accept="video/mp4,video/quicktime,video/webm"
                  className="hidden"
                />
              </div>
            )}

            {adFormat === 'Image Banner' && (
              <div className="space-y-2">
                {creativeImageUrl ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={creativeImageUrl}
                        alt="Creative Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0"
                      />
                      <span className="font-mono text-xs truncate max-w-xs sm:max-w-md">
                        {creativeImageUrl}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => assetInputRef.current?.click()}
                        disabled={isUploadingAsset}
                        className="text-xs font-bold text-kpugi-blue hover:underline"
                      >
                        {isUploadingAsset ? 'Uploading...' : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreativeImageUrl('')}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => assetInputRef.current?.click()}
                      disabled={isUploadingAsset}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 hover:border-kpugi-blue text-xs font-bold flex items-center justify-center gap-2"
                    >
                      {isUploadingAsset ? (
                        <Loader2 className="w-4 h-4 animate-spin text-kpugi-blue" />
                      ) : (
                        <Upload className="w-4 h-4 text-kpugi-blue" />
                      )}
                      <span>Upload Image Creative (JPG, PNG, WebP)</span>
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={assetInputRef}
                  onChange={handleAssetUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
            )}

            {/* Caption & Text Copy Area */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase text-slate-600 dark:text-slate-400">
                  Approved Caption / Copy for Creators
                </span>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={handleAiGenerateCaption}
                  className="text-[10px] font-bold text-kpugi-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2 py-0.5 rounded-full transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isAiLoading ? 'Polishing...' : 'AI Generate'}</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={creativeCopy}
                onChange={(e) => {
                  setCreativeCopy(e.target.value);
                  if (!captionSuggestion) setCaptionSuggestion(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20"
                placeholder="Ready-to-post caption for creators..."
              />
            </div>
          </div>

          {/* 4. BRIEF DESCRIPTION */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                Brief Description *
              </label>
              <button
                type="button"
                onClick={handleAiExpandBrief}
                disabled={isAiLoading}
                className="text-[10px] font-bold text-kpugi-blue dark:text-blue-400 hover:text-indigo-700 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isAiLoading ? 'Polishing Brief...' : 'Polish with AI'}</span>
              </button>
            </div>
            <CampaignBriefEditor
              value={description}
              onChange={setDescription}
              placeholder="Detailed brief description for creators..."
              maxLength={2000}
              isAiLoading={isAiLoading}
            />
          </div>

          {/* 5. PRICING & BUDGET ALLOCATION */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${
              isLive
                ? 'bg-slate-100/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-500/20'
            }`}
          >
            <div className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                <span>CPM Rate & Budget Allocation</span>
              </div>
              {isLive && (
                <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full font-bold">
                  🔒 Locked Live
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase">
                  CPM Rate (₦ / 1k views)
                </label>
                {isLive ? (
                  <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-200/70 dark:bg-white/10 font-mono font-bold text-slate-700 dark:text-slate-300 select-none">
                    ₦{cpmRate.toLocaleString()}
                  </div>
                ) : (
                  <input
                    type="number"
                    min={2000}
                    step={250}
                    value={cpmRate}
                    onChange={(e) => setCpmRate(Math.max(2000, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase">
                  Total Budget (₦)
                </label>
                {isLive ? (
                  <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-200/70 dark:bg-white/10 font-mono font-bold text-slate-700 dark:text-slate-300 select-none">
                    ₦{totalBudget.toLocaleString()}
                  </div>
                ) : (
                  <input
                    type="number"
                    min={10000}
                    step={5000}
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Math.max(10000, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase">
                  Min View Goal
                </label>
                {isLive ? (
                  <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-200/70 dark:bg-white/10 font-mono font-bold text-slate-700 dark:text-slate-300 select-none">
                    {minViewThreshold.toLocaleString()} views
                  </div>
                ) : (
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={minViewThreshold}
                    onChange={(e) => setMinViewThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 6. TARGET SOCIAL NETWORKS (All 6 Platforms with Branded Icons) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-kpugi-blue dark:text-blue-400" />
              <span>Target Social Networks * (Select all accepted platforms)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ALL_PLATFORMS.map((plat) => {
                const Icon = plat.icon;
                const isSelected = channels.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => toggleChannel(plat.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-kpugi-blue dark:text-blue-400 border-kpugi-blue dark:border-blue-500 ring-1 ring-kpugi-blue/30'
                        : 'bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{plat.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-kpugi-blue shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. RESOURCES & GUIDELINES */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Google Drive Asset Folder
                </label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 text-xs"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Google Doc Brief / Guidelines
                </label>
                <input
                  type="url"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 text-xs"
                  placeholder="https://docs.google.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Min Follower Requirement
                </label>
                <input
                  type="number"
                  min={0}
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 text-xs"
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Mandatory Hashtags
                </label>
                <input
                  type="text"
                  value={hashtagsStr}
                  onChange={(e) => setHashtagsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 text-xs"
                  placeholder="#KpugiLaunch, #Ad"
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Mandatory Mentions
                </label>
                <input
                  type="text"
                  value={mentionsStr}
                  onChange={(e) => setMentionsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-slate-800 dark:text-slate-200 text-xs"
                  placeholder="@KpugiApp"
                />
              </div>
            </div>
          </div>

          {/* 8. FEATURED CAMPAIGN STATUS (PAID SERVICE - SEPARATE CHECKOUT ENFORCED) */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/10">
            {isFeatured ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
                        Featured Campaign Status Active
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        Priority Placement
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      This campaign enjoys sticky top priority ranking on the creator discovery feeds.
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Featured Campaign Upgrade
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        ₦2,500 Fee
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Pin this campaign to the top of creator discovery for up to 3x faster applications. Paid feature with separate checkout.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to Featured</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-3 shrink-0">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-kpugi-blue hover:bg-blue-600 text-white font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* SEPARATE FEATURED UPGRADE CHECKOUT MODAL */}
        {showUpgradeModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget && !isUpgrading) setShowUpgradeModal(false);
            }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          >
            <div className="w-full max-w-md bg-white dark:bg-[#161820] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 space-y-5 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">Upgrade to Featured</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sticky placement on Creator Explore Feed
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {upgradeError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{upgradeError}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Upgrade Item:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">Featured Campaign Priority</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">One-Time Fee:</span>
                  <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                    ₦2,500
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Payment Method
                </span>

                {/* Option 1: Brand Wallet */}
                <button
                  type="button"
                  disabled={isUpgrading || walletBalance < 2500}
                  onClick={() => handleUpgradeToFeatured('wallet')}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-kpugi-blue text-left flex items-center justify-between transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>Pay from Brand Wallet</span>
                        <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                          (₦{walletBalance.toLocaleString()} available)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Instant deduction, no gateway redirect
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Option 2: Bachs Checkout */}
                <button
                  type="button"
                  disabled={isUpgrading}
                  onClick={() => handleUpgradeToFeatured('bachs')}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-kpugi-blue text-left flex items-center justify-between transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-kpugi-blue flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Bachs Instant Checkout</div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Bank Transfer, Debit Cards &amp; Stablecoins
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {isUpgrading && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-kpugi-blue text-xs font-bold flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Upgrade Checkout...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
