'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CampaignDetailsForCreator } from '@/lib/supabase/dashboard';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/format';

interface CreatorCampaignDetailsViewProps {
  data: CampaignDetailsForCreator;
  campaignId: string;
}

type TabType = 'overview' | 'instructions' | 'top_performers' | 'live_reach';

export default function CreatorCampaignDetailsView({ data, campaignId }: CreatorCampaignDetailsViewProps) {
  const router = useRouter();
  const { campaign, creatives, submission, socialAccounts } = data;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedSocialId, setSelectedSocialId] = useState<string>('');
  const [postUrl, setPostUrl] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  
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

  // Determine accepted platforms based on format
  const acceptedPlatforms: ('Instagram' | 'TikTok' | 'X')[] = 
    campaign.ad_format === 'video' ? ['TikTok', 'Instagram', 'X'] : ['Instagram', 'TikTok'];

  const renderPlatformIcon = (platform: string, className = "w-4 h-4") => {
    if (platform.toLowerCase() === 'tiktok') {
      return (
        <svg className={`${className} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.025c-3.308 0-6.327 2.684-6.327 6.002V15.4c0 2.378-1.926 4.305-4.305 4.305S-.412 17.778-.412 15.4s1.926-4.305 4.305-4.305c.162 0 .32.012.474.035v3.136c-.154-.027-.311-.041-.474-.041-1.156 0-2.095.939-2.095 2.095s.939 2.095 2.095 2.095 2.095-.939 2.095-2.095V.025h3.21c.143 2.158 1.83 3.844 3.987 3.987v3.21c-1.396-.134-2.612-.862-3.33-1.95v10.128c0 3.774-3.056 6.83-6.83 6.83S0 19.174 0 15.4s3.056-6.83 6.83-6.83V6.002c-4.498 0-8.59 3.655-8.59 8.153s4.092 8.153 8.59 8.153c4.498 0 8.153-3.655 8.153-8.153V6.368c1.378 1.206 3.197 1.933 5.168 1.933V5.09c-1.968 0-3.766-.806-5.068-2.108-1.302-1.302-2.108-3.1-2.108-5.068H12.525z"/>
        </svg>
      );
    }
    if (platform.toLowerCase() === 'instagram') {
      return (
        <svg className={`${className} text-pink-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      );
    }
    return (
      <svg className={`${className} text-sky-400`} fill="currentColor" viewBox="0 0 24 24">
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

  // Find hero background image
  const heroBackground = creatives[0]?.file_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&auto=format&fit=crop&q=80';

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
            {/* Advertiser Profile with avatar from Clerk / DB */}
            <div className="flex items-center gap-3">
              {campaign.company_logo ? (
                <img
                  src={campaign.company_logo}
                  alt={campaign.company_name}
                  className="w-10 h-10 rounded-full border border-white/20 object-cover shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-sm uppercase text-white shadow-md">
                  {campaign.company_name.slice(0, 1)}
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-[#0B1026]/60 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                <span className="font-sans text-xs font-semibold text-white">
                  {campaign.company_name}
                </span>
                <svg className="w-3.5 h-3.5 text-kpugi-blue fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.51Z" clipRule="evenodd" />
                </svg>
              </div>
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
                  <div key={p} className="w-7 h-7 rounded-full bg-[#0B1026]/60 backdrop-blur-sm flex items-center justify-center border border-white/10" title={p}>
                    {renderPlatformIcon(p, "w-3.5 h-3.5")}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero CTA button: Join Campaign / Status */}
          <div className="shrink-0 pb-2">
            {!submission ? (
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full font-sans font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Join Campaign
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-sans uppercase tracking-wider">
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
                <div className="prose prose-invert max-w-none">
                  <p className="font-sans text-slate-300 leading-relaxed text-sm">
                    {campaign.description}
                  </p>
                </div>

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
                    <a href="https://docs.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                      <span className="text-xl">📄</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">Campaign Brief Guidelines</div>
                        <div className="text-[10px] text-slate-400">Google Docs</div>
                      </div>
                    </a>
                    <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                      <span className="text-xl">📂</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">Video Creative Asset Folder</div>
                        <div className="text-[10px] text-slate-400">Google Drive</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Creative Brief suggestions */}
                {creatives.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-white">Suggested Caption</h3>
                    {creatives.map((creative) => (
                      <div key={creative.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
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
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                <h3 className="font-display font-bold text-lg text-white">Auditing & Safety Requirements</h3>
                <ul className="space-y-4 font-sans text-sm text-slate-300 list-disc pl-5 leading-relaxed">
                  <li>Your post must remain publicly visible and reachable for a minimum of <strong>{campaign.required_live_duration_hours} hours</strong> from the time of submission.</li>
                  <li>Our verification scraper checks view count progress automatically hourly.</li>
                  <li>A grace period of <strong>{campaign.verification_grace_hours} hours</strong> is allowed for final scraping settling.</li>
                  <li>Deleting, archiving, or restricting access to the post during the audit phase violates terms and results in immediate forfeiture of reserved escrow funds.</li>
                </ul>
              </div>
            )}

            {/* TOP PERFORMERS TAB */}
            {activeTab === 'top_performers' && (
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                
                {/* Header row with toggle buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">Audited Leaderboard</h3>
                    <p className="text-xs text-slate-400 mt-1">Creators driving the highest verified view conversions for this campaign.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 rounded-lg bg-white/10 text-[9px] font-bold tracking-wider text-white uppercase font-sans">
                      Real-time Data
                    </span>
                    <span className="px-3 py-1.5 rounded-lg border border-white/10 text-[9px] font-bold tracking-wider text-slate-500 uppercase font-sans">
                      Verified Only
                    </span>
                  </div>
                </div>

                {/* Leaderboard Table Headers */}
                <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider font-bold text-slate-500 pb-2 border-b border-white/5 px-4">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-6">Creator</div>
                  <div className="col-span-2 text-right">Views</div>
                  <div className="col-span-2 text-right">Earnings</div>
                </div>

                {/* Leaderboard Rows */}
                <div className="space-y-3">
                  
                  {/* Rank 1 Row (Highlighted) */}
                  <div className="grid grid-cols-12 items-center bg-white/[0.03] border border-white/5 border-l-4 border-l-yellow-500 rounded-r-2xl p-4 shadow-md transition-colors hover:bg-white/[0.05]">
                    {/* Rank */}
                    <div className="col-span-2 flex items-center gap-1 font-mono text-base font-extrabold text-yellow-500">
                      01 <span className="text-xs">🏆</span>
                    </div>
                    {/* Profile */}
                    <div className="col-span-6 flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" 
                        alt="Tunde" 
                        className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-sm"
                      />
                      <div className="space-y-0.5">
                        <div className="font-sans text-xs font-bold text-white">@tunde_marketing</div>
                        <div className="font-sans text-[10px] text-slate-500">Lagos, NG</div>
                      </div>
                    </div>
                    {/* Views */}
                    <div className="col-span-2 text-right">
                      <div className="font-mono text-xs font-bold text-white">245k</div>
                      <div className="text-[9px] text-emerald-400 font-bold flex items-center justify-end gap-0.5">
                        <span>📈</span> 12%
                      </div>
                    </div>
                    {/* Earnings */}
                    <div className="col-span-2 text-right font-mono text-xs font-extrabold text-yellow-500">
                      ₦490k
                    </div>
                  </div>

                  {/* Rank 2 Row */}
                  <div className="grid grid-cols-12 items-center bg-transparent border-b border-white/5 p-4 transition-colors hover:bg-white/[0.01]">
                    {/* Rank */}
                    <div className="col-span-2 font-mono text-base font-bold text-slate-500">
                      02
                    </div>
                    {/* Profile */}
                    <div className="col-span-6 flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" 
                        alt="Chidi" 
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div className="space-y-0.5">
                        <div className="font-sans text-xs font-bold text-white">@chidi.lifestyle</div>
                        <div className="font-sans text-[10px] text-slate-500">Abuja, NG</div>
                      </div>
                    </div>
                    {/* Views */}
                    <div className="col-span-2 text-right">
                      <div className="font-mono text-xs font-bold text-white">180k</div>
                      <div className="text-[9px] text-emerald-400 font-bold flex items-center justify-end gap-0.5">
                        <span>📈</span> 8%
                      </div>
                    </div>
                    {/* Earnings */}
                    <div className="col-span-2 text-right font-mono text-xs font-bold text-slate-300">
                      ₦360k
                    </div>
                  </div>

                  {/* Rank 3 Row */}
                  <div className="grid grid-cols-12 items-center bg-transparent border-b border-white/5 p-4 transition-colors hover:bg-white/[0.01]">
                    {/* Rank */}
                    <div className="col-span-2 font-mono text-base font-bold text-orange-400">
                      03
                    </div>
                    {/* Profile */}
                    <div className="col-span-6 flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop" 
                        alt="Funmi" 
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div className="space-y-0.5">
                        <div className="font-sans text-xs font-bold text-white">@funmi.fitness</div>
                        <div className="font-sans text-[10px] text-slate-500">Port Harcourt, NG</div>
                      </div>
                    </div>
                    {/* Views */}
                    <div className="col-span-2 text-right">
                      <div className="font-mono text-xs font-bold text-white">92k</div>
                      <div className="text-[9px] text-slate-500 flex items-center justify-end gap-0.5">
                        <span>→</span> 0%
                      </div>
                    </div>
                    {/* Earnings */}
                    <div className="col-span-2 text-right font-mono text-xs font-bold text-orange-400">
                      ₦184k
                    </div>
                  </div>

                  {/* Rank 4 Row */}
                  <div className="grid grid-cols-12 items-center bg-transparent p-4 transition-colors hover:bg-white/[0.01]">
                    {/* Rank */}
                    <div className="col-span-2 font-mono text-base font-bold text-slate-700">
                      04
                    </div>
                    {/* Profile */}
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs uppercase text-slate-400">
                        TT
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-sans text-xs font-bold text-slate-300">@tech_tiwa</div>
                        <div className="font-sans text-[10px] text-slate-500">Kano, NG</div>
                      </div>
                    </div>
                    {/* Views */}
                    <div className="col-span-2 text-right">
                      <div className="font-mono text-xs font-bold text-slate-400">78k</div>
                    </div>
                    {/* Earnings */}
                    <div className="col-span-2 text-right font-mono text-xs font-bold text-slate-500">
                      ₦156k
                    </div>
                  </div>

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
                      <div className="font-mono text-2xl font-extrabold text-white">517k</div>
                      <div className="text-[9px] text-emerald-400">📊 Real-time</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payouts</div>
                      <div className="font-mono text-2xl font-extrabold text-emerald-400">₦1.03m</div>
                      <div className="text-[9px] text-slate-400">Released from Escrow</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creators Joined</div>
                      <div className="font-mono text-2xl font-extrabold text-white">28</div>
                      <div className="text-[9px] text-slate-400">Active slots locked</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submissions</div>
                      <div className="font-mono text-2xl font-extrabold text-white">19</div>
                      <div className="text-[9px] text-slate-400">Verified & Pending</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engagement</div>
                      <div className="font-mono text-2xl font-extrabold text-white">8.4%</div>
                      <div className="text-[9px] text-slate-400">Like & Comment ratio</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Watch Time</div>
                      <div className="font-mono text-2xl font-extrabold text-white">24.5s</div>
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
                    {/* TikTok Share */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          {renderPlatformIcon('TikTok', 'w-3.5 h-3.5')}
                          <span>TikTok</span>
                        </div>
                        <span className="font-mono text-slate-300">310k views (60%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 via-pink-500 to-cyan-500 h-full rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>

                    {/* Instagram Share */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          {renderPlatformIcon('Instagram', 'w-3.5 h-3.5')}
                          <span>Instagram</span>
                        </div>
                        <span className="font-mono text-slate-300">155k views (30%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>

                    {/* X Share */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          {renderPlatformIcon('X', 'w-3.5 h-3.5')}
                          <span>X (Twitter)</span>
                        </div>
                        <span className="font-mono text-slate-300">52k views (10%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-white/40 h-full rounded-full" style={{ width: '10%' }} />
                      </div>
                    </div>
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
                <div className="flex justify-between">
                  <span>Platform conversion</span>
                  <span className="text-white font-mono uppercase">{acceptedPlatforms.join('/')}</span>
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

              {!submission ? (
                /* Dynamic Not Joined State Card */
                <div className="space-y-4">
                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    You have not joined this campaign yet. Connect one of your placement handles and click <strong>Join Campaign</strong> to reserve your escrow budget.
                  </p>
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full py-3 rounded-2xl bg-white hover:bg-white/95 text-black font-sans font-bold text-xs shadow-lg transition-all"
                  >
                    Join Campaign to Post
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
                      <a href={submission.post_url || undefined} target="_blank" rel="noreferrer" className="text-kpugi-blue hover:underline font-mono truncate max-w-[150px]">
                        Link →
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span>Reserved payout</span>
                      <span className="text-white font-mono">{formatCompactCurrency(submission.reserved_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified views</span>
                      <span className="text-white font-mono">{submission.final_view_count?.toLocaleString() || '0'} Views</span>
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
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all">
          <div className="bg-[#0B1026] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative">
            
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
      )}

    </div>
  );
}
