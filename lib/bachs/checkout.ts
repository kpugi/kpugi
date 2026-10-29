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
  settlement_amount?: string | number;
  currency: string;
  reference: string;
  charge?: {
    status: string;
    amount_paid: string;
    amount?: string | number;
    settlement_amount?: string | number;
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
    successUrl || `${appUrl}/b/wallet?reference=${ref}&processor=bachs`,
    `/b/wallet?reference=${ref}&processor=bachs`
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
 * Retrieve a Checkout Session or Payment by Checkout ID (chk_...), Charge ID (ch_...), or Reference (KPG-BCH-...)
 */
export async function retrieveBachsCheckoutSession(idOrRef: string): Promise<BachsCheckoutSessionDetails> {
  const cleanId = (idOrRef || '').trim();
  if (!cleanId || cleanId.includes('{CHECKOUT_SESSION_ID}')) {
    throw new Error('Invalid checkout session ID or reference.');
  }

  // 1. If it's a checkout session ID (starts with chk_)
  if (cleanId.startsWith('chk_')) {
    try {
      return await bachsFetch<BachsCheckoutSessionDetails>(`/v1/checkout-sessions/${encodeURIComponent(cleanId)}`, {
        method: 'GET',
      });
    } catch (err: any) {
      console.warn(`[Bachs API] Direct checkout-session lookup failed for ${cleanId}, trying payment lookup:`, err.message);
    }
  }

  // 2. If it's a charge/payment ID (starts with ch_)
  if (cleanId.startsWith('ch_')) {
    const payment = await bachsFetch<any>(`/v1/payments/${encodeURIComponent(cleanId)}`, {
      method: 'GET',
    });
    return normalizePaymentToSessionDetails(payment);
  }

  // 3. Look up by reference via /v1/payments?reference=...
  const res = await bachsFetch<any>(`/v1/payments?reference=${encodeURIComponent(cleanId)}`, {
    method: 'GET',
  });

  const payment = Array.isArray(res?.items) ? res.items[0] : (Array.isArray(res) ? res[0] : res);
  if (payment) {
    return normalizePaymentToSessionDetails(payment);
  }

  // Fallback: try direct checkout-sessions lookup
  return bachsFetch<BachsCheckoutSessionDetails>(`/v1/checkout-sessions/${encodeURIComponent(cleanId)}`, {
    method: 'GET',
  });
}

function normalizePaymentToSessionDetails(payment: any): BachsCheckoutSessionDetails {
  const isPaid = payment.status === 'succeeded' || payment.status === 'paid' || payment.status === 'complete';
  const meta = payment.meta || payment.metadata || {};

  // Lock amount strictly to what was inputted on Kpugi (via metadata or settlement_amount),
  // ignoring customer processing fees added by Bachs (e.g. ₦1,500).
  const lockedAmount = meta.amount
    ? String(meta.amount)
    : (payment.settlement_amount && Number(payment.settlement_amount) > 0)
    ? String(payment.settlement_amount)
    : (payment.charge?.settlement_amount && Number(payment.charge.settlement_amount) > 0)
    ? String(payment.charge.settlement_amount)
    : String(payment.amount || payment.amount_paid || '0');

  return {
    checkout_id: payment.source?.checkout_id || payment.checkout_id || payment.id,
    status: isPaid ? 'complete' : 'open',
    payment_status: isPaid ? 'paid' : 'pending',
    amount: lockedAmount,
    settlement_amount: payment.settlement_amount || lockedAmount,
    currency: payment.currency || 'NGN',
    reference: payment.reference,
    charge: {
      status: payment.status === 'succeeded' ? 'successful' : payment.status,
      amount_paid: lockedAmount,
      amount: lockedAmount,
      settlement_amount: payment.settlement_amount || payment.charge?.settlement_amount || lockedAmount,
      payment_id: payment.id || payment.payment_id,
      customer: {
        email: payment.customer_email || payment.customer?.email,
        name: payment.customer_name || payment.customer?.name,
      },
    },
    customer: {
      email: payment.customer_email || payment.customer?.email,
      name: payment.customer_name || payment.customer?.name,
    },
    metadata: meta,
  };
}

