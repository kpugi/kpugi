import { bachsFetch } from './client';

export interface CreateCheckoutParams {
  amountInNaira: number;
  customerEmail: string;
  customerName?: string;
  reference: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface BachsCheckoutSessionResponse {
  checkout_id: string;
  status: string;
  amount: string;
  currency: string;
  reference: string;
  checkout_url: string;
  expires_at?: string;
  created_at?: string;
}

export interface BachsCheckoutSessionDetails {
  checkout_id: string;
  status: 'open' | 'complete' | 'expired';
  payment_status: 'paid' | 'requires_payment_method' | 'pending';
  amount: string;
  currency: string;
  reference: string;
  charge?: {
    status: string;
    amount_paid: string;
    payment_id?: string;
    customer?: {
      email?: string;
      name?: string;
    };
  };
  customer?: {
    email?: string;
    name?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Generate a branded Bachs payment reference in format: KPG-BCH-XXXXXX
 */
export function generateBachsReference(prefix: string = 'KPG-BCH'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

function sanitizeBachsUrl(url: string, fallbackPath: string = ''): string {
  const defaultBase = 'https://kpugi.com';
  let target = url || `${defaultBase}${fallbackPath}`;
  // Bachs strictly forbids localhost even in sandbox
  if (target.includes('localhost') || target.includes('127.0.0.1') || target.startsWith('http://')) {
    target = target.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, defaultBase);
  }
  return target;
}

/**
 * Create a Hosted Checkout Session on Bachs.io
 */
export async function createBachsCheckoutSession({
  amountInNaira,
  customerEmail,
  customerName,
  reference,
  successUrl,
  cancelUrl,
  metadata,
}: CreateCheckoutParams): Promise<BachsCheckoutSessionResponse> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');
  const ref = reference || generateBachsReference();
  
  const resolvedSuccessUrl = sanitizeBachsUrl(
    successUrl || `${appUrl}/b/wallet?session_id={CHECKOUT_SESSION_ID}&reference=${ref}&processor=bachs`,
    `/b/wallet?session_id={CHECKOUT_SESSION_ID}&reference=${ref}&processor=bachs`
  );
  const resolvedCancelUrl = sanitizeBachsUrl(
    cancelUrl || `${appUrl}/b/wallet?cancelled=true&processor=bachs`,
    `/b/wallet?cancelled=true&processor=bachs`
  );

  const payload: any = {
    pricing: {
      amount: amountInNaira.toFixed(2),
      currency: 'NGN',
    },
    customer: {
      email: customerEmail,
      ...(customerName ? { name: customerName } : {}),
    },
    reference: ref,
    success_url: resolvedSuccessUrl,
    cancel_url: resolvedCancelUrl,
  };

  if (metadata && Object.keys(metadata).length > 0) {
    payload.metadata = metadata;
  }

  const res = await bachsFetch<BachsCheckoutSessionResponse>('/v1/checkout-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return res;
}

/**
 * Retrieve a Checkout Session by Checkout ID
 */
export async function retrieveBachsCheckoutSession(checkoutId: string): Promise<BachsCheckoutSessionDetails> {
  return bachsFetch<BachsCheckoutSessionDetails>(`/v1/checkout-sessions/${encodeURIComponent(checkoutId)}`, {
    method: 'GET',
  });
}

