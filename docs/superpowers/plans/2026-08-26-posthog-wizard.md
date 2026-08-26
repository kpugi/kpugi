# PostHog Manual Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate PostHog analytics manually into the Kpugi application.

**Architecture:** Install `posthog-js`, add env variables, create a custom client-side React provider, and wrap the root layout.

**Tech Stack:** Next.js 15, React 19, TypeScript, posthog-js

---

### Task 1: Install Dependencies and Configure Env Variables

**Files:**
- Modify: `package.json`
- Modify: `.env.local`

- [ ] **Step 1: Install posthog-js**

Run: `npm install posthog-js`

Expected: The command installs `posthog-js` successfully and adds it to `package.json` dependencies.

- [ ] **Step 2: Add PostHog keys to .env.local**

Append to `c:\Users\HP\Desktop\Kpugi\.env.local`:
```env
# PostHog Integration
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_kf5sazud3amHHagFNETxRy83R5RaswvcW9VmUb7SFbq2
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

- [ ] **Step 3: Commit initial package and env configuration**

Run: `git add package.json package-lock.json .env.local`
Run: `git commit -m "chore: install posthog-js and configure environment keys"`

---

### Task 2: Create and Integrate PostHog Provider

**Files:**
- Create: `components/analytics/PostHogProvider.tsx`
- Modify: `components/analytics/AnalyticsProvider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create client-side PostHogProvider**

Create `components/analytics/PostHogProvider.tsx` with:
```tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import { ReactNode } from 'react';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false, // Pageviews are captured manually or via Router event
    });
  }
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return <Provider client={posthog}>{children}</Provider>;
}
```

- [ ] **Step 2: Update components/analytics/AnalyticsProvider.tsx**

Modify `components/analytics/AnalyticsProvider.tsx`:
```tsx
'use client';

import { GoogleAnalytics } from './GoogleAnalytics';
import { MicrosoftClarity } from './MicrosoftClarity';
import { PostHogProvider } from './PostHogProvider';
import { ReactNode } from 'react';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <GoogleAnalytics />
      <MicrosoftClarity />
      {children}
    </PostHogProvider>
  );
}

export { GoogleAnalytics, MicrosoftClarity };
```

- [ ] **Step 3: Update app/layout.tsx**

Modify `app/layout.tsx` to wrap children inside `AnalyticsProvider`:
```tsx
// Wrap layout contents in AnalyticsProvider
        <body className="min-h-screen bg-kpugi-paper text-kpugi-ink dark:bg-[#090A0F] dark:text-white antialiased overflow-x-hidden transition-colors duration-200">
          <AnalyticsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange={false}
            >
              <NetworkStatusBanner />
              <KnockProviderWrapper>
                {children}
              </KnockProviderWrapper>
            </ThemeProvider>
          </AnalyticsProvider>
        </body>
```

- [ ] **Step 4: Commit integration files**

Run: `git add components/analytics/PostHogProvider.tsx components/analytics/AnalyticsProvider.tsx app/layout.tsx`
Run: `git commit -m "feat: integrate client-side PostHogProvider into analytics layout wrapper"`

---

### Task 3: Verification with Type Checks

**Files:**
- Test: All modified files

- [ ] **Step 1: Run TypeScript type checking**

Run: `npx tsc --noEmit`

Expected: The command runs and completes successfully without any compilation or syntax errors.
