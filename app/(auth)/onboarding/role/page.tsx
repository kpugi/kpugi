'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  baseAlpha: number;
  life: number;
  maxLife: number;
  side: 'left' | 'right';
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas({ hoveredRole }: { hoveredRole: 'advertiser' | 'creator' | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const hoveredRef = useRef(hoveredRole);

  useEffect(() => { hoveredRef.current = hoveredRole; }, [hoveredRole]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = 110;
    particlesRef.current = [];
    for (let i = 0; i < count; i++) {
      const side: 'left' | 'right' = i < count / 2 ? 'left' : 'right';
      const x = side === 'left'
        ? Math.random() * (window.innerWidth / 2)
        : window.innerWidth / 2 + Math.random() * (window.innerWidth / 2);
      particlesRef.current.push({
        x, y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.6 + 0.4,
        color: side === 'left' ? '#2F49E8' : '#17A75B',
        baseAlpha: Math.random() * 0.45 + 0.08,
        life: Math.random() * 300,
        maxLife: 250 + Math.random() * 250,
        side,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const hovered = hoveredRef.current;

      particlesRef.current.forEach(p => {
        p.life++;
        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = p.side === 'left'
            ? Math.random() * (canvas.width / 2)
            : canvas.width / 2 + Math.random() * (canvas.width / 2);
          p.y = Math.random() * canvas.height;
        }

        let alpha = p.baseAlpha;
        if (hovered === 'advertiser') {
          alpha = p.side === 'left' ? Math.min(0.75, p.baseAlpha * 2.5) : p.baseAlpha * 0.1;
          if (p.side === 'left') {
            p.vx += (canvas.width * 0.25 - p.x) * 0.00008;
            p.vy += (canvas.height * 0.5 - p.y) * 0.00008;
          }
        } else if (hovered === 'creator') {
          alpha = p.side === 'right' ? Math.min(0.75, p.baseAlpha * 2.5) : p.baseAlpha * 0.1;
          if (p.side === 'right') {
            p.vx += (canvas.width * 0.75 - p.x) * 0.00008;
            p.vy += (canvas.height * 0.5 - p.y) * 0.00008;
          }
        }

        p.vx *= 0.992;
        p.vy *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ADVERTISER_BENEFITS = [
  { icon: '📣', text: 'Targeted reach' },
  { icon: '💰', text: 'CPM budgeting' },
  { icon: '✅', text: 'Verified views' },
  { icon: '📊', text: 'Live analytics' },
  { icon: '🎯', text: 'Multi-platform' },
  { icon: '⚡', text: 'Instant launch' },
];

const CREATOR_BENEFITS = [
  { icon: '💸', text: 'Auto payouts' },
  { icon: '🚀', text: 'TikTok & Insta' },
  { icon: '📱', text: 'Easy uploads' },
  { icon: '📈', text: 'Per-1K earnings' },
  { icon: '🔥', text: 'X / Twitter' },
  { icon: '🏆', text: 'Creator ranks' },
];

// ─── Benefit Pill ─────────────────────────────────────────────────────────────
function BenefitPill({
  icon, text, index, visible, accentColor, accentBg, accentBorder,
}: {
  icon: string; text: string; index: number; visible: boolean;
  accentColor: string; accentBg: string; accentBorder: string;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        color: accentColor,
        borderRadius: 99,
        padding: '5px 11px',
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: '0.01em',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.9)',
        transition: `opacity 0.38s ease ${index * 55 + 80}ms, transform 0.42s cubic-bezier(0.34,1.56,0.64,1) ${index * 55 + 80}ms`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 12 }}>{icon}</span>
      {text}
    </div>
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({
  role, hoveredRole, onHover, onLeave, onSelect, loading,
}: {
  role: 'advertiser' | 'creator';
  hoveredRole: 'advertiser' | 'creator' | null;
  onHover: () => void; onLeave: () => void; onSelect: () => void;
  loading: boolean;
}) {
  const isHovered = hoveredRole === role;
  const isOther = hoveredRole !== null && hoveredRole !== role;
  const isAdvertiser = role === 'advertiser';

  const accent = isAdvertiser ? '#2F49E8' : '#17A75B';
  const accentLight = isAdvertiser ? '#7B96FF' : '#4ADE80';
  const accentBg = isAdvertiser ? 'rgba(47,73,232,0.12)' : 'rgba(23,167,91,0.12)';
  const accentBorder = isAdvertiser ? 'rgba(47,73,232,0.28)' : 'rgba(23,167,91,0.28)';
  const accentBorderHov = isAdvertiser ? 'rgba(47,73,232,0.65)' : 'rgba(23,167,91,0.65)';
  const glowColor = isAdvertiser ? 'rgba(47,73,232,0.28)' : 'rgba(23,167,91,0.28)';
  const benefits = isAdvertiser ? ADVERTISER_BENEFITS : CREATOR_BENEFITS;
  const tag = isAdvertiser ? 'FOR BRANDS & AGENCIES' : 'FOR CREATORS & INFLUENCERS';
  const title = isAdvertiser ? 'Brand' : 'Creator';
  const emoji = isAdvertiser ? '📣' : '🚀';
  const desc = isAdvertiser
    ? 'Launch targeted campaigns. Set your CPM, upload creative, and watch verified views pour in across every platform.'
    : 'Post campaign briefs to TikTok, Instagram & X. Earn automated payouts per 1,000 verified views.';
  const btnLabel = isAdvertiser ? 'Continue as Brand →' : 'Continue as Creator →';

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        cursor: loading ? 'wait' : 'pointer',
        borderRadius: 28,
        padding: 2,
        background: isHovered
          ? `linear-gradient(145deg, ${accent}90, ${accentLight}35, transparent)`
          : `linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
        transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
        opacity: isOther ? 0.32 : 1,
        transform: isOther
          ? 'scale(0.93) translateY(8px)'
          : isHovered
          ? 'scale(1.02) translateY(-6px)'
          : 'scale(1)',
        filter: isOther ? 'blur(0.8px) saturate(0.5)' : 'none',
        minWidth: 0,
      }}
    >
      {/* Glow halo */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: -16,
            borderRadius: 44,
            background: `radial-gradient(ellipse at 50% 20%, ${glowColor}, transparent 65%)`,
            pointerEvents: 'none',
            animation: 'breathePulse 2.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Inner glass card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 26,
          background: isHovered
            ? 'linear-gradient(160deg, rgba(8,11,30,0.97) 0%, rgba(8,11,30,0.94) 100%)'
            : 'rgba(9,10,15,0.75)',
          border: `1px solid ${isHovered ? accentBorderHov : 'rgba(255,255,255,0.07)'}`,
          backdropFilter: 'blur(28px)',
          padding: '36px 32px',
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
          boxShadow: isHovered
            ? `0 40px 80px -16px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`
            : '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Top edge shimmer */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: '10%', right: '10%', height: 1,
            background: isHovered
              ? `linear-gradient(90deg, transparent, ${accentLight}70, transparent)`
              : 'transparent',
            transition: 'all 0.5s ease',
          }}
        />

        {/* Emoji icon */}
        <div
          style={{
            width: 56, height: 56, borderRadius: 16,
            background: accentBg,
            border: `1px solid ${accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            marginBottom: 24,
            transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
            transform: isHovered ? 'scale(1.12) rotate(-6deg)' : 'scale(1) rotate(0deg)',
            boxShadow: isHovered ? `0 8px 28px ${glowColor}` : 'none',
          }}
        >
          {loading
            ? <span style={{ display: 'inline-block', animation: 'roleSpin 0.9s linear infinite' }}>◌</span>
            : emoji
          }
        </div>

        {/* Tag label */}
        <span
          style={{
            display: 'block',
            fontSize: 10, fontWeight: 700,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: accentLight,
            marginBottom: 8,
            transition: 'color 0.3s ease',
          }}
        >
          {tag}
        </span>

        {/* Title */}
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: 42, fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: '#fff',
            fontFamily: "'Clash Display', 'Satoshi', sans-serif",
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          style={{
            color: 'rgba(255,255,255,0.42)',
            fontSize: 13.5, lineHeight: 1.7,
            margin: '0 0 24px',
            transition: 'opacity 0.4s ease',
            opacity: isHovered ? 0.65 : 0.42,
          }}
        >
          {desc}
        </p>

        {/* Benefits — animate up on hover */}
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: 7,
            marginBottom: 28,
            minHeight: 82,
          }}
        >
          {benefits.map((b, i) => (
            <BenefitPill
              key={b.text}
              icon={b.icon}
              text={b.text}
              index={i}
              visible={isHovered}
              accentColor={accentLight}
              accentBg={accentBg}
              accentBorder={accentBorder}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          disabled={!!loading}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 14,
            border: 'none',
            fontWeight: 700, fontSize: 13.5,
            letterSpacing: '0.02em',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8,
            transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            background: isHovered
              ? `linear-gradient(135deg, ${accent}, ${accentLight})`
              : 'rgba(255,255,255,0.07)',
            color: isHovered ? '#fff' : 'rgba(255,255,255,0.38)',
            boxShadow: isHovered ? `0 10px 36px ${glowColor}` : 'none',
            transform: isHovered ? 'translateY(-1px)' : 'none',
          }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'roleSpin 0.8s linear infinite' }}>◌</span>
              Setting up your account...
            </>
          ) : (
            btnLabel
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OnboardingRolePage() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<'advertiser' | 'creator' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<'advertiser' | 'creator' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSelectRole = async (role: 'advertiser' | 'creator') => {
    if (loadingRole) return;
    try {
      setLoadingRole(role);
      setError(null);
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-role', role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set role');
      router.push(`/onboarding/${role}`);
    } catch (err: any) {
      console.error('Role selection error:', err);
      setError(err.message || 'Something went wrong');
      setLoadingRole(null);
    }
  };

  return (
    <>
      <style>{`
        @keyframes breathePulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes roleSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes roleOrbLeft {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.5; }
          50% { transform: scale(1.18) translateY(-18px); opacity: 0.8; }
        }
        @keyframes roleOrbRight {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.45; }
          50% { transform: scale(1.14) translateY(14px); opacity: 0.75; }
        }
        @keyframes shimmerGrad {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatBadge {
          from { opacity: 0; transform: translateY(-14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatHeadline {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCards {
          from { opacity: 0; transform: translateY(36px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .role-card-grid {
          display: flex;
          gap: 18px;
          width: 100%;
          max-width: 940px;
          margin: 0 auto;
        }
        .role-divider {
          width: 1px;
          flex-shrink: 0;
          align-self: stretch;
          background: linear-gradient(to bottom,
            transparent 0%,
            rgba(255,255,255,0.08) 20%,
            rgba(255,255,255,0.08) 80%,
            transparent 100%
          );
          margin: 16px 0;
        }
        @media (max-width: 680px) {
          .role-card-grid { flex-direction: column; }
          .role-divider {
            width: 100%; height: 1px;
            margin: 0;
            background: linear-gradient(to right,
              transparent 0%,
              rgba(255,255,255,0.08) 20%,
              rgba(255,255,255,0.08) 80%,
              transparent 100%
            );
          }
        }
      `}</style>

      {/* Particle field */}
      <ParticleCanvas hoveredRole={hoveredRole} />

      {/* Ambient breathing orbs */}
      <div style={{
        position: 'fixed', left: '-18vw', top: '10%',
        width: '55vw', height: '55vw', maxWidth: 720, maxHeight: 720,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(47,73,232,0.14) 0%, transparent 65%)',
        animation: 'roleOrbLeft 7s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', right: '-18vw', top: '25%',
        width: '50vw', height: '50vw', maxWidth: 680, maxHeight: 680,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(23,167,91,0.12) 0%, transparent 65%)',
        animation: 'roleOrbRight 8.5s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Subtle noise overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
        opacity: 0.5,
      }} />

      {/* Page content */}
      <div style={{
        position: 'relative', zIndex: 2,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 20px',
      }}>
        {/* Step badge */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-14px)',
          transition: 'opacity 0.55s ease 0.1s, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s',
          marginBottom: 36,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 99,
            background: 'rgba(47,73,232,0.1)',
            border: '1px solid rgba(47,73,232,0.22)',
            color: '#7B96FF',
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.13em',
            textTransform: 'uppercase',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#2F49E8',
              boxShadow: '0 0 8px #2F49E8',
              display: 'inline-block',
              animation: 'breathePulse 2.2s ease-in-out infinite',
            }} />
            Step 1 of 2 — Account Type
          </span>
        </div>

        {/* Headline */}
        <div style={{
          textAlign: 'center', marginBottom: 52,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(22px)',
          transition: 'opacity 0.65s ease 0.22s, transform 0.65s cubic-bezier(0.23,1,0.32,1) 0.22s',
        }}>
          <h1 style={{
            margin: '0 0 16px',
            fontSize: 'clamp(38px, 6vw, 72px)',
            fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 1.04,
            color: '#fff',
            fontFamily: "'Clash Display', 'Satoshi', sans-serif",
          }}>
            Who are{' '}
            <span style={{
              background: 'linear-gradient(135deg, #2F49E8 0%, #7B96FF 45%, #17A75B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '220% auto',
              animation: 'shimmerGrad 4.5s linear infinite',
            }}>
              you?
            </span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.38)',
            fontSize: 15, lineHeight: 1.65,
            maxWidth: 400, margin: '0 auto',
          }}>
            Explore your path — click to commit.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div style={{
            marginBottom: 24,
            padding: '12px 20px', borderRadius: 12,
            background: 'rgba(228,72,60,0.1)',
            border: '1px solid rgba(228,72,60,0.28)',
            color: '#FF8A80', fontSize: 13, fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* Cards grid */}
        <div
          className="role-card-grid"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(36px)',
            transition: 'opacity 0.75s ease 0.38s, transform 0.75s cubic-bezier(0.23,1,0.32,1) 0.38s',
          }}
        >
          <RoleCard
            role="advertiser"
            hoveredRole={hoveredRole}
            onHover={() => !loadingRole && setHoveredRole('advertiser')}
            onLeave={() => setHoveredRole(null)}
            onSelect={() => handleSelectRole('advertiser')}
            loading={loadingRole === 'advertiser'}
          />

          <div className="role-divider" />

          <RoleCard
            role="creator"
            hoveredRole={hoveredRole}
            onHover={() => !loadingRole && setHoveredRole('creator')}
            onLeave={() => setHoveredRole(null)}
            onSelect={() => handleSelectRole('creator')}
            loading={loadingRole === 'creator'}
          />
        </div>
      </div>
    </>
  );
}
