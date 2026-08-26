# Design Spec: PostHog Manual Integration

Integrate PostHog analytics and session recording manually into the Kpugi Next.js 15.1.0 application.

## Context & Approach

We will perform a manual installation of `posthog-js` and configure a client-side provider to initialize it safely. This avoids dependency conflicts and ensures compatibility with Next.js 15.1.0 and React 19.

Selected: **Manual Installation and Integration**

---

## Proposed Changes

### Component: Analytics

We will install `posthog-js`, define the PostHog provider, and wrap our root layout.

#### [NEW] [PostHogProvider.tsx](file:///c:/Users/HP/Desktop/Kpugi/components/analytics/PostHogProvider.tsx)
*   Create a client-side React provider to initialize PostHog, checking for client-side environment and initializing the PostHog instance safely with the project token and host.

#### [MODIFY] [AnalyticsProvider.tsx](file:///c:/Users/HP/Desktop/Kpugi/components/analytics/AnalyticsProvider.tsx)
*   Update `AnalyticsProvider` to take `children` and wrap them inside the `PostHogProvider`.

#### [MODIFY] [layout.tsx](file:///c:/Users/HP/Desktop/Kpugi/app/layout.tsx)
*   Update the body structure to wrap the page content with `AnalyticsProvider`.

#### [MODIFY] [.env.local](file:///c:/Users/HP/Desktop/Kpugi/.env.local)
*   Add the PostHog environment keys:
    *   `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_kf5sazud3amHHagFNETxRy83R5RaswvcW9VmUb7SFbq2`
    *   `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`

---

## Verification Plan

### Automated Tests / Compilation
*   Run `npx tsc --noEmit` to ensure type checks pass.

### Manual Verification
*   Verify that `posthog` is initialized on the client side without throwing errors.
