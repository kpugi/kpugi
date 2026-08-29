'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ─── PLATFORMS DATA ────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    format: 'Reels & Stories',
    rateRange: '₦3,000 – ₦10,000',
    defaultCpm: 4000,
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
    bgLight: 'rgba(225, 48, 108, 0.08)',
    borderGlow: 'rgba(225, 48, 108, 0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
      </svg>
    ),
    activeDrops: 18,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    format: 'Short Videos & Trends',
    rateRange: '₦2,500 – ₦8,000',
    defaultCpm: 3500,
    color: '#00F2FE',
    gradient: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
    bgLight: 'rgba(0, 242, 254, 0.08)',
    borderGlow: 'rgba(0, 242, 254, 0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    activeDrops: 24,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    format: 'Shorts & Video Clips',
    rateRange: '₦4,000 – ₦12,000',
    defaultCpm: 5000,
    color: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    bgLight: 'rgba(255, 0, 0, 0.08)',
    borderGlow: 'rgba(255, 0, 0, 0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 9l5 3-5 3V9z" fill="currentColor"/>
      </svg>
    ),
    activeDrops: 12,
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    format: 'Posts & Viral Threads',
    rateRange: '₦1,500 – ₦5,000',
    defaultCpm: 2500,
    color: '#38BDF8',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #38BDF8 100%)',
    bgLight: 'rgba(56, 189, 248, 0.08)',
    borderGlow: 'rgba(56, 189, 248, 0.25)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    ),
    activeDrops: 15,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    format: 'Reels & Community Posts',
    rateRange: '₦1,500 – ₦5,000',
    defaultCpm: 2000,
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0052CC 100%)',
    bgLight: 'rgba(24, 119, 242, 0.08)',
    borderGlow: 'rgba(24, 119, 242, 0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M15 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H12v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    activeDrops: 9,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    format: 'Professional Posts & Articles',
    rateRange: '₦3,000 – ₦8,000',
    defaultCpm: 4500,
    color: '#0A66C2',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
    bgLight: 'rgba(10, 102, 194, 0.08)',
    borderGlow: 'rgba(10, 102, 194, 0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M7 10v7M7 7v.5M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    activeDrops: 7,
  },
];

// ─── SAMPLE LIVE DROPS ────────────────────────────────────────────────────
const SAMPLE_DROPS = [
  {
    id: 'd1',
    title: 'Fintech App Virality Drop',
    cpm: 3500,
    channels: ['TikTok', 'Instagram'],
    spotsLeft: 14,
    badge: '🔥 HOT DROP',
    category: 'Finance & Tech',
  },
  {
    id: 'd2',
    title: 'Glow Skincare Routine Challenge',
    cpm: 4500,
    channels: ['Instagram', 'YouTube'],
    spotsLeft: 8,
    badge: '⚡ HIGH CPM',
    category: 'Beauty & Lifestyle',
  },
  {
    id: 'd3',
    title: 'Mobile Gaming App Showdown',
    cpm: 3000,
    channels: ['TikTok', 'X'],
    spotsLeft: 22,
    badge: '🚀 FAST PAYOUT',
    category: 'Gaming',
  },
  {
    id: 'd4',
    title: 'Urban Fashion Lookbook Drop',
    cpm: 5000,
    channels: ['Instagram', 'TikTok'],
    spotsLeft: 5,
    badge: '💎 PREMIUM',
    category: 'Fashion',
  },
];

// ─── LIVE TICKER ITEMS ────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { handle: '@tobivibes', amount: '₦14,000', platform: 'Instagram Reels', views: '3,500 views' },
  { handle: '@chiamaka_x', amount: '₦28,000', platform: 'TikTok', views: '8,000 views' },
  { handle: '@abujacreator', amount: '₦45,000', platform: 'YouTube Shorts', views: '9,000 views' },
  { handle: '@david_tech', amount: '₦12,500', platform: 'X Threads', views: '5,000 views' },
  { handle: '@grace_lifestyle', amount: '₦60,000', platform: 'Instagram Reels', views: '15,000 views' },
  { handle: '@djkayshun', amount: '₦18,000', platform: 'TikTok', views: '6,000 views' },
];

export default function CreatorsPage() {
  // Calculator State
  const [views, setViews] = useState<number>(25000);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('instagram');
  const [customCpm, setCustomCpm] = useState<number>(3500);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedPlatform = PLATFORMS.find((p) => p.id === selectedPlatformId) || PLATFORMS[0];
  const effectiveCpm = customCpm || selectedPlatform.defaultCpm;

  // Calculation Math
  const grossEarnings = (views / 1000) * effectiveCpm;
  const platformFee = grossEarnings * 0.1;
  const netEarnings = grossEarnings - platformFee;

  const faqs = [
    {
      q: 'Do I need thousands of followers to join and earn?',
      a: 'Zero follower minimum! No gatekeeping. Whether you have 200 followers or 200,000 followers, as long as your post gets at least 1,000 verified views, you get paid.',
    },
    {
      q: 'How fast do payouts hit my bank account?',
      a: 'Instantly! Once your live post hits the view count threshold and finishes the verification window, funds land in your Kpugi wallet. You can withdraw directly to GTBank, Opay, Kuda, Zenith, Access, or any Nigerian bank 24/7.',
    },
    {
      q: 'How does Kpugi verify post views?',
      a: 'We use 100% automated scrapers that read public view counts on TikTok, Instagram, YouTube, X, Facebook, and LinkedIn. No human reviews, no favoritism, no delays.',
    },
    {
      q: 'What if my post falls short of 1,000 views?',
      a: 'If a post doesn\'t reach the 1,000 view floor before the campaign window closes, no payout is triggered for that drop, and the locked escrow budget returns to the brand.',
    },
    {
      q: 'Can I claim multiple campaign drops at the same time?',
      a: '100% yes! You can claim slots in as many active brand campaigns as you like across all your connected social handles.',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050811',
        color: '#F8FAFC',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ─── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '100px 24px 80px',
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Glow ambient backgrounds */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(139, 92, 246, 0.12) 45%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Top Gen Z Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 9999,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34D399',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 28,
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)',
            }}
          >
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            0 Follower Minimum • 100% Automated Payouts • Escrow Guaranteed
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.75rem, 6.5vw, 5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              margin: '0 auto 24px',
              maxWidth: 950,
              color: '#FFFFFF',
            }}
          >
            Turn Every 1,000 Views Into{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #A7F3D0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Direct Cash.
            </span>{' '}
            No Cap. 🔥
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.2rem',
              color: '#94A3B8',
              lineHeight: 1.65,
              maxWidth: 680,
              margin: '0 auto 40px',
              fontWeight: 400,
            }}
          >
            Pick a brand campaign drop. Post on TikTok, Instagram, YouTube, X, or LinkedIn.
            Watch your verified views stack up and withdraw Naira straight to your bank account anytime.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 54,
            }}
          >
            <Link
              href="/sign-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 36px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Start Earning Now 🚀
            </Link>
            <Link
              href="/browse"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 32px',
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#F8FAFC',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              Browse Active Drops ⚡
            </Link>
          </div>

          {/* Trust Stat Pills */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              maxWidth: 840,
              margin: '0 auto',
            }}
          >
            {[
              { value: '₦48,500,000+', label: 'Paid To Nigerian Creators' },
              { value: '12,400+', label: 'Verified Active Creators' },
              { value: '100% Escrow', label: 'Brand Budgets Locked' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '20px 18px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34D399', marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE PAYOUT TICKER ──────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #090D1A 0%, #0F172A 50%, #090D1A 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 40,
            animation: 'kpugi-ticker-anim 35s linear infinite',
            width: 'max-content',
            whiteSpace: 'nowrap',
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 9999,
                padding: '6px 16px',
                fontSize: '0.8125rem',
              }}
            >
              <span style={{ color: '#34D399', fontWeight: 700 }}>{item.handle}</span>
              <span style={{ color: '#94A3B8' }}>earned</span>
              <span style={{ color: '#10B981', fontWeight: 800, fontFamily: 'monospace' }}>{item.amount}</span>
              <span style={{ color: '#64748B' }}>• {item.platform}</span>
              <span style={{ color: '#A7F3D0', fontWeight: 600 }}>({item.views})</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── INTERACTIVE PAYOUT CALCULATOR ─────────────────────────────────────── */}
      <section
        style={{
          padding: '90px 24px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 800,
              color: '#10B981',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 10,
            }}
          >
            ⚡ INTERACTIVE CALCULATOR
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Calculate Your Bag 💰
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', maxWidth: 520, margin: '0 auto' }}>
            Move the slider and select your preferred platform to project your payout potential per post drop.
          </p>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 28,
            padding: '40px 32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'center',
          }}
        >
          {/* Controls Column */}
          <div>
            {/* Platform Selector Buttons */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 12 }}>
                1. Select Social Platform
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {PLATFORMS.map((p) => {
                  const isSelected = p.id === selectedPlatformId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPlatformId(p.id);
                        setCustomCpm(p.defaultCpm);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px 8px',
                        borderRadius: 14,
                        background: isSelected ? p.bgLight : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? `2px solid ${p.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? p.color : '#94A3B8',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ marginBottom: 4 }}>{p.icon}</div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Slider */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#CBD5E1' }}>
                  2. Projected Post Views
                </label>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399', fontFamily: 'monospace' }}>
                  {views.toLocaleString()} views
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={500000}
                step={1000}
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  accentColor: '#10B981',
                  cursor: 'pointer',
                  background: '#1E293B',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: 6 }}>
                <span>1,000</span>
                <span>50,000</span>
                <span>250,000</span>
                <span>500,000+</span>
              </div>
            </div>

            {/* Quick View Presets */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
                Quick Presets:
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[5000, 15000, 50000, 100000, 250000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setViews(preset)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 9999,
                      background: views === preset ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                      border: 'none',
                      color: views === preset ? '#FFFFFF' : '#CBD5E1',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {(preset / 1000).toFixed(0)}k views
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div
            style={{
              background: 'linear-gradient(145deg, #090D16 0%, #0F172A 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 24,
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              YOUR ESTIMATED TAKE-HOME PAYOUT
            </div>

            <div style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, color: '#10B981', fontFamily: 'monospace', lineHeight: 1.1, marginBottom: 8 }}>
              ₦{Math.round(netEarnings).toLocaleString()}
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: 24 }}>
              Based on ₦{effectiveCpm.toLocaleString()} CPM ({selectedPlatform.name})
            </p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94A3B8', marginBottom: 8 }}>
                <span>Gross Campaign Earnings:</span>
                <span style={{ fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace' }}>₦{Math.round(grossEarnings).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94A3B8', marginBottom: 8 }}>
                <span>Kpugi Platform Fee (10%):</span>
                <span style={{ fontWeight: 700, color: '#EF4444', fontFamily: 'monospace' }}>-₦{Math.round(platformFee).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#34D399', fontWeight: 700 }}>
                <span>Net Direct Deposit:</span>
                <span style={{ fontFamily: 'monospace' }}>₦{Math.round(netEarnings).toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/sign-up"
              style={{
                display: 'block',
                width: '100%',
                padding: '14px 0',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              }}
            >
              Claim Your First Drop 🚀
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6 MONETIZED PLATFORMS GRID ───────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 14px' }}>
            6 Social Networks. Endless Payout Drops. 📱
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', maxWidth: 560, margin: '0 auto' }}>
            Monetize the social channels you already post on daily. Connect your handles in seconds.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {PLATFORMS.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '28px 24px',
                transition: 'transform 0.2s, border-color 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top Accent Line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: p.gradient }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: p.bgLight,
                      color: p.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${p.borderGlow}`,
                    }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                      {p.name}
                    </h3>
                    <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{p.format}</span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {p.activeDrops} Active Drops
                </span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  AVERAGE PAYOUT RATE
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10B981', fontFamily: 'monospace' }}>
                  {p.rateRange} <span style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 500 }}>/ 1k views</span>
                </div>
              </div>

              <Link
                href="/sign-up"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 0',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F8FAFC',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                Connect {p.name} Account →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── LIVE SAMPLE DROPS TEASER ────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: 1200,
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 32,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              🔥 LIVE OPPORTUNITIES
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: 0 }}>
              Sample Active Brand Drops
            </h2>
          </div>
          <Link
            href="/browse"
            style={{
              color: '#34D399',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            View All Open Campaigns →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {SAMPLE_DROPS.map((drop) => (
            <div
              key={drop.id}
              style={{
                background: '#090D16',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)', padding: '4px 10px', borderRadius: 9999 }}>
                    {drop.badge}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{drop.category}</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 12 }}>
                  {drop.title}
                </h3>

                <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                  {drop.channels.map((c) => (
                    <span key={c} style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#CBD5E1', padding: '3px 8px', borderRadius: 6 }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>CPM RATE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10B981', fontFamily: 'monospace' }}>
                      ₦{drop.cpm.toLocaleString()}<span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/1k</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>SPOTS LEFT</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34D399' }}>{drop.spotsLeft} open</div>
                  </div>
                </div>

                <Link
                  href="/sign-up"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '10px 0',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                  }}
                >
                  Claim Slot Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4 STEPS TO GET PAID ────────────────────────────────────────────── */}
      <section
        style={{
          padding: '100px 24px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            ⚡ ZERO HASSLE WORKFLOW
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Four Steps from Signup to Direct Pay 💸
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}
        >
          {[
            {
              step: '01',
              title: 'Connect Your Socials',
              desc: 'Sign up and link your TikTok, Instagram, YouTube, X or LinkedIn profiles. Takes under 2 minutes.',
              color: '#10B981',
            },
            {
              step: '02',
              title: 'Claim A Campaign Drop',
              desc: 'Browse active brand briefs. Reserve your slot instantly with 0 pitch decks or waiting for approval.',
              color: '#38BDF8',
            },
            {
              step: '03',
              title: 'Post & Submit Link',
              desc: 'Download the assets, post on your account, and paste your live URL on Kpugi to start automated view tracking.',
              color: '#8B5CF6',
            },
            {
              step: '04',
              title: 'Cash Out To Any NG Bank',
              desc: 'Once your views pass verification, earnings land in your wallet. Withdraw to GTBank, Opay, Kuda, Zenith or Access anytime.',
              color: '#EC4899',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 24,
                padding: '32px 24px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  color: item.color,
                  opacity: 0.25,
                  fontFamily: 'monospace',
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 10 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY CREATORS LOVE KPUGI (TRUST) ─────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 32,
            padding: '48px 36px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 12px' }}>
              Built For Creators. Powered By Proof. 🛡️
            </h2>
            <p style={{ fontSize: '1rem', color: '#94A3B8', maxWidth: 520, margin: '0 auto' }}>
              We removed traditional agency friction so you focus 100% on making great content.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 28,
            }}
          >
            {[
              {
                title: '🤖 100% Automated Scraping',
                desc: 'No human agency middleman ranking your posts. View metrics are scraped directly from platform APIs.',
              },
              {
                title: '🔒 Locked Escrow Protection',
                desc: 'Brands lock their full campaign budget before any creator posts. Your earnings are 100% guaranteed.',
              },
              {
                title: '⚡ Instant 24/7 Bank Withdrawals',
                desc: 'No net-30 or net-60 payout delays. Withdraw your earnings straight to your bank account anytime.',
              },
            ].map((feature, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '24px 20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FREQUENTLY ASKED QUESTIONS ───────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 10px' }}>
            Got Questions? We Got Answers. 💬
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8' }}>
            Everything you need to know before claiming your first campaign drop.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: isOpen ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#F8FAFC',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '1.25rem', color: '#10B981', marginLeft: 16 }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 24px 20px',
                      fontSize: '0.9rem',
                      color: '#94A3B8',
                      lineHeight: 1.65,
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: 14,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── FINAL ELECTRIFYING CTA BANNER ────────────────────────────────────── */}
      <section
        style={{
          padding: '100px 24px',
          textAlign: 'center',
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, #050811 70%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 20px', color: '#FFFFFF' }}>
            Your Next Post Could Be Your Next Payday. 💰
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#94A3B8', lineHeight: 1.65, margin: '0 0 36px' }}>
            Join 12,400+ creators monetizing short-form video views across Nigeria. Free to join. Zero follower minimums.
          </p>
          <Link
            href="/sign-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '18px 42px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '1.1rem',
              textDecoration: 'none',
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
            }}
          >
            Create Your Free Account 🚀
          </Link>
        </div>
      </section>

      {/* Animation keyframes */}
      <style>{`
        @keyframes kpugi-ticker-anim {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
