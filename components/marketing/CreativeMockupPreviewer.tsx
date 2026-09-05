'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Smartphone, 
  Eye, 
  Sparkles, 
  Check, 
  RefreshCw,
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Music, 
  MoreHorizontal,
  Volume2,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import {
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from 'react-icons/fa6';
import { BsDisplay } from 'react-icons/bs';

type MockupPlatform = 'instagram' | 'tiktok' | 'twitter' | 'inapp_banner';

interface PresetCreative {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  title: string;
}

const PRESET_CREATIVES: PresetCreative[] = [
  {
    id: 'preset_fintech',
    name: 'Fintech Launch Reel',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1080&q=80',
    title: 'Instant Virtual Cards & Zero Transfer Fees',
    caption: 'Download the app today & get your instant virtual dollar card. Zero maintenance fees! 🚀💳 Link in bio. #fintech #promo',
  },
  {
    id: 'preset_ecommerce',
    name: 'Flash Sale Flyer',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1080&q=80',
    title: 'Payday Flash Sale — 50% Off Everything',
    caption: 'Big weekend discounts across all electronics & fashion! Use code PAYDAY50 at checkout. 🛍️ #flashsale #deals',
  },
  {
    id: 'preset_lifestyle',
    name: 'Brand Video Drop',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1080&q=80',
    title: 'Work Smart, Earn Everywhere',
    caption: 'The future of remote work for African creators and entrepreneurs. Sign up free today! ✨ #lifestyle #growth',
  },
];

export default function CreativeMockupPreviewer({
  className = '',
}: {
  className?: string;
}) {
  const [platform, setPlatform] = useState<MockupPlatform>('instagram');
  const [activePreset, setActivePreset] = useState<PresetCreative>(PRESET_CREATIVES[0]);
  const [customMediaUrl, setCustomMediaUrl] = useState<string | null>(null);
  const [customMediaType, setCustomMediaType] = useState<'image' | 'video'>('image');
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const objectUrl = URL.createObjectURL(file);

    setCustomMediaUrl(objectUrl);
    setCustomMediaType(isVideo ? 'video' : 'image');
  };

  const handleClearCustomMedia = () => {
    if (customMediaUrl) {
      URL.revokeObjectURL(customMediaUrl);
      setCustomMediaUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentMediaUrl = customMediaUrl || activePreset.url;
  const currentMediaType = customMediaUrl ? customMediaType : activePreset.type;
  const currentCaption = activePreset.caption;

  return (
    <section className={`py-16 md:py-24 px-4 md:px-16 max-w-7xl mx-auto transition-colors duration-300 ${className}`}>
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-16">
        <p className="font-mono text-xs uppercase tracking-widest text-[#2F49E8] dark:text-[#5B75FF] mb-2 font-bold">
          DROP SIMULATION & AD AUDIT
        </p>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
          Interactive Creative Mockup Previewer
        </h3>
        <p className="text-sm md:text-base text-slate-600 dark:text-neutral-400 mt-3 max-w-2xl mx-auto">
          Test how your brand flyers, videos, or banners will render when creators syndicate your drops across active social channels.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls, Upload, Presets & Safe Zone Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Platform Selector Tabs */}
          <div className="p-2 rounded-2xl bg-white dark:bg-[#0A0D1A] border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap gap-2">
            {[
              { id: 'instagram', label: 'Instagram Reels', icon: FaInstagram, color: 'text-pink-500' },
              { id: 'tiktok', label: 'TikTok Feed', icon: FaTiktok, color: 'text-slate-900 dark:text-white' },
              { id: 'twitter', label: 'X (Twitter)', icon: FaXTwitter, color: 'text-slate-900 dark:text-white' },
              { id: 'inapp_banner', label: 'Kpugi In-App Banner', icon: BsDisplay, color: 'text-[#2F49E8]' },
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = platform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id as MockupPlatform)}
                  className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#2F49E8] text-white shadow-md shadow-[#2F49E8]/30'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : p.color}`} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Upload Custom Creative Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0A0D1A] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">Upload Your Creative</h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Preview any finished brand video (MP4) or promotional graphic (PNG, JPG).
                </p>
              </div>
              {customMediaUrl && (
                <button
                  onClick={handleClearCustomMedia}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Presets</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="mockup-file-upload"
            />

            <label
              htmlFor="mockup-file-upload"
              className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#2F49E8] dark:hover:border-[#5B75FF] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/[0.02]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2F49E8]/10 text-[#2F49E8] flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {customMediaUrl ? 'Replace Uploaded Creative' : 'Click or Drag & Drop Media Here'}
              </span>
              <span className="text-[11px] text-slate-400">
                Recommended 9:16 (1080×1920) for Reels/TikTok, or 1:1 / 16:9 for Banners • Max 50MB
              </span>
            </label>

            {/* Quick Demo Presets */}
            {!customMediaUrl && (
              <div className="pt-2">
                <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium block mb-2">Or test with demo creative:</span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_CREATIVES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setActivePreset(preset)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        activePreset.id === preset.id
                          ? 'border-[#2F49E8] bg-[#2F49E8]/10 text-[#2F49E8] dark:text-[#5B75FF]'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="font-semibold truncate">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Safe Zone Overlay & Quality Controls */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0A0D1A] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">UI Safe Zone Overlay</h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Highlight native app buttons, captions, and status bars to ensure logos and text stay visible.
                </p>
              </div>
              <button
                onClick={() => setShowSafeZones(!showSafeZones)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showSafeZones ? 'bg-[#2F49E8]' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    showSafeZones ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {showSafeZones && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1 animate-in fade-in duration-150">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Safe Zone Guidelines Active:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  The red shaded boundaries indicate areas obscured by profile handles, right-side interaction icons (likes, comments, bookmarks), and bottom captions. Keep your brand logo and critical call-to-action text in the center clear zone.
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 border-t border-slate-100 dark:border-white/5">
              <span>Aspect Ratio: {platform === 'inapp_banner' ? '3:1 Banner' : '9:16 Vertical Screen'}</span>
              <span>Resolution Target: 1080 × 1920 px</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Interactive Device Mockup (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          {platform === 'inapp_banner' ? (
            /* In-App Banner Frame */
            <div className="w-full max-w-md rounded-2xl overflow-hidden border border-slate-300 dark:border-white/20 bg-slate-900 text-white shadow-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Kpugi Campaign Marketplace</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-white/10 px-2 py-0.5 rounded">Leaderboard / MPU</span>
              </div>

              {/* Simulated Feed Header */}
              <div className="p-3 rounded-xl bg-white/5 space-y-1">
                <span className="text-[10px] text-[#5B75FF] font-bold uppercase">Featured Sponsor Unit</span>
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  {currentMediaType === 'video' ? (
                    <video src={currentMediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={currentMediaUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                  )}
                  {showSafeZones && (
                    <div className="absolute inset-0 border-2 border-dashed border-red-500/80 bg-red-500/10 pointer-events-none flex items-center justify-center">
                      <span className="bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white">Full Viewable MPU Zone</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Below-banner simulated feed */}
              <div className="space-y-2 pt-2">
                <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
                <div className="h-2.5 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          ) : (
            /* Smartphone Frame for Reels / TikTok / X */
            <div className="relative w-[300px] sm:w-[320px] h-[600px] sm:h-[640px] rounded-[44px] p-3 bg-slate-900 shadow-2xl border-[5px] border-slate-700/80 dark:border-slate-800 ring-1 ring-white/20 select-none">
              {/* Dynamic Island / Top Speaker Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] ml-8" />
              </div>

              {/* Phone Display Screen */}
              <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-black">
                {/* Media Container */}
                <div className="absolute inset-0 w-full h-full">
                  {currentMediaType === 'video' ? (
                    <video
                      src={currentMediaUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={currentMediaUrl}
                      alt="Creative Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Subtle dark gradient overlay so text is readable */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

                {/* Safe Zone Visual Overlay */}
                {showSafeZones && (
                  <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
                    {/* Top Occlusion (15%) */}
                    <div className="h-20 bg-red-500/25 border-b-2 border-dashed border-red-500 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-red-200 bg-red-950/80 px-2 py-0.5 rounded">
                        Top App UI / Stories Bar
                      </span>
                    </div>

                    {/* Middle Clear Zone */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-[10px] font-bold">
                        ✓ Prime Brand Safe Focus Area
                      </div>
                    </div>

                    {/* Bottom Occlusion (25%) */}
                    <div className="h-36 bg-red-500/25 border-t-2 border-dashed border-red-500 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-red-200 bg-red-950/80 px-2 py-0.5 rounded">
                        Bottom Caption & Icon Area
                      </span>
                    </div>
                  </div>
                )}

                {/* ─── NATIVE APP UI: INSTAGRAM REELS ─── */}
                {platform === 'instagram' && (
                  <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-white pointer-events-none">
                    {/* Top Bar */}
                    <div className="pt-6 flex items-center justify-between">
                      <span className="text-sm font-bold tracking-tight">Reels</span>
                      <button 
                        onClick={() => setIsMuted(!isMuted)} 
                        className="pointer-events-auto w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Section + Right Action Rail */}
                    <div className="flex items-end justify-between gap-3 pb-4">
                      {/* Left: Creator Info & Caption */}
                      <div className="space-y-2 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-slate-800" />
                          </div>
                          <span className="text-xs font-bold">@brand_drop_creator</span>
                        </div>
                        <p className="text-[11px] line-clamp-2 text-white/90 leading-tight">
                          {currentCaption}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                          <Music className="w-3 h-3" />
                          <span className="truncate">Original Sound • Trending Brand Audio</span>
                        </div>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex flex-col items-center gap-3.5">
                        <div className="flex flex-col items-center gap-0.5">
                          <Heart className="w-6 h-6 stroke-[2]" />
                          <span className="text-[10px] font-semibold">184K</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <MessageCircle className="w-6 h-6 stroke-[2]" />
                          <span className="text-[10px] font-semibold">1.2K</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <Share2 className="w-5 h-5 stroke-[2]" />
                          <span className="text-[10px] font-semibold">42K</span>
                        </div>
                        <MoreHorizontal className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── NATIVE APP UI: TIKTOK ─── */}
                {platform === 'tiktok' && (
                  <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-white pointer-events-none">
                    {/* Top Bar */}
                    <div className="pt-6 flex items-center justify-center gap-4 text-xs font-bold text-white/70">
                      <span>Following</span>
                      <span className="text-white border-b-2 border-white pb-0.5">For You</span>
                    </div>

                    {/* Bottom & Right Rail */}
                    <div className="flex items-end justify-between gap-3 pb-4">
                      {/* Left: User & Caption */}
                      <div className="space-y-1.5 max-w-[200px]">
                        <span className="text-xs font-bold">@kpugi_creator</span>
                        <p className="text-[11px] line-clamp-2 text-white/90 leading-tight">
                          {currentCaption}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                          <Music className="w-3 h-3 animate-spin" />
                          <span className="truncate">Kpugi Viral Track - Original</span>
                        </div>
                      </div>

                      {/* Right Action Rail */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-slate-700 border border-white" />
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            +
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                          <span className="text-[10px] font-semibold">290K</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <MessageCircle className="w-6 h-6 stroke-[2]" />
                          <span className="text-[10px] font-semibold">3.8K</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-semibold">42K</span>
                        </div>
                        <Share2 className="w-6 h-6 stroke-[2]" />
                        <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-600 animate-spin flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── NATIVE APP UI: X (TWITTER) ─── */}
                {platform === 'twitter' && (
                  <div className="absolute inset-0 p-4 flex flex-col justify-end z-10 text-white pointer-events-none bg-black/40">
                    <div className="bg-black/85 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
                          KP
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs font-bold">
                            <span>Creator Partner</span>
                            <span className="text-blue-400">✓</span>
                          </div>
                          <span className="text-[10px] text-slate-400">@verified_partner</span>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-200">
                        {currentCaption}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                        <span>💬 412</span>
                        <span>🔁 1.8K</span>
                        <span>❤️ 9.4K</span>
                        <span>📊 420K</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
