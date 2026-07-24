# Kpugi — Design System

## Design direction

Kpugi is where a post turns into a payout. The design language should feel like a **live financial instrument**, not a generic gig-marketplace: numbers move, budgets deplete, views convert to Naira in real time. Energetic and precise — closer to a trading/fintech dashboard than a soft "creator economy" brand. Built around the existing blue "K" mark; everything else is disciplined so the mark and the live numbers stay the loudest things on screen.

Avoid the generic AI-default looks: no cream-background/serif/terracotta, no near-black-with-neon-accent, no hairline-broadsheet layout. Kpugi's own default is cool-white + saturated cobalt + tabular data.

## 1. Color

| Token | Hex | Use |
|---|---|---|
| `--color-primary` (Kpugi Blue) | `#2F49E8` | Brand mark, primary buttons, links, active states |
| `--color-ink` | `#0B1026` | Primary text, dark surfaces |
| `--color-paper` | `#F6F7FB` | App background — cool off-white, not cream |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-naira` (Signal Green) | `#17A75B` | Payout amounts, "verified pass," positive money movement |
| `--color-cliff` (Alert Red) | `#E4483C` | Hard-cliff failures, forfeited submissions, budget warnings |
| `--color-amber` | `#F5A623` | Pending/in-verification states, budget-almost-committed warnings |
| `--color-slate` | `#64748B` | Secondary text, metadata, timestamps |
| `--color-border` | `#E4E7F0` | Dividers, card borders |

Money and outcomes always get color: Naira Green for a completed payout, Alert Red for a failed/forfeited slot, Amber for anything still pending verification. This is the one place the palette is allowed to be loud — everywhere else stays disciplined blue-on-white/ink.

## 2. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display | **Clash Display** (Fontshare, variable) | Headlines, campaign titles, big numbers on the homepage. Bold/Semibold only — used with restraint, not on body copy. |
| Body | **Satoshi** (Fontshare, variable) | UI copy, descriptions, forms. Regular/Medium. |
| Data / numeric | **JetBrains Mono**, tabular figures | View counts, Naira amounts, CPM rates, countdown timers — anywhere a number needs to visually read as *data*, not prose. |

Type scale (rem, 16px base):
`display-xl: 4.5rem/1.05` · `display-lg: 3rem/1.1` · `h1: 2.25rem/1.2` · `h2: 1.5rem/1.3` · `h3: 1.125rem/1.4` · `body: 1rem/1.6` · `caption: 0.875rem/1.5` · `mono-data: 1rem/1.4, tabular-nums`

## 3. Layout & spacing

- 8px base spacing unit; container max-width `1200px` on marketing pages, full-bleed dashboard shells with a fixed 240px sidebar.
- Cards: `radius: 16px`, `border: 1px solid var(--color-border)`, subtle shadow only on hover/interactive cards — flat by default.
- Dashboard tables use tabular-nums (JetBrains Mono) right-aligned for every numeric column (views, ₦ amounts, %).
- Grid: 12-column on desktop, collapses to single-column stacked cards under 768px.

## 4. Components (DaisyUI theme)

Kpugi ships as a custom DaisyUI theme rather than a default one — buttons, badges, and progress bars all pull from the token table above.

```js
// tailwind.config.ts (excerpt)
daisyui: {
  themes: [
    {
      kpugi: {
        "primary": "#2F49E8",
        "primary-content": "#FFFFFF",
        "secondary": "#17A75B",
        "accent": "#F5A623",
        "neutral": "#0B1026",
        "base-100": "#FFFFFF",
        "base-200": "#F6F7FB",
        "base-300": "#E4E7F0",
        "info": "#2F49E8",
        "success": "#17A75B",
        "warning": "#F5A623",
        "error": "#E4483C",
        "--rounded-box": "1rem",
        "--rounded-btn": "0.75rem",
        "--tab-radius": "0.5rem",
      },
    },
  ],
}
```

Key component patterns:
- **Budget progress bar**: DaisyUI `progress` component recolored — fills in Kpugi Blue while budget is available, shifts to Amber past 85% reserved, and shows a small "fully committed" badge at 100%.
- **Submission status badge**: `pending` (amber, pulsing dot), `verified_pass` (green, checkmark), `verified_fail`/`forfeited` (red), `paid` (blue, filled).
- **Campaign card**: creative thumbnail, CPM rate in mono, budget progress bar, requirements as small pill tags (advisory, not a gate — visually distinct from hard filters).
- **Live counter**: a monospace, tabular-nums counter component used anywhere a number updates (views ticking up, ₦ payout accruing) — this is the shared primitive behind the homepage signature element below.

## 5. Motion

Restrained and purposeful — the "live-ness" of numbers is the motion budget, not decorative page animation:
- Numeric counters animate on value change (ease-out, ~400ms) rather than snapping — reinforces the "live instrument" feel.
- Card hover: 150ms lift + shadow, no rotation/skew gimmicks.
- Page transitions: none beyond standard Next.js route loading — no scroll-hijacking, no orchestrated reveal sequences. Reduced-motion respected throughout (disable counter animation, keep instant state changes).

## 6. Signature element

**The Live Ticker.** A horizontal strip (homepage hero, and a compact version in dashboard headers) that streams real, anonymized campaign activity as it happens — "Creator posted, 1,240 views verified, ₦2,480 released" — each line rendered in mono/tabular type with a Naira-Green flash on payout events. It's the one place the design is allowed to feel alive and unpolished-in-a-good-way, communicating the core mechanic (post → verify → get paid) without a single paragraph of copy. Everything else on the page stays quiet so this reads as the heartbeat of the product.
