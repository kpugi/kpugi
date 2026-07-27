// Paystack Helper Client Stub for campaign funding and creator payouts

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

export async function paystackFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.paystack.co${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: options.signal || AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Paystack request failed with status ${response.status}`);
  }

  return response.json();
}
