import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Creators — Turn Your Posts into Daily Pay | Kpugi',
  description:
    'Monetize your Instagram, TikTok, YouTube, Facebook, X and LinkedIn. Earn Naira payouts for every 1,000 real views your posts generate.',
  alternates: { canonical: '/creators' },
  openGraph: {
    title: 'For Creators — Turn Your Posts into Daily Pay | Kpugi',
    description:
      'Monetize your Instagram, TikTok, YouTube, Facebook, X and LinkedIn. Earn Naira payouts for every 1,000 real views your posts generate.',
    url: 'https://kpugi.com/creators',
    siteName: 'Kpugi',
    type: 'website',
  },
};

// ─── Platform card ─────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    name: 'Instagram',
    handle: 'Reels & Stories',
    rate: '₦3,000 – ₦10,000',
    color: '#E1306C',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    handle: 'Short Videos',
    rate: '₦2,500 – ₦8,000',
    color: '#010101',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    handle: 'Shorts & Videos',
    rate: '₦4,000 – ₦12,000',
    color: '#FF0000',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M10 9l5 3-5 3V9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    handle: 'Posts & Reels',
    rate: '₦1,500 – ₦5,000',
    color: '#1877F2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M15 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H12v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'X',
    handle: 'Posts & Threads',
    rate: '₦1,000 – ₦4,000',
    color: '#000000',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    handle: 'Posts & Articles',
    rate: '₦2,000 – ₦6,000',
    color: '#0A66C2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 10v7M7 7v.5M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function PlatformCard({
  name,
  handle,
  rate,
  color,
  icon,
}: {
  name: string;
  handle: string;
  rate: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #E4E7F0',
        borderRadius: 20,
        padding: '28px 24px',
        flex: '1 1 0',
        minWidth: 160,
      }}
    >
      <div
        style={{
          color: color,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 600,
          fontSize: '1rem',
          color: '#0B1026',
          marginBottom: 4,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.8125rem',
          color: '#64748B',
          marginBottom: 16,
        }}
      >
        {handle}
      </div>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8125rem',
          color: '#17A75B',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {rate} / 1k views
      </div>
    </div>
  );
}

// ─── Step card (light) ────────────────────────────────────────────────────
function StepCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #E4E7F0',
        borderRadius: 20,
        padding: '28px 24px',
        flex: '1 1 0',
        minWidth: 180,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 700,
          fontSize: '5rem',
          color: 'rgba(23,167,91,0.06)',
          lineHeight: 1,
          position: 'absolute',
          top: 10,
          right: 16,
          letterSpacing: '-0.04em',
          userSelect: 'none',
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontFamily: "'Satoshi', sans-serif",
          fontWeight: 700,
          fontSize: '0.6875rem',
          color: '#17A75B',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 12,
        }}
      >
        {n}
      </div>
      <h3
        style={{
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 600,
          fontSize: '1rem',
          color: '#0B1026',
          margin: '0 0 8px',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.8125rem',
          color: '#64748B',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

// ─── Trust tile (light) ───────────────────────────────────────────────────
function TrustTile({ value, title, body }: { value: string; title: string; body: string }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #E4E7F0',
        borderRadius: 20,
        padding: '32px 28px',
        flex: '1 1 0',
        minWidth: 200,
      }}
    >
      <div
        style={{
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 700,
          fontSize: '2.25rem',
          color: '#17A75B',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          marginBottom: 14,
        }}
      >
        {value}
      </div>
      <h3
        style={{
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: '#0B1026',
          margin: '0 0 8px',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.8125rem',
          color: '#64748B',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

// ─── FAQ item (light) ─────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details style={{ borderBottom: '1px solid #E4E7F0' }}>
      <summary
        style={{
          fontFamily: "'Satoshi', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: '#0B1026',
          cursor: 'pointer',
          padding: '20px 0',
          listStyle: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {q}
        <span
          aria-hidden
          style={{ color: '#64748B', fontSize: '1.2rem', flexShrink: 0, marginLeft: 16 }}
        >
          +
        </span>
      </summary>
      <p
        style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.875rem',
          color: '#64748B',
          lineHeight: 1.7,
          margin: '0 0 20px',
          paddingRight: 32,
        }}
      >
        {a}
      </p>
    </details>
  );
}

// ─── Payout ticker strip ──────────────────────────────────────────────────
const TICKER_ITEMS = [
  '@tobivibes earned ₦6,400 · Instagram · 3,200 views',
  '@lagosgist_ earned ₦3,700 · TikTok · 1,850 views',
  '@adaeze.ng earned ₦10,200 · YouTube · 5,100 views',
  '@freshwaves earned ₦4,800 · Facebook · 2,400 views',
  '@abujabae_ earned ₦7,600 · LinkedIn · 3,800 views',
  '@djkayshun earned ₦2,200 · X · 1,100 views',
];

// ─── Page ─────────────────────────────────────────────────────────────────
export default function CreatorsPage() {
  const faqs = [
    {
      q: 'Do I need a large following to earn on Kpugi?',
      a: 'No. Any creator whose post gets at least 1,000 genuine views within the campaign window earns a payout. The quality of your audience matters more than the size of it.',
    },
    {
      q: 'When do I get paid?',
      a: 'Payouts are released automatically once your post clears the verification window and your views are confirmed. Funds land in your Kpugi wallet instantly and you can withdraw to your bank account anytime.',
    },
    {
      q: 'What happens if my post doesn\'t reach 1,000 views?',
      a: 'If your post falls below the minimum view count by the end of the campaign window, you won\'t receive a payout for that slot. The reserved budget returns to the campaign so another creator can claim it.',
    },
    {
      q: 'Can I join multiple campaigns at the same time?',
      a: 'Yes — you can post for as many active campaigns as you like. Each campaign is tracked separately.',
    },
    {
      q: 'Which platforms can I connect?',
      a: 'You can connect Instagram, TikTok, YouTube, Facebook, X and LinkedIn. Connect as many as you like to access more campaign opportunities.',
    },
  ];

  const tickerLine = [...TICKER_ITEMS, ...TICKER_ITEMS].join('   ·   ');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F6F7FB',
        color: '#0B1026',
        fontFamily: "'Satoshi', system-ui, sans-serif",
      }}
    >
      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '88px 24px 72px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
            lineHeight: 1.05,
            color: '#0B1026',
            margin: '0 0 24px',
            letterSpacing: '-0.025em',
          }}
        >
          Your post.{' '}
          <span
            style={{
              fontStyle: 'italic',
              color: '#17A75B',
            }}
          >
            Your pay.
          </span>
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: '#64748B',
            lineHeight: 1.7,
            margin: '0 auto 40px',
            maxWidth: 540,
          }}
        >
          Pick a brand campaign. Post on the platforms you already use.
          Earn Naira for every 1,000 real people who see it — deposited straight
          to your bank account.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link
            href="/sign-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#17A75B',
              color: '#ffffff',
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 700,
              fontSize: '0.9375rem',
              padding: '14px 28px',
              borderRadius: 12,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            Start Earning
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link
            href="/browse"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#ffffff',
              color: '#0B1026',
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              padding: '14px 28px',
              borderRadius: 12,
              textDecoration: 'none',
              border: '1px solid #E4E7F0',
              letterSpacing: '-0.01em',
            }}
          >
            Browse Campaigns
          </Link>
        </div>
      </section>

      {/* ─── LIVE PAYOUT TICKER ────────────────────────────────────────────── */}
      <div
        style={{
          background: '#0B1026',
          padding: '14px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 48,
            animation: 'kpugi-ticker 40s linear infinite',
            width: 'max-content',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.8125rem',
            color: '#17A75B',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
          aria-hidden
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ flexShrink: 0 }}>
              {item}
              <span style={{ color: 'rgba(23,167,91,0.3)', margin: '0 24px' }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── PAYOUT MATH ───────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '96px 24px 80px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
            gap: 48,
            alignItems: 'center',
          }}
          className="creators-math-grid"
        >
          <div>
            <h2
              style={{
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                color: '#0B1026',
                margin: '0 0 16px',
                letterSpacing: '-0.02em',
              }}
            >
              Simple maths. Real money.
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: '#64748B',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 400,
              }}
            >
              The default rate is ₦2,000 per 1,000 views. Some brands pay more.
              The more people see your post, the more you earn — automatically.
            </p>
          </div>

          {/* Formula card */}
          <div
            style={{
              background: '#0B1026',
              borderRadius: 24,
              padding: '40px 36px',
              fontFamily: 'JetBrains Mono, monospace',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
              // Payout formula
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem', marginBottom: 8 }}>
              (views ÷ 1,000) × ₦2,000
            </div>
            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                marginTop: 16,
                paddingTop: 20,
              }}
            >
              {[
                { views: '1,000', pay: '₦2,000' },
                { views: '5,000', pay: '₦10,000' },
                { views: '10,000', pay: '₦20,000' },
                { views: '50,000', pay: '₦100,000' },
              ].map((r) => (
                <div
                  key={r.views}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '0.9375rem',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{r.views} views</span>
                  <span style={{ color: '#17A75B', fontWeight: 700 }}>{r.pay}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: '0.6875rem',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              * A 10% Kpugi service fee applies to each payout
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#ffffff',
          borderTop: '1px solid #E4E7F0',
          borderBottom: '1px solid #E4E7F0',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '80px 24px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Clash Display', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              color: '#0B1026',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            6 platforms. One dashboard.
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: '#64748B',
              margin: '0 0 44px',
              maxWidth: 480,
            }}
          >
            Connect the accounts you already have and start earning from the content
            you&apos;re already creating.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {PLATFORMS.map((p) => (
              <PlatformCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '96px 24px 80px',
        }}
      >
        <h2
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            color: '#0B1026',
            margin: '0 0 48px',
            letterSpacing: '-0.02em',
          }}
        >
          Four steps from signup to payout
        </h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <StepCard
            n="01"
            title="Create your account"
            body="Sign up and connect the social accounts you want to monetize. Takes less than 5 minutes."
          />
          <StepCard
            n="02"
            title="Pick a campaign"
            body="Browse live brand campaigns and choose ones that fit your audience. No approval needed — every campaign is open to all creators."
          />
          <StepCard
            n="03"
            title="Post and submit"
            body="Post the brand's content to your account. Paste your live post link into Kpugi to clock in."
          />
          <StepCard
            n="04"
            title="Withdraw your Naira"
            body="Once your views are verified, your earnings appear in your wallet. Withdraw to any Nigerian bank account instantly."
          />
        </div>
      </section>

      {/* ─── TRUST ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#ffffff',
          borderTop: '1px solid #E4E7F0',
          borderBottom: '1px solid #E4E7F0',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '80px 24px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Clash Display', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
              color: '#0B1026',
              margin: '0 0 44px',
              letterSpacing: '-0.02em',
            }}
          >
            Your views. Your earnings. Your terms.
          </h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <TrustTile
              value="Auto"
              title="Views are the only metric"
              body="No subjective review. No human approval. Your post gets tracked automatically and your payout is calculated purely from verified view counts."
            />
            <TrustTile
              value="Held"
              title="Brand budgets are locked in"
              body="Before your post goes live, the brand's budget is already secured. If views are verified, you get paid — guaranteed."
            />
            <TrustTile
              value="Now"
              title="Withdraw anytime"
              body="Your earnings are yours the moment they clear. Withdraw to GTBank, Opay, Kuda, Zenith, Access or any other Nigerian bank whenever you like."
            />
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 740,
          margin: '0 auto',
          padding: '80px 24px',
        }}
      >
        <h2
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            color: '#0B1026',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Questions from creators
        </h2>
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#64748B',
            margin: '0 0 36px',
          }}
        >
          Everything you need before your first post.
        </p>
        {faqs.map((f) => (
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0B1026',
          padding: '80px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Clash Display', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              color: '#ffffff',
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}
          >
            Your next post could be your first payout.
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.65,
              margin: '0 0 36px',
            }}
          >
            Free to join. No minimum followers. Start earning from the content you&apos;re already making.
          </p>
          <Link
            href="/sign-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#17A75B',
              color: '#ffffff',
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 700,
              fontSize: '0.9375rem',
              padding: '16px 36px',
              borderRadius: 12,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            Create a Free Account
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Keyframes */}
      <style>{`
        @keyframes kpugi-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="kpugi-ticker"] { animation: none; }
        }
        @media (max-width: 768px) {
          .creators-math-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
