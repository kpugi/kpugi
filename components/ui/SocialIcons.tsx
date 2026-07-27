import React from 'react';

export function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.875 2.896 2.896 0 0 1-2.892-2.895 2.896 2.896 0 0 1 2.892-2.895c.294 0 .574.044.839.125V9.385a6.376 6.376 0 0 0-.839-.056 6.34 6.34 0 0 0-6.338 6.343 6.34 6.34 0 0 0 6.338 6.342 6.34 6.34 0 0 0 6.338-6.342V9.664a8.214 8.214 0 0 0 4.869 1.576V7.795a4.79 4.79 0 0 1-1.091-1.109z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function YouTubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function PlatformBadge({ platform, showLabel = false, className = '' }: { platform: string; showLabel?: boolean; className?: string }) {
  const p = platform?.toLowerCase() || '';
  if (p.includes('tiktok')) {
    return (
      <span title="TikTok" className={`inline-flex items-center justify-center p-2 rounded-xl bg-black text-white ${className}`}>
        <TikTokIcon className="w-4 h-4 fill-current" />
        {showLabel && <span className="ml-1.5 text-xs font-bold font-sans">TikTok</span>}
      </span>
    );
  }
  if (p.includes('youtube') || p.includes('shorts')) {
    return (
      <span title="YouTube" className={`inline-flex items-center justify-center p-2 rounded-xl bg-red-600 text-white ${className}`}>
        <YouTubeIcon className="w-4 h-4 fill-current" />
        {showLabel && <span className="ml-1.5 text-xs font-bold font-sans">YouTube</span>}
      </span>
    );
  }
  return (
    <span title="Instagram" className={`inline-flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white ${className}`}>
      <InstagramIcon className="w-4 h-4 stroke-current" />
      {showLabel && <span className="ml-1.5 text-xs font-bold font-sans">Instagram</span>}
    </span>
  );
}
