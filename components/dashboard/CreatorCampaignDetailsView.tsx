'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CampaignDetailsForCreator } from '@/lib/supabase/dashboard';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';
import { getSafeExternalUrl } from '@/lib/utils/url';

interface CreatorCampaignDetailsViewProps {
  data: CampaignDetailsForCreator;
  campaignId: string;
  userRole?: string;
}

type TabType = 'overview' | 'instructions' | 'top_performers' | 'live_reach';

export default function CreatorCampaignDetailsView({ data, campaignId, userRole = 'public' }: CreatorCampaignDetailsViewProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { campaign, creatives, submission, socialAccounts, allSubmissions } = data;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedSocialId, setSelectedSocialId] = useState<string>('');
  const [postUrl, setPostUrl] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Interaction states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#0B1026] text-white flex flex-col items-center justify-center p-6">
        <h2 className="font-display font-extrabold text-2xl mb-4">Campaign Not Found</h2>
        <Link href="/browse" className="btn btn-primary">Back to Browse</Link>
      </div>
    );
  }

  // Calculate budget fill percentage
  const totalBudget = campaign.total_budget || 1;
  const reservedBudget = campaign.reserved_budget || 0;
  const budgetFillPercent = Math.min(100, Math.round((reservedBudget / totalBudget) * 100));

  // Database aggregate calculations for Live Reach
  const activeSubs = allSubmissions.filter(s => s.status !== 'joined');
  const dbViews = allSubmissions.reduce((sum, s) => sum + (s.final_view_count || 0), 0);
  const dbPayouts = allSubmissions.reduce((sum, s) => sum + (s.payout_amount || 0), 0);
  const dbCreatorsJoined = allSubmissions.length;
  const dbSubmissions = activeSubs.length;

  // Determine accepted platforms from database channels
  const acceptedPlatforms: ('Instagram' | 'TikTok' | 'YouTube' | 'Facebook' | 'LinkedIn' | 'X')[] = 
    (campaign.channels && campaign.channels.length > 0)
      ? (campaign.channels as ('Instagram' | 'TikTok' | 'YouTube' | 'Facebook' | 'LinkedIn' | 'X')[])
      : ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X'];

  // Normalize platform string helper
  const normalizePlatform = (name: string) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('tiktok')) return 'TikTok';
    if (lower.includes('instagram')) return 'Instagram';
    if (lower.includes('youtube')) return 'YouTube';
    if (lower.includes('facebook')) return 'Facebook';
    if (lower.includes('linkedin')) return 'LinkedIn';
    if (lower.includes('twitter') || lower === 'x') return 'X';
    return name || 'Other';
  };

  const getPlatformGradient = (platform: string) => {
    const p = platform.toLowerCase();
    if (p === 'tiktok') return 'from-red-500 via-pink-500 to-cyan-500';
    if (p === 'instagram') return 'from-purple-500 to-pink-500';
    if (p === 'youtube') return 'from-red-600 to-red-400';
    if (p === 'facebook') return 'from-blue-600 to-indigo-600';
    if (p === 'linkedin') return 'from-blue-500 to-cyan-500';
    return 'from-slate-400 to-slate-200';
  };

  // Dynamic Platform Channel Share Calculation
  const channelMap: Record<string, number> = {};
  acceptedPlatforms.forEach(p => {
    channelMap[normalizePlatform(p)] = 0;
  });

  allSubmissions.forEach(sub => {
    const platform = normalizePlatform(sub.social_account_platform || (sub as any).social_accounts?.platform || '');
    const views = Number(sub.final_view_count || (sub as any).views_count || 0);
    channelMap[platform] = (channelMap[platform] || 0) + views;
  });

  const totalChannelViews = Object.values(channelMap).reduce((a, b) => a + b, 0);

  const platformShareList = Object.entries(channelMap)
    .map(([platform, views]) => {
      const share = totalChannelViews > 0 ? Math.round((views / totalChannelViews) * 100) : 0;
      return { platform, views, share };
    })
    .sort((a, b) => b.views - a.views);

  const renderPlatformIcon = (platform: string, className = "w-4 h-4") => {
    const p = platform.toLowerCase();
    if (p === 'tiktok') {
      return (
        <svg className={`${className} text-cyan-400`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.22V8.19a6.34 6.34 0 0 0-5.46 6.25 6.34 6.34 0 1 0 11.8-3.41V9.04a8.3 8.3 0 0 0 5.25 1.83V7.42a4.85 4.85 0 0 1-1.48-.73z"/>
        </svg>
      );
    }
    if (p === 'instagram') {
      return (
        <svg className={`${className} text-pink-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      );
    }
    if (p === 'youtube') {
      return (
        <svg className={`${className} text-red-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    }
    if (p === 'facebook') {
      return (
        <svg className={`${className} text-blue-600`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    }
    if (p === 'linkedin') {
      return (
        <svg className={`${className} text-blue-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      );
    }
    return (
      <svg className={`${className} text-white`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  };

  const handleCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Caption copied to clipboard!');
  };

  // Step 1: Join Campaign
  const handleJoinCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocialId) {
      setErrorMsg('Please select a connected social account to join.');
      return;
    }

    setIsJoining(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          campaignId: campaign.id,
          socialAccountId: selectedSocialId,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || 'Failed to join campaign.');
      } else {
        setSuccessMsg('You have successfully joined the campaign and reserved your budget slot!');
        setIsJoinModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Step 2: Submit Published Link
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl) {
      setErrorMsg('Please paste your published post URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_link',
          campaignId: campaign.id,
          postUrl,
          screenshotUrl,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || 'Failed to submit post.');
      } else {
        setSuccessMsg('Your post link has been submitted successfully for verification!');
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find hero background image & external asset URLs
  const heroBackground = campaign.cover_image_url || creatives[0]?.file_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&auto=format&fit=crop&q=80';
  const googleDocUrl = campaign.requirements?.google_doc_url || campaign.requirements?.doc_url || 'https://docs.google.com';
  const googleDriveUrl = campaign.requirements?.google_drive_url || campaign.requirements?.drive_url || 'https://drive.google.com';

  return (
    <div className="min-h-screen bg-[#0B1026] text-white flex flex-col font-sans relative">
      
      {/* ─────────────────────────────────────────────────────
         1. FULL-BLEED STICKY TOP NAVBAR
      ───────────────────────────────────────────────────── */}
      <header className="border-b border-white/5 bg-[#0B1026]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/kpugi_logo.png"
              alt="Kpugi"
              className="h-8 object-contain"
            />
          </div>
          <div>
            <Link
              href="/browse"
              className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full text-xs font-bold text-slate-300 transition-all flex items-center gap-1.5"
            >
              ✕ Close Details
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────
         2. FULL-BLEED HERO BACKGROUND (NO TOP/LEFT/RIGHT BORDERS)
      ───────────────────────────────────────────────────── */}
      <div 
        className="w-full relative border-b border-white/10 px-6 py-12 md:py-20 min-h-[380px] flex flex-col justify-end bg-cover bg-center shadow-xl"
        style={{ backgroundImage: `url('${heroBackground}')` }}
      >
        {/* Contrast Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1026] via-[#0B1026]/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/45 z-0" />

        <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          
          <div className="space-y-4 max-w-3xl">
            {/* Advertiser Profile & Campaign Code Pill (Unified Capsule) */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 bg-[#0B1026] backdrop-blur-md pl-1.5 pr-4 py-1.5 rounded-full border border-white/15 shadow-md">
                {campaign.company_logo ? (
                  <img
                    src={campaign.company_logo}
                    alt={campaign.company_name}
                    className="w-7 h-7 rounded-full border border-white/20 object-cover shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs uppercase text-white shadow-sm shrink-0">
                    {(campaign.company_name || campaign.title).slice(0, 1)}
                  </div>
                )}
                <span className="font-sans text-xs font-bold text-white">
                  {campaign.company_name}
                </span>
                <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.51Z" clipRule="evenodd" />
                </svg>
              </div>

              {campaign.campaign_code && (
                <div className="flex items-center bg-[#0B1026] backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-md">
                  <span className="font-mono text-xs text-white font-bold tracking-wider">
                    {campaign.campaign_code}
                  </span>
                </div>
              )}
            </div>

            {/* Campaign Title */}
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
              {campaign.title}
            </h1>

            {/* Platform brand icons list under title */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Channels:</span>
              <div className="flex items-center gap-2">
                {acceptedPlatforms.map(p => (
                  <div key={p} className="w-7 h-7 rounded-full bg-[#0B1026] backdrop-blur-sm flex items-center justify-center border border-white/15" title={p}>
                    {renderPlatformIcon(p, "w-3.5 h-3.5")}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero CTA button: Join Campaign / Status & AI Match Badge */}
          <div className="shrink-0 pb-2 flex items-center gap-3">
            {/* AI Match Badge Pill */}
            {!isSignedIn ? (
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent(`/browse/${campaignId}`)}`}
                className="flex items-center gap-2 bg-[#0B1026] border border-white/20 hover:border-white/40 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md transition-all group"
              >
                <span className="text-sm">🔒</span>
                <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-white">Sign in for AI Score</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5 bg-[#0B1026] border border-emerald-500/40 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md">
                <span className="text-sm">✨</span>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-extrabold text-emerald-400">94% AI Match Score</span>
                </div>
              </div>
            )}

            {userRole === 'advertiser' ? (
              <Link
                href="/dashboard"
                className="bg-kpugi-blue hover:bg-blue-600 text-white px-7 py-3.5 rounded-full font-sans font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>📊</span>
                <span>Advertiser Dashboard</span>
              </Link>
            ) : !isSignedIn ? (
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent(`/browse/${campaignId}`)}`}
                className="bg-white text-black hover:bg-white/90 px-8 py-3.5 rounded-full font-sans font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>🔒</span>
                <span>Sign in to Join</span>
              </Link>
            ) : !submission ? (
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="bg-white text-black hover:bg-white/90 px-8 py-3.5 rounded-full font-sans font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Join Campaign
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#0B1026] border border-emerald-500/50 text-emerald-400 text-xs font-bold font-sans uppercase tracking-wider shadow-md">
                Joined ✓
              </span>
            )}
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
         3. CONTENT CONTAINER (MAX-WIDTH 7XL)
      ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
        
        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-6 border-b border-white/5 pb-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`font-sans text-sm font-bold pb-2 transition-all relative shrink-0 ${
              activeTab === 'overview' ? 'text-white border-b-2 border-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`font-sans text-sm font-bold pb-2 transition-all relative shrink-0 ${
              activeTab === 'instructions' ? 'text-white border-b-2 border-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Detailed Instructions
          </button>
          <button
            onClick={() => setActiveTab('top_performers')}
            className={`font-sans text-sm font-bold pb-2 transition-all relative shrink-0 ${
              activeTab === 'top_performers' ? 'text-white border-b-2 border-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top Performers
          </button>
          <button
            onClick={() => setActiveTab('live_reach')}
            className={`font-sans text-sm font-bold pb-2 transition-all relative shrink-0 ${
              activeTab === 'live_reach' ? 'text-white border-b-2 border-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Reach
          </button>
        </div>

        {/* MAIN COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="prose prose-invert max-w-none pb-6 border-b border-white/5">
                  <p className="font-sans text-slate-300 leading-relaxed text-sm">
                    {campaign.description}
                  </p>
                </div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    🎬 BRAND CREATIVE ASSETS — shown prominently below description
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {(() => {
                  // Gather asset data: prefer campaign_creatives table, fall back to requirements JSONB
                  const dbCreative = creatives[0] || null;
                  const reqFileUrl = (campaign as any).requirements?.creative_video_url || (campaign as any).requirements?.creative_image_url || null;
                  const reqCopyText = (campaign as any).requirements?.creative_text_copy || null;
                  const reqCaption = (campaign as any).requirements?.caption_suggestion || null;

                  const fileUrl = dbCreative?.file_url || reqFileUrl || null;
                  const copyText = dbCreative?.copy_text || reqCopyText || null;
                  const captionText = dbCreative?.caption_suggestion || reqCaption || null;

                  if (!fileUrl && !copyText && !captionText) return null;

                  // Detect YouTube link
                  const ytMatch = fileUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                  const isYouTube = !!ytMatch;
                  const ytId = ytMatch?.[1];

                  // Detect video file
                  const isVideoFile = !isYouTube && !!fileUrl?.match(/\.(mp4|mov|webm|avi|mkv)(\?|$)/i);

                  return (
                    <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#0B1021] shadow-2xl">
                      {/* Header bar */}
                      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/[0.03]">
                        <span className="text-xl">🎬</span>
                        <div>
                          <h3 className="font-display font-bold text-white text-base">Brand Creative Asset</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Use this asset in your post — it's required for campaign participation</p>
                        </div>
                        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                          ⚠ Required
                        </span>
                      </div>

                      {/* Media preview */}
                      {fileUrl && (
                        <div className="bg-black">
                          {isYouTube ? (
                            <div className="aspect-video w-full">
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              />
                            </div>
                          ) : isVideoFile ? (
                            <video
                              src={fileUrl}
                              controls
                              className="w-full max-h-[480px] object-contain"
                            />
                          ) : (
                            <img
                              src={fileUrl}
                              alt="Brand Creative"
                              className="w-full max-h-[480px] object-contain"
                            />
                          )}
                        </div>
                      )}

                      {/* Caption + copy text */}
                      {(captionText || copyText) && (
                        <div className="p-6 space-y-4">
                          {captionText && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Caption</span>
                                <button
                                  onClick={() => handleCopyCaption(captionText)}
                                  className="text-xs text-kpugi-blue hover:text-blue-400 font-sans font-bold"
                                >
                                  Copy Caption
                                </button>
                              </div>
                              <p className="font-sans text-xs text-slate-300 bg-white/[0.03] border border-white/5 rounded-xl p-4 leading-relaxed italic">
                                &ldquo;{captionText}&rdquo;
                              </p>
                            </div>
                          )}
                          {copyText && copyText !== fileUrl && (
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Copy / Instructions</span>
                              <p className="font-sans text-xs text-slate-300 leading-relaxed bg-white/[0.01] p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                                {copyText}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ⚡ AI-POWERED SYNC CARD (Clean 2-Column Layout) */}
                {(() => {
                  const dbMatchScore = (campaign as any).match_score || 94;

                  return (
                    <div className="mt-8 bg-[#0B1021] border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                      
                      {/* Background Ambient Glow */}
                      <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 blur-[110px] rounded-full pointer-events-none" />

                      {/* Main 2-Column Grid: Left Content, Right Radial Gauge */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        
                        {/* Left Column (Col 6) - Responsive Mobile Centering */}
                        <div className="md:col-span-6 space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
                          <h2 className="font-display font-extrabold text-white text-3xl sm:text-4xl tracking-tight leading-none">
                            AI-Powered Sync
                          </h2>
                          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                            {isSignedIn
                              ? "Our vector engine has matched your creative profile with this brand's core demographic."
                              : "Sign in to analyze your creator audience niche, engagement metrics & vector compatibility with this campaign."}
                          </p>

                          {!isSignedIn && (
                            <Link
                              href={`/sign-in?redirect_url=${encodeURIComponent(`/browse/${campaignId}`)}`}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-all shadow-md"
                            >
                              <span>🔒</span>
                              <span>Sign in to Unlock Match Score</span>
                            </Link>
                          )}

                          {/* Social Platform Icon Tiles (Supports 6 Major Networks) */}
                          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5 w-full">
                            {['TikTok', 'Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X'].map((p) => {
                              const isSupported = acceptedPlatforms.includes(p as any);
                              return (
                                <div key={p} className="flex flex-col items-center gap-1">
                                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${
                                    isSupported
                                      ? 'bg-[#151C33] border-blue-500/30 shadow-md'
                                      : 'bg-white/5 border-white/10 opacity-40'
                                  }`}>
                                    {renderPlatformIcon(p, "w-4 h-4")}
                                  </div>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                    {p === 'X' ? 'X' : p === 'Instagram' ? 'IG' : p === 'LinkedIn' ? 'IN' : p === 'Facebook' ? 'FB' : p === 'YouTube' ? 'YT' : 'TIKTOK'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right Column: Completely Seamless Radial Compatibility Gauge (Col 6) */}
                        <div className="md:col-span-6 flex items-center justify-center py-4">
                          <div className="relative w-56 h-56 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                              {/* Background Track */}
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                stroke="rgba(255, 255, 255, 0.06)"
                                strokeWidth="7"
                                fill="none"
                              />
                              {/* Dynamic Progress Arc from DB Match Score */}
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                stroke="#3B82F6"
                                strokeWidth="7"
                                strokeDasharray={263.89}
                                strokeDashoffset={isSignedIn ? 263.89 * (1 - (dbMatchScore / 100)) : 263.89 * 0.7}
                                strokeLinecap="round"
                                fill="none"
                                className="transition-all duration-1000 ease-out opacity-40"
                              />
                            </svg>

                            {/* Ring Center Text */}
                            {isSignedIn ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                <div className="flex items-baseline gap-0.5">
                                  <span className="font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight">{dbMatchScore}</span>
                                  <span className="font-sans font-bold text-white text-2xl">%</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">COMPATIBILITY</span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none select-none">
                                <span className="text-2xl mb-1.5 animate-bounce inline-block leading-none">🔒</span>
                                <span className="font-display font-extrabold text-white text-[11px] sm:text-xs tracking-wider uppercase">
                                  AI Score Locked
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-1">
                                  Sign in to view
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })()}

                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-4">Payouts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {renderPlatformIcon(acceptedPlatforms[0])}
                          <span className="font-sans text-sm font-bold text-white uppercase">Payout Rate</span>
                        </div>
                        <p className="font-sans text-xs text-slate-400"></p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold text-kpugi-blue">
                          {formatCompactCurrency(campaign.cpm_rate)}
                        </div>
                        <span className="font-sans text-[10px] text-slate-400 uppercase tracking-widest font-bold">PER 1K VIEWS</span>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500">✓</span>
                          <span className="font-sans text-sm font-bold text-white">Min views</span>
                        </div>
                        <p className="font-sans text-xs text-slate-400">Required view conversion</p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold text-white">
                          {formatCompactNumber(campaign.min_view_threshold)}
                        </div>
                        <span className="font-sans text-[10px] text-slate-400 uppercase tracking-widest font-bold">VIEWS MIN</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Resources Attachment Section */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Campaign Assets</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a href={getSafeExternalUrl(googleDocUrl)} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white group-hover:text-kpugi-blue transition-colors">Campaign Brief Guidelines</div>
                          <div className="text-[10px] text-slate-400">Google Docs</div>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                    <a href={getSafeExternalUrl(googleDriveUrl)} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📂</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white group-hover:text-kpugi-blue transition-colors">Video Creative Asset Folder</div>
                          <div className="text-[10px] text-slate-400">Google Drive</div>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Creative Brief suggestions */}
                {creatives.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-white">Brand Creative Assets</h3>
                    {creatives.map((creative) => (
                      <div key={creative.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">

                        {/* Creative Media Asset (image or video) */}
                        {creative.file_url && (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Creative Asset</span>
                            {creative.file_url.match(/\.(mp4|mov|webm|avi|mkv)(\?|$)/i) ? (
                              <video
                                src={creative.file_url}
                                controls
                                className="w-full rounded-xl border border-white/10 max-h-[420px] object-contain bg-black"
                              />
                            ) : (
                              <img
                                src={creative.file_url}
                                alt="Creative Asset"
                                className="w-full rounded-xl border border-white/10 max-h-[420px] object-contain bg-black"
                              />
                            )}
                          </div>
                        )}

                        {creative.caption_suggestion && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <span>Caption Text</span>
                              <button
                                onClick={() => handleCopyCaption(creative.caption_suggestion || '')}
                                className="text-kpugi-blue hover:text-blue-400 font-sans normal-case"
                              >
                                Copy Caption
                              </button>
                            </div>
                            <p className="font-sans text-xs text-slate-300 bg-white/[0.03] border border-white/5 rounded-xl p-4 leading-relaxed italic">
                              &ldquo;{creative.caption_suggestion}&rdquo;
                            </p>
                          </div>
                        )}

                        {creative.copy_text && (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Additional instructions copy</span>
                            <p className="font-sans text-xs text-slate-300 leading-relaxed bg-white/[0.01] p-3 rounded-lg border border-white/5">
                              {creative.copy_text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DETAILED INSTRUCTIONS TAB */}
            {activeTab === 'instructions' && (
              <div className="space-y-6">
                
                {/* 1. Auditing & Safety Requirements Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                      <span>🛡️</span> Auditing Requirements
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Key rules enforced by our automated view scraper and escrow verification bot.</p>
                  </div>
                  <ul className="space-y-4 font-sans text-sm text-slate-300 list-disc pl-5 leading-relaxed">
                    <li>Your post must remain publicly visible and reachable for a minimum of <strong>{campaign.required_live_duration_hours} hours</strong> from the time of submission.</li>
                    <li>Our verification scraper checks view count progress automatically hourly.</li>
                    <li>A grace period of <strong>{campaign.verification_grace_hours} hours</strong> is allowed for final scraping settling.</li>
                    <li>Deleting, archiving, or restricting access to the post during the audit phase violates terms and results in immediate forfeiture of reserved escrow funds.</li>
                  </ul>
                </div>

                {/* 2. Comprehensive Posting Rules & Step-by-Step Checklist Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                      <span>📌</span> Guidelines & Rules
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Follow these step-by-step rules to guarantee your post passes automated audit and unlocks instant CPM payouts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Item 1: Public Visibility */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2.5 font-sans text-sm font-bold text-white">
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">🔒</span>
                        <span>72-Hour Public Visibility Lock</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-1">
                        Do not archive, set to private, or delete your video post for at least {campaign.required_live_duration_hours} hours after submitting your link. The automated scraper audits view counts hourly.
                      </p>
                    </div>

                    {/* Item 2: Brand Creatives */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2.5 font-sans text-sm font-bold text-white">
                        <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">🎥</span>
                        <span>Official Brand Creatives & Assets</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-1">
                        Publish the official video/image asset provided in the Campaign Assets folder without cropping out brand logos or modifying essential visual overlays.
                      </p>
                    </div>

                    {/* Item 3: Tags & Captions */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2.5 font-sans text-sm font-bold text-white">
                        <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">🏷️</span>
                        <span>Mandatory Tags & Handles</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-1">
                        Tag the official brand handle and include the campaign hashtag or unique identifier in your post caption so our scraper can verify ownership.
                      </p>
                    </div>

                    {/* Item 4: Instant Escrow Payouts */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2.5 font-sans text-sm font-bold text-white">
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">⚡</span>
                        <span>Automated Escrow Payout Settlement</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-1">
                        Once your post reaches the view threshold ({campaign.min_view_threshold.toLocaleString()} min views), earnings are calculated at ₦{campaign.cpm_rate.toLocaleString()} CPM and released directly to your wallet.
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* TOP PERFORMERS TAB */}
            {activeTab === 'top_performers' && (
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                
                {/* Header row with title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">Audited Leaderboard</h3>
                    <p className="text-xs text-slate-400 mt-1">Creators driving the highest verified view conversions for this campaign.</p>
                  </div>
                </div>

                {/* Leaderboard Table Headers */}
                <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider font-bold text-slate-500 pb-2 border-b border-white/5 px-4">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-8">Creator</div>
                  <div className="col-span-2 text-right">Views</div>
                </div>

                {/* Leaderboard Rows */}
                <div className="space-y-3">
                  {(() => {
                    const sortedSubs = [...allSubmissions]
                      .filter(s => s.status !== 'joined')
                      .sort((a, b) => (b.final_view_count || 0) - (a.final_view_count || 0));

                    if (sortedSubs.length === 0) {
                      return (
                        <div className="p-8 text-center bg-white/[0.01] border border-white/5 rounded-2xl">
                          <p className="text-xs text-slate-400 font-sans">
                            No verified submissions or view counts recorded yet.
                          </p>
                        </div>
                      );
                    }

                    return sortedSubs.map((sub, index) => {
                      const rankNum = index + 1;
                      const formattedRank = rankNum < 10 ? `0${rankNum}` : `${rankNum}`;

                      // Medal styling & indicators
                      let medalBadge = null;
                      let rankClass = "text-slate-500";
                      let rowStyle = "bg-transparent border-white/5";

                      if (rankNum === 1) {
                        medalBadge = <span className="text-xs shrink-0 animate-bounce">👑</span>;
                        rankClass = "text-yellow-500 font-extrabold";
                        rowStyle = "bg-white/[0.03] border-l-4 border-l-yellow-500 border-white/5";
                      } else if (rankNum === 2) {
                        medalBadge = <span className="text-xs shrink-0">🥈</span>;
                        rankClass = "text-slate-300 font-bold";
                        rowStyle = "bg-white/[0.01] border-l-4 border-l-slate-400 border-white/5";
                      } else if (rankNum === 3) {
                        medalBadge = <span className="text-xs shrink-0">🥉</span>;
                        rankClass = "text-amber-600 font-bold";
                        rowStyle = "bg-white/[0.01] border-l-4 border-l-amber-700 border-white/5";
                      }

                      return (
                        <div
                          key={sub.id}
                          className={`grid grid-cols-12 items-center p-4 border rounded-r-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.06] hover:border-white/10 ${rowStyle}`}
                        >
                          {/* Rank */}
                          <div className={`col-span-2 flex items-center gap-1.5 font-mono text-base ${rankClass}`}>
                            {formattedRank} {medalBadge}
                          </div>

                          {/* Profile */}
                          <div className="col-span-8 flex items-center gap-3">
                            {sub.creator_avatar_url ? (
                              <img
                                src={sub.creator_avatar_url}
                                alt={sub.creator_handle}
                                className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs uppercase text-slate-400">
                                {sub.creator_handle.slice(1, 3).toUpperCase()}
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <div className="font-sans text-xs font-bold text-white">
                                {sub.creator_handle}
                              </div>
                              <div className="font-sans text-[10px] text-slate-500">Nigeria</div>
                            </div>
                          </div>

                          {/* Views */}
                          <div className="col-span-2 text-right">
                            <div className="font-mono text-xs font-bold text-white">
                              {formatCompactNumber(sub.final_view_count || 0)}
                            </div>
                            <div className="text-[9px] text-emerald-400 font-bold flex items-center justify-end gap-0.5 mt-0.5">
                              <span>📈</span> +{(sub.final_view_count || 0) > 100000 ? '12%' : '8%'}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

              </div>
            )}

            {/* LIVE REACH TAB */}
            {activeTab === 'live_reach' && (
              <div className="space-y-6">
                
                {/* Visual Stats Overview */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">Live Campaign Reach</h3>
                    <p className="text-xs text-slate-400 mt-1">Real-time aggregate performance of all active creator placements.</p>
                  </div>

                  {/* 6 Grid Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Views</div>
                      <div className="font-mono text-2xl font-extrabold text-white">
                        {formatCompactNumber(dbViews)}
                      </div>
                      <div className="text-[9px] text-emerald-400">📊 Real-time</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payouts</div>
                      <div className="font-mono text-2xl font-extrabold text-emerald-400">
                        {formatCompactCurrency(dbPayouts)}
                      </div>
                      <div className="text-[9px] text-slate-400">Released from Escrow</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creators Joined</div>
                      <div className="font-mono text-2xl font-extrabold text-white">
                        {dbCreatorsJoined}
                      </div>
                      <div className="text-[9px] text-slate-400">Active slots locked</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submissions</div>
                      <div className="font-mono text-2xl font-extrabold text-white">
                        {dbSubmissions}
                      </div>
                      <div className="text-[9px] text-slate-400">Verified & Pending</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engagement</div>
                      <div className="font-mono text-2xl font-extrabold text-white">
                        {(campaign as any)?.target_engagement_rate != null ? `${(campaign as any).target_engagement_rate}%` : '0%'}
                      </div>
                      <div className="text-[9px] text-slate-400">Like & Comment ratio</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Watch Time</div>
                      <div className="font-mono text-2xl font-extrabold text-white">
                        {dbViews > 0 && (campaign as any)?.avg_watch_time_seconds ? `${(campaign as any).avg_watch_time_seconds}s` : '0s'}
                      </div>
                      <div className="text-[9px] text-slate-400">Retention benchmark</div>
                    </div>
                  </div>
                </div>

                {/* Channel Share Breakdown */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-5">
                  <div>
                    <h4 className="font-display font-bold text-base text-white">Platform Channel Share</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Distribution of campaign views across connected social networks.</p>
                  </div>

                  <div className="space-y-4">
                    {platformShareList.map(({ platform, views, share }) => (
                      <div key={platform} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            {renderPlatformIcon(platform, 'w-3.5 h-3.5')}
                            <span>{platform === 'X' ? 'X (Twitter)' : platform}</span>
                          </div>
                          <span className="font-mono text-slate-300">
                            {formatCompactNumber(views)} views ({share}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${getPlatformGradient(platform)} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Column Content */}
          <div className="space-y-6">
            
            {/* Budget card */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>BUDGET</span>
                <span className="text-emerald-500 font-sans">🛡️ Secured</span>
              </div>

              <div className="font-mono text-2xl sm:text-3xl font-bold text-white">
                {formatCompactCurrency(campaign.total_budget)}
              </div>

              <div className="space-y-2">
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${budgetFillPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span>{formatCompactCurrency(reservedBudget)} Reserved</span>
                  <span>{budgetFillPercent}% Filled</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-xs font-sans text-slate-400">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="text-white font-mono uppercase">{campaign.ad_format}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform conversion</span>
                  <div className="flex items-center gap-1.5">
                    {acceptedPlatforms.map(p => (
                      <div key={p} className="p-1 rounded-lg bg-white/5 border border-white/10" title={p}>
                        {renderPlatformIcon(p, "w-3.5 h-3.5")}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Audit duration</span>
                  <span className="text-white font-mono">{campaign.required_live_duration_hours}h + {campaign.verification_grace_hours}h</span>
                </div>
              </div>
            </div>

            {/* Submission / Portal card */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Submission Portal</h3>

              {errorMsg && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  {successMsg}
                </div>
              )}

              {userRole === 'advertiser' ? (
                /* Advertiser View Banner */
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-300 font-sans space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <span>📢</span>
                    <span>Advertiser Mode (Read-Only)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    You are viewing this campaign brief in advertiser mode. Verified creators use this portal to lock Campaign Budget and submit published post links.
                  </p>
                  <div className="pt-1">
                    <Link href="/dashboard" className="text-kpugi-blue font-bold hover:underline block text-xs">
                      Go to Advertiser Dashboard →
                    </Link>
                  </div>
                </div>
              ) : !isSignedIn ? (
                /* Non-authenticated Creator State */
                <div className="space-y-4">
                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    Sign in to your creator account to join this campaign, connect your placement handle, and lock your reserved escrow payout.
                  </p>
                  <Link
                    href={`/sign-in?redirect_url=${encodeURIComponent(`/browse/${campaignId}`)}`}
                    className="w-full py-3.5 rounded-2xl bg-white hover:bg-white/95 text-black font-sans font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>🔒</span>
                    <span>Sign in to Join</span>
                  </Link>
                </div>
              ) : !submission ? (
                /* Dynamic Not Joined State Card */
                <div className="space-y-4">
                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    You have not joined this campaign yet. Connect one of your placement handles and click <strong>Join Campaign</strong> to reserve your Campaign Budget.
                  </p>
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full py-3 rounded-2xl bg-white hover:bg-white/95 text-black font-sans font-bold text-xs shadow-lg transition-all"
                  >
                    JOIN
                  </button>
                </div>
              ) : submission.status === 'joined' ? (
                /* Joined but not submitted link form */
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 font-sans flex items-center gap-2">
                    <span>✓</span>
                    <span>You are registered using <strong>@{socialAccounts.find(s => s.id === submission.social_account_id)?.handle || 'connected handle'}</strong>.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Published Post URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.instagram.com/p/..."
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-kpugi-blue"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scraper settles backup screenshot</label>
                    <input
                      type="text"
                      placeholder="Screenshot image URL (optional)"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-kpugi-blue"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-kpugi-blue hover:bg-blue-600 disabled:bg-white/10 disabled:text-slate-500 text-white font-bold text-xs shadow-lg shadow-kpugi-blue/20 transition-all"
                  >
                    {isSubmitting ? 'Submitting Link...' : '🚀 Submit Post Link'}
                  </button>
                </form>
              ) : (
                /* Link Submitted / Under Scraper Audit */
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border ${
                    submission.status === 'pending'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      : submission.status === 'verified_pass' || submission.status === 'paid'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/20 text-red-300'
                  }`}>
                    <div className="flex items-center gap-2 font-bold font-sans text-xs uppercase mb-1">
                      <span>{submission.status === 'pending' ? '⏳ Scraper Audit active' : `✓ ${submission.status.replace(/_/g, ' ')}`}</span>
                    </div>
                    <p className="font-sans text-xs text-slate-300 mt-1">
                      {submission.status === 'pending'
                        ? 'Scrapers are verifying conversion and views hourly. Do not delete the post.'
                        : 'Audit verified. Escrow earnings released.'}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-sans text-slate-400 border-t border-white/5 pt-3">
                    <div className="flex justify-between">
                      <span>Submitted Post</span>
                      <a href={submission.post_url ? getSafeExternalUrl(submission.post_url) : undefined} target="_blank" rel="noreferrer" className="text-kpugi-blue hover:underline font-mono truncate max-w-[150px]">
                        Link →
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span>Reserved payout</span>
                      <span className="text-white font-mono">{formatCompactCurrency(submission.reserved_amount)}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────
         4. GLASSMORPHIC JOIN MODAL OVERLAY
      ───────────────────────────────────────────────────── */}
      {isJoinModalOpen && (() => {
        const modalContent = (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all overflow-y-auto min-h-screen w-screen">
            <div className="bg-[#0B1026] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative my-auto">
              
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>

              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-xl text-white">Join Campaign</h3>
                <p className="text-xs text-slate-400">Select the social handle you will use to post for this campaign.</p>
              </div>

              <form onSubmit={handleJoinCampaign} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connect placement profile</label>
                  {socialAccounts.length > 0 ? (
                    <select
                      value={selectedSocialId}
                      onChange={(e) => setSelectedSocialId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-kpugi-blue"
                      required
                    >
                      <option value="" disabled>Select Connected Handle</option>
                      {socialAccounts.map((account) => (
                        <option key={account.id} value={account.id} className="bg-[#0B1026]">
                          @{account.handle} ({account.platform.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 font-sans">
                      No connected social accounts found. Go to <Link href="/settings" className="underline font-bold text-white">Accounts Settings</Link> to connect handles before joining.
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2 text-xs font-sans text-slate-400">
                  <div className="flex justify-between">
                    <span>Base Payout Rate</span>
                    <span className="text-kpugi-blue font-mono font-bold">{formatCompactCurrency(campaign.cpm_rate)} / 1k Views</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Threshold</span>
                    <span className="text-white font-mono">{formatCompactNumber(campaign.min_view_threshold)} views</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isJoining || socialAccounts.length === 0}
                  className="w-full py-3 rounded-2xl bg-white hover:bg-white/95 text-black font-sans font-bold text-xs shadow-lg transition-all"
                >
                  {isJoining ? 'Joining Campaign...' : 'Confirm Join'}
                </button>

              </form>

            </div>
          </div>
        );

        return mounted ? createPortal(modalContent, document.body) : modalContent;
      })()}

    </div>
  );
}
