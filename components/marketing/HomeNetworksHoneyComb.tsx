'use client';

import React, { useId, type SVGProps } from 'react';

/* ─────────────────────────────────────────────────────
   SOCIAL NETWORK ICONS
───────────────────────────────────────────────────── */
function IconTikTok(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.891 2.89 2.896 2.896 0 0 1-2.892-2.89 2.896 2.896 0 0 1 2.892-2.892c.307 0 .598.053.869.15v-3.52a6.374 6.374 0 0 0-.869-.06 6.337 6.337 0 0 0-6.337 6.322 6.337 6.337 0 0 0 6.337 6.323 6.337 6.337 0 0 0 6.338-6.323V8.895a8.214 8.214 0 0 0 4.768 1.488V6.938a4.838 4.838 0 0 1-1-.252z" />
    </svg>
  );
}

function IconInstagram(props: SVGProps<SVGSVGElement>) {
  const gradientId = useId();
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#feda75" />
          <stop offset="0.25" stopColor="#fa7e1e" />
          <stop offset="0.5" stopColor="#d62976" />
          <stop offset="0.75" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" x="2" y="2" rx="5.5" fill={`url(#${gradientId})`} />
      <rect width="13" height="13" x="5.5" y="5.5" rx="3.5" stroke="white" strokeWidth="1.6" fill="none" />
      <circle cx="12" cy="12" r="3.2" stroke="white" strokeWidth="1.6" fill="none" />
      <circle cx="15.8" cy="8.2" r="0.9" fill="white" />
    </svg>
  );
}

function IconYouTube(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function IconX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IconFacebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function IconLinkedIn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

function IconSnapchat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-3.8 0-6.5 2.8-6.5 6.4 0 1.2.3 2.4.9 3.4-.2.1-.5.3-.8.4-.6.3-1.3.4-2 .2-.2 0-.4.1-.4.3 0 .3.2.6.4.7 1 .5 2.1.2 3.1-.2.2.4.4.8.7 1.2-.5.2-1 .5-1.4.9-.6.6-1.1 1.4-1.5 2.3-.1.3 0 .6.2.8.2.1.5.1.7 0 .8-.4 1.7-.5 2.6-.4.4.1.8.3 1.2.6.8.6 1.7 1.4 3.1 1.4s2.3-.8 3.1-1.4c.4-.3.8-.5 1.2-.6.9-.1 1.8 0 2.6.4.2.1.5.1.7 0 .2-.2.3-.5.2-.8-.4-.9-.9-1.7-1.5-2.3-.4-.4-.9-.7-1.4-.9.3-.4.5-.8.7-1.2 1 .4 2.1.7 3.1.2.2-.1.4-.4.4-.7 0-.2-.2-.3-.4-.3-.7.2-1.4.1-2-.2-.3-.1-.6-.3-.8-.4.6-1 .9-2.2.9-3.4C18.5 4.8 15.8 2 12 2z"/>
    </svg>
  );
}

function IconPinterest(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-4.4 23.2c-.1-1-.2-2.5 0-3.6l1.5-6.3s-.4-.8-.4-1.9c0-1.8 1-3.1 2.3-3.1 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1.1 4.2-.3 1.3.6 2.3 1.9 2.3 2.3 0 4.1-2.4 4.1-5.9 0-3.1-2.2-5.3-5.4-5.3-3.7 0-5.8 2.8-5.8 5.6 0 1.1.4 2.3 1 3 .1.1.1.2.1.4l-.4 1.5c-.1.2-.2.3-.4.2-1.6-.7-2.6-3-2.6-4.9 0-4 2.9-7.7 8.4-7.7 4.4 0 7.8 3.2 7.8 7.4 0 4.4-2.8 8-6.6 8-1.3 0-2.5-.7-2.9-1.5l-.8 3c-.3 1.1-1.1 2.5-1.6 3.4 1.3.4 2.6.6 4 .6a12 12 0 0 0 0-24z"/>
    </svg>
  );
}

function IconReddit(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );
}

function IconThreads(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24C5.46 24 0 18.574 0 11.905 0 5.237 5.46 0 12.186 0c6.684 0 12.138 5.187 12.186 11.758v.487c-.048 3.513-2.036 5.864-5.086 5.864-1.745 0-3.197-.869-3.924-2.122-.727 1.272-2.103 2.122-3.805 2.122-2.909 0-5.111-2.146-5.111-5.068 0-2.923 2.202-5.068 5.111-5.068 1.637 0 2.99.789 3.732 2.015V7.452h2.24v6.863c0 1.764.887 2.664 2.457 2.664 1.83 0 2.872-1.399 2.896-3.791-.048-5.328-4.484-9.537-9.896-9.537-5.55 0-10.05 4.382-10.05 9.774 0 5.391 4.5 9.773 10.05 9.773 2.593 0 4.97-.936 6.745-2.597l1.455 1.545C18.665 22.887 15.62 24 12.186 24zm-.702-8.083c1.685 0 2.946-1.258 2.946-2.915 0-1.657-1.261-2.915-2.946-2.915-1.685 0-2.945 1.258-2.945 2.915 0 1.657 1.26 2.915 2.945 2.915z"/>
    </svg>
  );
}

function IconWhatsApp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.79 14.07c-.24.67-1.21 1.24-1.68 1.32-.45.08-1.03.11-1.66-.1-.38-.12-.87-.28-1.5-.56-2.64-1.15-4.35-3.82-4.48-4-.13-.18-1.07-1.42-1.07-2.71 0-1.29.68-1.92.92-2.18.24-.26.53-.33.71-.33.18 0 .36 0 .52.01.17.01.39-.06.61.47.23.55.79 1.93.86 2.07.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.17-.3.37-.43.5-.14.14-.29.3-.12.59.16.28.73 1.2 1.56 1.94 1.07.96 1.98 1.25 2.26 1.39.28.14.45.12.61-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.7-.17 1.37z"/>
    </svg>
  );
}

function IconTelegram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 7.46l-2.03 9.57c-.15.68-.56.85-1.12.53l-3.1-2.29-1.5 1.44c-.17.17-.31.31-.63.31l.22-3.17 5.77-5.21c.25-.22-.05-.35-.39-.12l-7.14 4.5-3.07-.96c-.67-.21-.68-.67.14-.99l12.01-4.63c.56-.2.1.47.01.62z"/>
    </svg>
  );
}

function IconDiscord(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function IconTwitch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
    </svg>
  );
}

function IconSpotify(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function IconSubstack(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
    </svg>
  );
}

function IconMedium(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────
   INTEGRATIONS LIST (17 APPS TOTAL)
   Central supported platforms vs. outer coming soon apps
───────────────────────────────────────────────────── */
const integrations = [
  // 0
  { name: 'Reddit', icon: IconReddit, isLive: false },
  // 1, 2
  { name: 'Pinterest', icon: IconPinterest, isLive: false },
  { name: 'Snapchat', icon: IconSnapchat, isLive: false },
  // 3, 4, 5
  { name: 'Threads', icon: IconThreads, isLive: false },
  { name: 'Facebook', icon: IconFacebook, isLive: true, badgeBg: 'bg-[#1877F2]/10 border-[#1877F2]/30' },
  { name: 'WhatsApp', icon: IconWhatsApp, isLive: false },
  // 6, 7, 8, 9, 10 (Center Column - Heart of Honeycomb)
  { name: 'Telegram', icon: IconTelegram, isLive: false },
  { name: 'TikTok', icon: IconTikTok, isLive: true, badgeBg: 'bg-black/90 border-white/20' },
  { name: 'Instagram', icon: IconInstagram, isLive: true, badgeBg: 'bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#962fbf] border-white/20' },
  { name: 'YouTube', icon: IconYouTube, isLive: true, badgeBg: 'bg-[#FF0000]/10 border-[#FF0000]/30' },
  { name: 'Discord', icon: IconDiscord, isLive: false },
  // 11, 12, 13
  { name: 'Twitch', icon: IconTwitch, isLive: false },
  { name: 'X (Twitter)', icon: IconX, isLive: true, badgeBg: 'bg-black/90 border-white/20' },
  { name: 'LinkedIn', icon: IconLinkedIn, isLive: true, badgeBg: 'bg-[#0A66C2]/10 border-[#0A66C2]/30' },
  // 14, 15
  { name: 'Spotify', icon: IconSpotify, isLive: false },
  { name: 'Substack', icon: IconSubstack, isLive: false },
  // 16
  { name: 'Medium', icon: IconMedium, isLive: false },
];

const columnLayout = [
  [0],
  [1, 2],
  [3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13],
  [14, 15],
  [16],
];

function NetworkCard({ app }: { app: (typeof integrations)[0] }) {
  const Icon = app.icon;
  return (
    <div
      title={app.isLive ? `${app.name} (Live on Kpugi)` : `${app.name} (Coming Soon)`}
      className={`group relative flex items-center justify-center rounded-2xl transition-all duration-300 ${
        app.isLive
          ? 'h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-white dark:bg-[#0E121E] border-2 border-[#2F49E8]/40 dark:border-[#2F49E8]/60 shadow-[0_10px_25px_rgba(47,73,232,0.25)] hover:scale-110 z-20 cursor-pointer'
          : 'h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 bg-slate-100/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] opacity-35 grayscale hover:grayscale-0 hover:opacity-90 hover:scale-105 z-10'
      }`}
    >
      {/* Active Pulse Glow for Live Supported Networks */}
      {app.isLive && (
        <div className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </div>
      )}

      {/* Network Icon */}
      <Icon
        className={`${
          app.isLive
            ? 'h-7 w-7 sm:h-9 sm:w-9 lg:h-11 lg:w-11 text-slate-900 dark:text-white'
            : 'h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-slate-400 dark:text-white/40'
        }`}
      />

      {/* Coming Soon Pill on Hover for Inactive */}
      {!app.isLive && (
        <div className="absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
          Soon
        </div>
      )}
    </div>
  );
}

export default function HomeNetworksHoneyComb() {
  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden bg-[#F8F9FD] dark:bg-[#08090D] transition-colors duration-300">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[700px] h-[350px] pointer-events-none z-0
          bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(47,73,232,0.1)_0%,rgba(47,73,232,0.02)_50%,transparent_75%)]
          dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(47,73,232,0.2)_0%,rgba(47,73,232,0.03)_50%,transparent_75%)]"
      />

      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        
        {/* Headline */}
        <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-satoshi uppercase tracking-wider bg-[#2F49E8]/10 text-[#2F49E8] dark:text-[#5B7CFF] border border-[#2F49E8]/20 mb-4">
            Multi-Platform Reach
          </span>
          <h2 className="font-clash font-bold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] [text-wrap:balance]">
            Seamless across major channels, expanding everywhere
          </h2>
          <p className="font-satoshi text-slate-600 dark:text-white/50 text-sm sm:text-base mt-3 max-w-lg">
            Active view tracking on Nigeria’s top 6 social networks — with new channel integrations launching continuously.
          </p>
        </div>

        {/* Honeycomb Display */}
        <div className="relative mx-auto mb-12 max-w-4xl">
          
          {/* Mobile Grid */}
          <div className="flex flex-wrap justify-center gap-3 md:hidden">
            {integrations.map((app) => (
              <NetworkCard key={app.name} app={app} />
            ))}
          </div>

          {/* Desktop Honeycomb Symmetrical Columns */}
          <div className="hidden items-center justify-center gap-2 md:flex lg:gap-3.5">
            {columnLayout.map((colIndices, i) => (
              <div key={i} className="flex flex-col items-center gap-2 lg:gap-3.5">
                {colIndices.map((index) => {
                  const app = integrations[index];
                  return <NetworkCard key={app.name} app={app} />;
                })}
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Subtext */}
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <p className="font-satoshi text-slate-500 dark:text-white/40 text-xs sm:text-sm leading-relaxed">
            One brief. 6 live networks. Millions of verified impressions across Nigeria.
          </p>
        </div>

      </div>
    </section>
  );
}
