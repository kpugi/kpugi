'use client';

import React, { useState, useEffect } from 'react';

interface TickerEvent {
  id: string;
  type: 'payout' | 'submission' | 'campaign';
  text: string;
  badge?: string;
  timeAgo: string;
}

const INITIAL_EVENTS: TickerEvent[] = [
  { id: '1', type: 'payout', text: 'Creator @ada_vibe earned ₦14,400', badge: '7,200 views', timeAgo: '2m ago' },
  { id: '2', type: 'submission', text: 'New clock-in on Campaign #82 by @kini_creative', badge: 'Instagram', timeAgo: '4m ago' },
  { id: '3', type: 'campaign', text: 'Brand "PiggyVest" funded new ₦1,200,000 Campaign', badge: 'Video Ad', timeAgo: '6m ago' },
  { id: '4', type: 'payout', text: 'Creator @tunde_reels released ₦28,000 payout', badge: '14,000 views', timeAgo: '9m ago' },
  { id: '5', type: 'submission', text: 'Creator @chidi_fx clocked in to Campaign #91', badge: 'TikTok', timeAgo: '12m ago' },
  { id: '6', type: 'payout', text: 'Creator @mimi_styles earned ₦8,600', badge: '4,300 views', timeAgo: '15m ago' },
];

export default function LiveTicker() {
  const [events, setEvents] = useState<TickerEvent[]>(INITIAL_EVENTS);
  const [highlightFirst, setHighlightFirst] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const simulatedEvents: TickerEvent[] = [
        { id: Date.now().toString() + '-1', type: 'payout', text: `Creator @nneka_${Math.floor(Math.random() * 90 + 10)} earned ₦${(Math.floor(Math.random() * 15 + 2) * 2000).toLocaleString()}`, badge: `${Math.floor(Math.random() * 15 + 2) * 1000} views`, timeAgo: 'Just now' },
        { id: Date.now().toString() + '-2', type: 'submission', text: `Creator @davido_fan_${Math.floor(Math.random() * 90 + 10)} clocked in to Campaign #${Math.floor(Math.random() * 50 + 50)}`, badge: Math.random() > 0.5 ? 'Instagram' : 'TikTok', timeAgo: 'Just now' },
      ];

      const newEvent = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
      setEvents((prev) => [newEvent, ...prev.slice(0, 7)]);
      setHighlightFirst(true);
      setTimeout(() => setHighlightFirst(false), 1200);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-kpugi-ink text-white border-y border-kpugi-ink/10 py-3 overflow-hidden shadow-inner">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0 border-r border-slate-700 pr-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kpugi-naira opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-kpugi-naira"></span>
          </span>
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-kpugi-naira">
            Live Stream
          </span>
        </div>

        <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap flex items-center gap-6 text-xs font-mono">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-500 ${
                index === 0 && highlightFirst
                  ? 'bg-kpugi-naira/30 text-emerald-300 ring-1 ring-kpugi-naira scale-105'
                  : 'bg-white/5 border border-white/10 text-slate-300'
              }`}
            >
              <span className={event.type === 'payout' ? 'text-kpugi-naira font-semibold' : 'text-slate-200'}>
                {event.text}
              </span>
              {event.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-300">
                  {event.badge}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-sans">{event.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
