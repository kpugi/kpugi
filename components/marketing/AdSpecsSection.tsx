'use client';

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Info,
  Maximize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BsDisplay } from 'react-icons/bs';

interface SpecItem {
  id: string;
  name: string;
  category: 'social' | 'display';
  dimensions: string;
  aspectRatio: string;
  channels: string[];
  formats: string[];
  maxSize: string;
  duration?: string;
  safeZone: string;
  description: string;
}

const SPEC_ITEMS: SpecItem[] = [
  {
    id: 'vertical_video',
    name: 'Vertical Video Drop (Full Screen)',
    category: 'social',
    dimensions: '1080 × 1920 px',
    aspectRatio: '9:16',
    channels: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Instagram Stories'],
    formats: ['MP4', 'MOV', 'H.264 Codec', 'AAC Audio'],
    maxSize: '100 MB',
    duration: '15s - 60s (30s optimal)',
    safeZone: 'Keep text & logos 150px from top and 250px from bottom (avoids native handle and caption overlays).',
    description: 'The highest-converting format for mobile attention. Brands upload ready commercials or motion graphic clips; creators syndicate directly with 0 filming.',
  },
  {
    id: 'square_flyer',
    name: 'Square & Portrait Graphic Drop',
    category: 'social',
    dimensions: '1080 × 1080 px (1:1) or 1080 × 1350 px (4:5)',
    aspectRatio: '1:1 or 4:5',
    channels: ['Instagram Feed', 'X (Twitter)', 'Facebook Feed'],
    formats: ['PNG', 'JPG', 'WebP'],
    maxSize: '15 MB',
    safeZone: 'Center layout with 40px margin around all borders; ensure CTA button is high contrast.',
    description: 'Ideal for promo discounts, product launch posters, webinar flyers, and announcement carousels. Quick to launch with immediate syndication velocity.',
  },
  {
    id: 'leaderboard_banner',
    name: 'Leaderboard & Billboard Display Unit',
    category: 'display',
    dimensions: '970 × 250 px / 728 × 90 px',
    aspectRatio: '3.88:1 / 8.09:1',
    channels: ['Top of Kpugi Campaign Catalog (/browse)', 'Creator Dashboard Headers'],
    formats: ['PNG', 'JPG', 'WebP', 'Animated GIF'],
    maxSize: '250 KB',
    safeZone: 'Full viewable area. 98% above the fold viewability across all desktop viewport widths.',
    description: 'Premier desktop billboard reaching brand founders and creators starting their daily campaign sessions on Kpugi.',
  },
  {
    id: 'mpu_banner',
    name: 'Medium Rectangle (MPU)',
    category: 'display',
    dimensions: '300 × 250 px / 336 × 280 px',
    aspectRatio: '6:5',
    channels: ['In-Feed Campaign Grid', 'Clock-In Screens', 'Right Analytics Panels'],
    formats: ['PNG', 'JPG', 'WebP', 'Animated GIF'],
    maxSize: '150 KB',
    safeZone: 'Standard IAB safe zone. High CTR unit embedded directly alongside active campaign listings.',
    description: 'The industry-standard high-click unit capturing undivided attention during creator clock-in and submission tasks.',
  },
  {
    id: 'skyscraper_banner',
    name: 'Half-Page / Skyscraper Banner',
    category: 'display',
    dimensions: '300 × 600 px',
    aspectRatio: '1:2',
    channels: ['Desktop Dashboard Sticky Sidebar', 'Wallet & Payout Analytics'],
    formats: ['PNG', 'JPG', 'WebP', 'Animated GIF'],
    maxSize: '300 KB',
    safeZone: 'Vertical clear container. 100% persistent view as users scroll long data tables.',
    description: 'A towering vertical canvas ideal for rich product visuals, fintech apps, and SaaS feature breakdowns.',
  },
  {
    id: 'mobile_anchor',
    name: 'Mobile Anchor Banner',
    category: 'display',
    dimensions: '320 × 50 px / 320 × 100 px',
    aspectRatio: '6.4:1 / 3.2:1',
    channels: ['Mobile Sticky Bottom Bar', 'Mobile Navigation Dividers'],
    formats: ['PNG', 'JPG', 'WebP'],
    maxSize: '100 KB',
    safeZone: '100% fixed bottom screen retention; optimized for 70%+ mobile creator traffic.',
    description: 'Lightweight fixed mobile unit delivering constant brand recall without interrupting creator workflow.',
  },
];

export default function AdSpecsSection({
  className = '',
}: {
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState<'social' | 'display'>('social');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyDimensions = (id: string, dimensions: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(dimensions);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'Dimensions Copied!',
        description: `Copied ${dimensions} to clipboard.`,
      });
    }
  };

  const filteredSpecs = SPEC_ITEMS.filter((item) => item.category === activeTab);

  return (
    <section className={`py-16 md:py-24 px-4 md:px-16 max-w-7xl mx-auto transition-colors duration-300 ${className}`}>
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-16">
        <p className="font-mono text-xs uppercase tracking-widest text-[#17A75B] mb-2 font-bold">
          DESIGN & ASSET SPECIFICATIONS
        </p>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
          Ad Specs & Dimension Guidelines
        </h3>
        <p className="text-sm md:text-base text-slate-600 dark:text-neutral-400 mt-3 max-w-2xl mx-auto">
          Everything your creative team or agency needs to prepare pixel-perfect assets for viral creator drops and display banners.
        </p>
      </div>

      {/* Category Toggle Tabs */}
      <div className="flex items-center justify-center mb-10">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'social'
                ? 'bg-[#2F49E8] text-white shadow-md'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Social Creative Drops (Reels / TikTok / X)</span>
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'display'
                ? 'bg-[#2F49E8] text-white shadow-md'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BsDisplay className="w-4 h-4" />
            <span>On-Platform Display Banners</span>
          </button>
        </div>
      </div>

      {/* Specs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredSpecs.map((spec) => (
          <div
            key={spec.id}
            className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0A0D1A] border border-slate-200 dark:border-white/10 shadow-sm hover:border-[#2F49E8]/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{spec.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm font-bold text-[#2F49E8] dark:text-[#5B75FF]">{spec.dimensions}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-neutral-300 font-medium">
                      {spec.aspectRatio}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyDimensions(spec.id, spec.dimensions)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs text-slate-600 dark:text-neutral-300 font-medium transition-colors shrink-0"
                >
                  {copiedId === spec.id ? <Check className="w-3.5 h-3.5 text-[#17A75B]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === spec.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                {spec.description}
              </p>

              {/* Supported Channels */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Supported Channels</span>
                <div className="flex flex-wrap gap-1.5">
                  {spec.channels.map((ch, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 font-medium"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Formats</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">{spec.formats.join(', ')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Max File Size</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">{spec.maxSize}</span>
                </div>
                {spec.duration && (
                  <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Recommended Duration</span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">{spec.duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Safe Zone Guidance */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug"><strong>Safe Zone:</strong> {spec.safeZone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Production Best Practices Banner */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#2F49E8]/5 via-[#3B59FF]/5 to-[#17A75B]/5 border border-[#2F49E8]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#17A75B]" />
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">Zero UGC Filming Guarantee</h5>
          </div>
          <p className="text-xs text-slate-600 dark:text-neutral-400">
            Brands supply 100% of finished assets. Creators simply grab, syndicate, and amplify your ready creative across their networks.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2F49E8] text-white shrink-0">
          Instant In-Pool Launch
        </div>
      </div>
    </section>
  );
}
