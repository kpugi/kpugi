/**
 * Bachs.io API Client
 * Supports both Live (https://api.bachs.io) and Sandbox (https://sandbox-api.bachs.io)
 */

const BACHS_API_KEY = process.env.BACHS_API_KEY || '';

export function getBachsBaseUrl(): string {
  if (BACHS_API_KEY.startsWith('sk_sandbox_')) {
    return 'https://sandbox-api.bachs.io';
  }
  return 'https://api.bachs.io';
}

export async function bachsFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiKey = process.env.BACHS_API_KEY;
  if (!apiKey) {
    throw new Error('[Bachs API] Missing BACHS_API_KEY in environment.');
  }

  const baseUrl = getBachsBaseUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    signal: options.signal || AbortSignal.timeout(15000),
  });

  const responseText = await response.text();
  let json: any = {};
  try {
    json = JSON.parse(responseText);
  } catch {
    json = { message: responseText };
  }

  if (!response.ok) {
    const errorMsg = json.message || json.error || `Bachs API request failed with status ${response.status}`;
    console.error(`[Bachs API Error] ${options.method || 'GET'} ${url} (${response.status}):`, errorMsg);
    throw new Error(errorMsg);
  }

  return json as T;
}

