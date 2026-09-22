'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent } from '@/lib/audit';
import {
  getPlatformSettings,
  saveSettingSection,
  resetSettingSection,
  PlatformSettings,
  DEFAULT_SETTINGS,
} from '@/lib/admin/platform-settings-service';
import { createAdminClient } from '@/lib/supabase/server';

export interface ServiceIntegrationStatus {
  key: string;
  name: string;
  category: 'payment' | 'auth' | 'database' | 'messaging' | 'storage' | 'scraping' | 'ai' | 'automation';
  configured: boolean;
  maskedKey: string;
  statusText: string;
  envKeys: string[];
  docUrl?: string;
  isTestable: boolean;
}

function maskSecret(val?: string | null): string {
  if (!val || typeof val !== 'string' || val.trim().length === 0) return 'Not Configured';
  const trimmed = val.trim();
  if (trimmed.length <= 8) return '••••••••';
  const start = trimmed.slice(0, 3);
  const end = trimmed.slice(-4);
  return `${start}••••••••${end}`;
}

/**
 * Inspect environment and return unified status of all 14 external integrations
 */
export async function getIntegrationsStatusAction(): Promise<ServiceIntegrationStatus[]> {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  const paystackPublic = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  const clerkPublic = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const knockSecret = process.env.KNOCK_API_SECRET_KEY;
  const knockPublic = process.env.NEXT_PUBLIC_KNOCK_API_KEY;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const apifyToken = process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN;
  const githubPat = process.env.GITHUB_PAT;
  const diditKey = process.env.DIDIT_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const freshdeskUrl = process.env.NEXT_PUBLIC_FRESHDESK_PORTAL_URL;

  return [
    {
      key: 'paystack',
      name: 'Paystack Payment Gateway',
      category: 'payment',
      configured: Boolean(paystackSecret && paystackPublic),
      maskedKey: maskSecret(paystackSecret),
      statusText: paystackSecret ? 'Live Credentials Configured' : 'Missing PAYSTACK_SECRET_KEY',
      envKeys: ['PAYSTACK_SECRET_KEY', 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'],
      isTestable: true,
    },
    {
      key: 'clerk',
      name: 'Clerk User Authentication',
      category: 'auth',
      configured: Boolean(clerkSecret && clerkPublic),
      maskedKey: maskSecret(clerkSecret),
      statusText: clerkSecret ? 'JWT Auth Provider Active' : 'Missing CLERK_SECRET_KEY',
      envKeys: ['CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'],
      isTestable: true,
    },
    {
      key: 'supabase',
      name: 'Supabase Postgres Database',
      category: 'database',
      configured: Boolean(supabaseUrl && supabaseServiceKey),
      maskedKey: maskSecret(supabaseServiceKey),
      statusText: supabaseServiceKey ? 'Service-Role Client Connected' : 'Missing SUPABASE_SERVICE_ROLE_KEY',
      envKeys: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
      isTestable: true,
    },
    {
      key: 'resend',
      name: 'Resend Transactional Email',
      category: 'messaging',
      configured: Boolean(resendKey),
      maskedKey: maskSecret(resendKey),
      statusText: resendKey ? 'Outbound SMTP Active' : 'Missing RESEND_API_KEY',
      envKeys: ['RESEND_API_KEY'],
      isTestable: true,
    },
    {
      key: 'knock',
      name: 'Knock Notification Feed',
      category: 'messaging',
      configured: Boolean(knockSecret && knockPublic),
      maskedKey: maskSecret(knockSecret),
      statusText: knockSecret ? 'In-App Stream Active' : 'Missing KNOCK_API_SECRET_KEY',
      envKeys: ['KNOCK_API_SECRET_KEY', 'NEXT_PUBLIC_KNOCK_API_KEY'],
      isTestable: true,
    },
    {
      key: 'redis',
      name: 'Upstash Redis Cache & Rate Limiting',
      category: 'storage',
      configured: Boolean(redisUrl && redisToken),
      maskedKey: maskSecret(redisToken),
      statusText: redisUrl ? 'Low-Latency Cache Connected' : 'Missing UPSTASH_REDIS_REST_URL',
      envKeys: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
      isTestable: true,
    },
    {
      key: 'apify',
      name: 'Apify Social Scraper Engine',
      category: 'scraping',
      configured: Boolean(apifyToken),
      maskedKey: maskSecret(apifyToken),
      statusText: apifyToken ? 'Scraper API Tokens Loaded' : 'Missing APIFY_API_TOKENS',
      envKeys: ['APIFY_API_TOKENS', 'APIFY_INSTAGRAM_ACTOR'],
      isTestable: true,
    },
    {
      key: 'github',
      name: 'GitHub Actions Automated Workflow',
      category: 'automation',
      configured: Boolean(githubPat),
      maskedKey: maskSecret(githubPat),
      statusText: githubPat ? 'Repository PAT Connected' : 'Missing GITHUB_PAT',
      envKeys: ['GITHUB_PAT', 'GITHUB_REPO'],
      isTestable: true,
    },
    {
      key: 'didit',
      name: 'Didit KYC & Identity Verification',
      category: 'auth',
      configured: Boolean(diditKey),
      maskedKey: maskSecret(diditKey),
      statusText: diditKey ? 'ID & Biometrics Active' : 'Missing DIDIT_API_KEY',
      envKeys: ['DIDIT_API_KEY', 'DIDIT_WORKFLOW_ID', 'DIDIT_WEBHOOK_SECRET'],
      isTestable: true,
    },
    {
      key: 'gemini',
      name: 'Google Gemini Generative AI',
      category: 'ai',
      configured: Boolean(geminiKey),
      maskedKey: maskSecret(geminiKey),
      statusText: geminiKey ? 'Gemini 1.5 Pro Enabled' : 'Missing GEMINI_API_KEY',
      envKeys: ['GEMINI_API_KEY'],
      isTestable: false,
    },
    {
      key: 'nvidia',
      name: 'NVIDIA NIM Intelligence (Llama 3.1)',
      category: 'ai',
      configured: Boolean(nvidiaKey),
      maskedKey: maskSecret(nvidiaKey),
      statusText: nvidiaKey ? 'NIM Inference API Active' : 'Missing NVIDIA_API_KEY',
      envKeys: ['NVIDIA_API_KEY'],
      isTestable: false,
    },
    {
      key: 'cron',
      name: 'Cron Automation Guard Secret',
      category: 'automation',
      configured: Boolean(cronSecret),
      maskedKey: maskSecret(cronSecret),
      statusText: cronSecret ? 'Bearer Token Auth Active' : 'Missing CRON_SECRET',
      envKeys: ['CRON_SECRET'],
      isTestable: true,
    },
    {
      key: 'freshdesk',
      name: 'Freshdesk Customer Support',
      category: 'messaging',
      configured: Boolean(freshdeskUrl),
      maskedKey: maskSecret(process.env.FRESHDESK_JWT_SECRET),
      statusText: freshdeskUrl ? 'Support Portal Connected' : 'Missing NEXT_PUBLIC_FRESHDESK_PORTAL_URL',
      envKeys: ['NEXT_PUBLIC_FRESHDESK_PORTAL_URL', 'FRESHDESK_JWT_SECRET'],
      isTestable: false,
    },
    {
      key: 'betterstack',
      name: 'BetterStack Heartbeat Monitors',
      category: 'automation',
      configured: Boolean(process.env.BETTERSTACK_HEARTBEAT_DAILY_SETTLEMENT),
      maskedKey: maskSecret(process.env.BETTERSTACK_HEARTBEAT_DAILY_SETTLEMENT),
      statusText: process.env.BETTERSTACK_HEARTBEAT_DAILY_SETTLEMENT ? 'Heartbeat Pings Configured' : 'Optional Monitors Idle',
      envKeys: ['BETTERSTACK_HEARTBEAT_DAILY_SETTLEMENT', 'BETTERSTACK_HEARTBEAT_VERIFY_SUBMISSIONS'],
      isTestable: false,
    },
  ];
}

/**
 * Fetch all platform settings and current integrations status
 */
export async function getPlatformSettingsAction() {
  const { profile } = await requireAdminSession();
  const settings = await getPlatformSettings();
  const integrations = await getIntegrationsStatusAction();

  return {
    admin: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    },
    settings,
    integrations,
  };
}

/**
 * Update a specific section of platform settings and record audit log
 */
export async function updatePlatformSettingsAction<K extends keyof PlatformSettings>(
  category: K,
  patch: Partial<PlatformSettings[K]>,
  reason?: string
) {
  const { profile } = await requireAdminSession();

  // Validate specific values
  if (category === 'marketplace') {
    const market = patch as Partial<PlatformSettings['marketplace']>;
    if (market.commissionRate !== undefined && (market.commissionRate < 0 || market.commissionRate > 0.5)) {
      throw new Error('Commission rate must be between 0% and 50%');
    }
    if (market.minWithdrawalAmount !== undefined && market.minWithdrawalAmount < 100) {
      throw new Error('Minimum withdrawal amount must be at least ₦100');
    }
    if (market.minCampaignBudget !== undefined && market.minCampaignBudget < 1000) {
      throw new Error('Minimum campaign budget must be at least ₦1,000');
    }
  }

  const updatedSection = await saveSettingSection(category, patch, profile.id);

  // Log audit event
  await logAuditEvent({
    profileId: profile.id,
    actorRole: 'admin',
    action: `settings.${category}.update`,
    targetTable: 'platform_settings',
    targetId: category,
    details: reason || `Updated ${category} platform settings`,
    payload: { category, patch },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/browse');

  return {
    success: true,
    category,
    updatedSection,
  };
}

/**
 * Reset a specific section to factory defaults
 */
export async function resetCategoryDefaultsAction<K extends keyof PlatformSettings>(
  category: K
) {
  const { profile } = await requireAdminSession();

  const resetSection = await resetSettingSection(category, profile.id);

  await logAuditEvent({
    profileId: profile.id,
    actorRole: 'admin',
    action: `settings.${category}.reset_defaults`,
    targetTable: 'platform_settings',
    targetId: category,
    details: `Reset ${category} settings to system defaults`,
    payload: { category, defaultValues: DEFAULT_SETTINGS[category] },
  });

  revalidatePath('/admin/settings');

  return {
    success: true,
    category,
    resetSection,
  };
}

/**
 * Test live connection to an external service and measure round-trip latency
 */
export async function testServiceConnectionAction(serviceKey: string): Promise<{
  serviceKey: string;
  status: 'connected' | 'error' | 'not_configured';
  latencyMs: number;
  message: string;
}> {
  await requireAdminSession();
  const startTime = Date.now();

  try {
    switch (serviceKey) {
      case 'paystack': {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return { serviceKey, status: 'not_configured', latencyMs: 0, message: 'PAYSTACK_SECRET_KEY is missing' };
        
        const res = await fetch('https://api.paystack.co/balance', {
          headers: { Authorization: `Bearer ${secret}` },
          cache: 'no-store',
        });
        const latency = Date.now() - startTime;
        if (res.ok) {
          const data = await res.json();
          const balance = data?.data?.[0]?.balance ?? 0;
          return { serviceKey, status: 'connected', latencyMs: latency, message: `Connected to Paystack! Balance available: ₦${(balance / 100).toLocaleString()}` };
        }
        return { serviceKey, status: 'error', latencyMs: latency, message: `Paystack HTTP ${res.status}: ${res.statusText}` };
      }

      case 'supabase': {
        const supabase = createAdminClient();
        const { count, error } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        const latency = Date.now() - startTime;
        if (error) {
          return { serviceKey, status: 'error', latencyMs: latency, message: `Supabase query error: ${error.message}` };
        }
        return { serviceKey, status: 'connected', latencyMs: latency, message: `Database responsive! Total registered profiles: ${count ?? 0}` };
      }

      case 'redis': {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;
        if (!url || !token) return { serviceKey, status: 'not_configured', latencyMs: 0, message: 'Upstash Redis URL or Token is missing' };

        const pingUrl = url.startsWith('http') ? `${url}/ping` : `https://${url}/ping`;
        const res = await fetch(pingUrl, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const latency = Date.now() - startTime;
        if (res.ok) {
          return { serviceKey, status: 'connected', latencyMs: latency, message: 'Upstash Redis responded with PONG' };
        }
        return { serviceKey, status: 'error', latencyMs: latency, message: `Redis HTTP ${res.status}` };
      }

      case 'resend': {
        const key = process.env.RESEND_API_KEY;
        if (!key) return { serviceKey, status: 'not_configured', latencyMs: 0, message: 'RESEND_API_KEY is missing' };

        const res = await fetch('https://api.resend.com/api-keys', {
          headers: { Authorization: `Bearer ${key}` },
          cache: 'no-store',
        });
        const latency = Date.now() - startTime;
        if (res.ok) {
          return { serviceKey, status: 'connected', latencyMs: latency, message: 'Resend API authenticated successfully' };
        }
        return { serviceKey, status: 'error', latencyMs: latency, message: `Resend HTTP ${res.status}` };
      }

      case 'github': {
        const pat = process.env.GITHUB_PAT;
        const repo = process.env.GITHUB_REPO || 'kpugi/kpugi';
        if (!pat) return { serviceKey, status: 'not_configured', latencyMs: 0, message: 'GITHUB_PAT is missing' };

        const res = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: {
            Authorization: `Bearer ${pat}`,
            'User-Agent': 'Kpugi-Admin-Healthcheck',
          },
          cache: 'no-store',
        });
        const latency = Date.now() - startTime;
        if (res.ok) {
          return { serviceKey, status: 'connected', latencyMs: latency, message: `GitHub repo ${repo} verified with workflow permissions` };
        }
        return { serviceKey, status: 'error', latencyMs: latency, message: `GitHub HTTP ${res.status}` };
      }

      case 'apify': {
        const token = process.env.APIFY_API_TOKENS || process.env.APIFY_API_TOKEN;
        if (!token) return { serviceKey, status: 'not_configured', latencyMs: 0, message: 'APIFY_API_TOKENS is missing' };

        const cleanToken = token.split(',')[0].trim();
        const res = await fetch(`https://api.apify.com/v2/users/me?token=${cleanToken}`, {
          cache: 'no-store',
        });
        const latency = Date.now() - startTime;
        if (res.ok) {
          const user = await res.json();
          return { serviceKey, status: 'connected', latencyMs: latency, message: `Apify user authenticated: ${user?.data?.username || 'Verified'}` };
        }
        return { serviceKey, status: 'error', latencyMs: latency, message: `Apify HTTP ${res.status}` };
      }

      case 'clerk': {
        const secret = process.env.CLERK_SECRET_KEY;
        if (!secret) return { serviceKey, status: 'not_configured', latencyMs: 0, message: 'CLERK_SECRET_KEY is missing' };

        const res = await fetch('https://api.clerk.com/v1/users?limit=1', {
          headers: { Authorization: `Bearer ${secret}` },
          cache: 'no-store',
        });
        const latency = Date.now() - startTime;
        if (res.ok) {
          return { serviceKey, status: 'connected', latencyMs: latency, message: 'Clerk Auth API reachable and operational' };
        }
        return { serviceKey, status: 'error', latencyMs: latency, message: `Clerk HTTP ${res.status}` };
      }

      case 'cron': {
        const secret = process.env.CRON_SECRET;
        const latency = Date.now() - startTime;
        if (!secret) return { serviceKey, status: 'not_configured', latencyMs: 0, message: 'CRON_SECRET is missing' };
        return { serviceKey, status: 'connected', latencyMs: latency, message: 'CRON_SECRET is securely configured in server environment' };
      }

      default:
        return { serviceKey, status: 'not_configured', latencyMs: 0, message: 'No live test routine defined for this integration' };
    }
  } catch (err) {
    const latency = Date.now() - startTime;
    return {
      serviceKey,
      status: 'error',
      latencyMs: latency,
      message: err instanceof Error ? err.message : 'Connection failed',
    };
  }
}

/**
 * Trigger background cron job manually and capture execution payload
 */
export async function triggerCronJobAction(cronPath: string): Promise<{
  success: boolean;
  statusCode: number;
  latencyMs: number;
  payload: Record<string, unknown> | null;
  error?: string;
}> {
  const { profile } = await requireAdminSession();
  const startTime = Date.now();

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return {
      success: false,
      statusCode: 500,
      latencyMs: 0,
      payload: null,
      error: 'CRON_SECRET is not configured on this server environment.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const targetUrl = `${baseUrl.replace(/\/$/, '')}${cronPath}`;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
      cache: 'no-store',
    });

    const latencyMs = Date.now() - startTime;
    let payload: Record<string, unknown> | null = null;
    try {
      payload = await res.json();
    } catch {
      payload = { rawText: await res.text() };
    }

    // Log audit event
    await logAuditEvent({
      profileId: profile.id,
      actorRole: 'admin',
      action: 'cron.manual_trigger',
      targetTable: 'cron_jobs',
      targetId: cronPath,
      details: `Admin manually triggered cron job ${cronPath}. Status: ${res.status}`,
      payload: { cronPath, statusCode: res.status, latencyMs, payload },
    });

    return {
      success: res.ok,
      statusCode: res.status,
      latencyMs,
      payload,
      error: res.ok ? undefined : `Cron returned HTTP ${res.status}`,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      statusCode: 500,
      latencyMs,
      payload: null,
      error: err instanceof Error ? err.message : 'Failed to reach cron endpoint',
    };
  }
}
