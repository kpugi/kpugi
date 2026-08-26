# Calculator Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage calculator to be a futuristic, glassmorphic, Apple-style component with accurate non-linear slider scaling, animated ambient lighting, and accessibility settings.

**Architecture:** Create custom CSS keyframes for glowing ambient effects and card breathing, integrate non-linear mapping functions for views and budget sliders, and refactor the styling of `HomeCalculatorSection.tsx` to follow Apple-style clean glassmorphism.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Lucide Icons

---

### Task 1: Add Custom Keyframes and Classes in CSS

**Files:**
- Modify: `app/globals.css:190-199`

- [ ] **Step 1: Append animations to globals.css**

Add keyframes for ambient breathing glow, card outline breathe, and prefers-reduced-motion overrides at the bottom of `c:\Users\HP\Desktop\Kpugi\app\globals.css`:
```css
/* Ambient glow breathing animation for futuristic orb effects */
@keyframes ambient-glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.7;
  }
}

.animate-ambient-glow {
  animation: ambient-glow 8s ease-in-out infinite;
}

/* Glassmorphic border pulsing breathe effect for card */
@keyframes card-breathe-creator {
  0%, 100% {
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  50% {
    box-shadow: 0 15px 45px 0 rgba(0, 0, 0, 0.15), 0 0 20px 2px rgba(23, 167, 91, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.15);
  }
}

.animate-card-breathe-creator {
  animation: card-breathe-creator 6s ease-in-out infinite;
}

@keyframes card-breathe-brand {
  0%, 100% {
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  50% {
    box-shadow: 0 15px 45px 0 rgba(0, 0, 0, 0.15), 0 0 20px 2px rgba(47, 73, 232, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.15);
  }
}

.animate-card-breathe-brand {
  animation: card-breathe-brand 6s ease-in-out infinite;
}

/* Reduced-motion support to disable high-movement animations */
@media (prefers-reduced-motion: reduce) {
  .animate-ambient-glow,
  .animate-card-breathe-creator,
  .animate-card-breathe-brand {
    animation: none !important;
    transform: translate(-50%, -50%) scale(1) !important;
  }
}
```

- [ ] **Step 2: Commit CSS modifications**

Run: `git add app/globals.css`
Run: `git commit -m "style: add custom ambient glow and glassmorphic breathing keyframes"`

---

### Task 2: Implement Non-Linear Slider Scale & Glassmorphic Redesign

**Files:**
- Modify: `components/marketing/HomeCalculatorSection.tsx`

- [ ] **Step 1: Implement non-linear scaling utility functions**

Add functions at the top of the file (before the component export) to map values correctly:
```typescript
// Non-linear mapping for Creator Views (5k -> 100k -> 250k -> 500k)
function mapSliderToViews(val: number): number {
  if (val <= 100) {
    const raw = 5000 + (val / 100) * (100000 - 5000);
    return Math.round(raw / 5000) * 5000;
  } else if (val <= 200) {
    const raw = 100000 + ((val - 100) / 100) * (250000 - 100000);
    return Math.round(raw / 10000) * 10000;
  } else {
    const raw = 250000 + ((val - 200) / 100) * (500000 - 250000);
    return Math.round(raw / 25000) * 25000;
  }
}

function mapViewsToSlider(views: number): number {
  if (views <= 100000) {
    return ((views - 5000) / (100000 - 5000)) * 100;
  } else if (views <= 250000) {
    return 100 + ((views - 100000) / (250000 - 100000)) * 100;
  } else {
    return 200 + ((views - 250000) / (500000 - 250000)) * 100;
  }
}

// Non-linear mapping for Brand Budget (100k -> 2.5M -> 5M -> 10M)
function mapSliderToBudget(val: number): number {
  if (val <= 100) {
    const raw = 100000 + (val / 100) * (2500000 - 100000);
    return Math.round(raw / 100000) * 100000;
  } else if (val <= 200) {
    const raw = 2500000 + ((val - 100) / 100) * (5000000 - 2500000);
    return Math.round(raw / 250000) * 250000;
  } else {
    const raw = 5000000 + ((val - 200) / 100) * (10000000 - 5000000);
    return Math.round(raw / 500000) * 500000;
  }
}

function mapBudgetToSlider(budget: number): number {
  if (budget <= 2500000) {
    return ((budget - 100000) / (2500000 - 100000)) * 100;
  } else if (budget <= 5000000) {
    return 100 + ((budget - 2500000) / (5000000 - 2500000)) * 100;
  } else {
    return 200 + ((budget - 5000000) / (10000000 - 5000000)) * 100;
  }
}
```

- [ ] **Step 2: Refactor the UI and controls**

Edit the component styling and variables:
1. Initialize states:
   * `const [creatorViews, setCreatorViews] = useState<number>(100000);` (Default to 100k so thumb starts aligned with label)
   * `const [brandBudget, setBrandBudget] = useState<number>(2500000);` (Default to 2.5M so thumb starts aligned)
2. Use ambient glowing orbs absolute layout behind/beside card.
3. Apply futuristic glassmorphism style to the container:
   * Set dynamic card border breathe class: `animate-card-breathe-creator` for creators, `animate-card-breathe-brand` for brands.
   * `backdrop-blur-xl bg-white/60 dark:bg-[#0E121E]/60 border border-slate-200/50 dark:border-white/[0.08] rounded-[2.5rem]`.
4. Style custom inputs with custom progress bar track color.
5. In the Right Column (Result Card):
   * Remove "Payout Frequency" and "Settlement Type" sections.
   * Format numbers using `.tabular-nums` for smooth sliding transitions.
6. Clean up visual layout for a minimalist, Apple-style layout.

- [ ] **Step 3: Commit component updates**

Run: `git add components/marketing/HomeCalculatorSection.tsx`
Run: `git commit -m "feat: redesign homepage calculator with glassmorphism and non-linear sliders"`

---

### Task 3: Verification with Type Checks

**Files:**
- Test: All files in the workspace

- [ ] **Step 1: Validate TypeScript types**

Run: `npx tsc --noEmit`

Expected: The command runs and completes successfully without any compilation errors.
