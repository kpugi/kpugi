'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function PrelanderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawUrl = searchParams.get('url') || '';

  const [destinationUrl, setDestinationUrl] = useState<string>('');
  const [hostname, setHostname] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(5);
  const [isAutoRedirecting, setIsAutoRedirecting] = useState<boolean>(true);

  useEffect(() => {
    if (!rawUrl) return;

    try {
      const decoded = decodeURIComponent(rawUrl);
      setDestinationUrl(decoded);
      const parsed = new URL(decoded);
      setHostname(parsed.hostname);
    } catch (e) {
      setDestinationUrl(rawUrl);
      setHostname(rawUrl.replace(/^https?:\/\//, '').split('/')[0]);
    }
  }, [rawUrl]);

  // Countdown timer for automatic seamless navigation
  useEffect(() => {
    if (!destinationUrl || !isAutoRedirecting) return;

    if (countdown <= 0) {
      window.location.href = destinationUrl;
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, destinationUrl, isAutoRedirecting]);

  if (!destinationUrl) {
    return (
      <div className="min-h-screen bg-[#090A0F] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mb-4">
          ⚠️
        </div>
        <h1 className="font-display font-extrabold text-2xl mb-2">Invalid Redirect URL</h1>
        <p className="text-slate-400 text-xs max-w-sm mb-6">No valid destination URL was provided to the Kpugi prelander.</p>
        <Link href="/browse" className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs">
          Return to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Floating Kpugi Header */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <img src="/kpugi_logo.png" alt="Kpugi Logo" className="h-7 w-auto object-contain" />
      </div>

      {/* Main Glassmorphic Interstitial Card */}
      <div className="relative z-10 max-w-xl w-full bg-[#0B1021]/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in">
        
        {/* Top Security Header Pill */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full">
            <span className="text-sm">🛡️</span>
            <span className="font-mono text-xs font-bold text-blue-400 tracking-wide uppercase">
              External Link Notice
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            go.kpugi.com
          </span>
        </div>

        {/* Center Target Preview Box */}
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            You are leaving <span className="text-kpugi-blue">Kpugi.com</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            You are being redirected to an external third-party destination URL outside of the Kpugi ecosystem:
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 mt-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                🌐
              </div>
              <div className="truncate">
                <div className="font-mono text-xs font-bold text-white truncate">{hostname}</div>
                <div className="font-mono text-[10px] text-slate-400 truncate max-w-md">{destinationUrl}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase shrink-0">
              HTTPS SECURE
            </span>
          </div>
        </div>

        {/* Safety Disclaimer Checklist */}
        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs text-slate-300">
          <div className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🔒</span> Safety & Security Checklist:
          </div>
          <ul className="space-y-2 text-slate-400 text-[11px] list-disc pl-4 leading-relaxed">
            <li>Kpugi will <strong>never ask</strong> for your wallet private keys or bank PINs on third-party sites.</li>
            <li>Ensure creative assets downloaded from external drives match official campaign brief specs.</li>
            <li>Your view audit scraper counter remains active on Kpugi while you browse external sites.</li>
          </ul>
        </div>

        {/* Countdown & Redirect Action Controls */}
        <div className="space-y-4 pt-2">
          
          {/* Progress Ring / Auto Redirect Banner */}
          <div className="flex items-center justify-between text-xs font-sans bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300">
                {isAutoRedirecting && countdown > 0
                  ? `Redirecting automatically in ${countdown}s...`
                  : 'Automatic redirect paused.'}
              </span>
            </div>
            <button
              onClick={() => setIsAutoRedirecting(!isAutoRedirecting)}
              className="text-[10px] font-bold text-slate-400 hover:text-white underline font-mono"
            >
              {isAutoRedirecting ? 'Pause Timer' : 'Resume Timer'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={destinationUrl}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-kpugi-blue hover:bg-blue-600 text-white font-sans font-bold text-xs shadow-xl shadow-kpugi-blue/20 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Continue to Destination</span>
              <span>→</span>
            </a>
            <button
              onClick={() => router.back()}
              className="py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white font-sans font-bold text-xs transition-all text-center"
            >
              Cancel & Return
            </button>
          </div>

        </div>

      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-[10px] font-mono text-slate-500">
        Kpugi Safe Redirect Prelander — Protected by Kpugi Guard Escrow
      </div>

    </div>
  );
}

export default function PrelanderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090A0F] text-white flex items-center justify-center p-6">
          <div className="animate-pulse font-mono text-xs text-slate-400">Loading Kpugi Guard Prelander...</div>
        </div>
      }
    >
      <PrelanderContent />
    </Suspense>
  );
}
