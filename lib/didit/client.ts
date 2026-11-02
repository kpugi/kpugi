/**
 * Didit Identity Verification Client
 * Handles creation of KYC verification sessions and decision status queries.
 */

const DIDIT_API_BASE = process.env.DIDIT_API_BASE_URL || 'https://verification.didit.me/v3';

export interface DiditSessionResponse {
  sessionId: string;
  url: string;
  status: string;
}

export interface DiditDecisionResponse {
  sessionId: string;
  status: 'approved' | 'rejected' | 'pending' | 'in_progress';
  decision?: string;
  verifiedAt?: string;
}

/**
 * Creates a new Didit identity verification session for a creator.
 */
export async function createDiditKycSession({
  creatorId,
  email,
  redirectUrl,
}: {
  creatorId: string;
  email: string;
  redirectUrl?: string;
}): Promise<DiditSessionResponse> {
  const apiKey = process.env.DIDIT_API_KEY;

  if (!apiKey) {
    throw new Error('DIDIT_API_KEY is not configured in environment variables.');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = redirectUrl || `${appUrl}/settings?kyc_return=true`;
  const workflowId = process.env.DIDIT_WORKFLOW_ID || '';

  const endpoints = [
    `${DIDIT_API_BASE}/session/`,
    'https://verification.didit.me/v3/session/',
    'https://verification.didit.me/v2/session/',
  ];

  let lastError = '';

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          vendor_data: creatorId,
          callback: callbackUrl,
          email,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json();
        const sessionId = data.session_id || data.id || data.session_token;
        const url = data.url || data.session_url || (data.session_token ? `https://verify.didit.me/session/${data.session_token}` : null);
        if (!url) {
          throw new Error('Didit session created but no verification URL was returned.');
        }
        return {
          sessionId,
          url,
          status: data.status || 'created',
        };
      }

      const errJson = await res.json().catch(() => ({}));
      const errorDetail = errJson.detail || errJson.message || `HTTP ${res.status}`;
      console.warn(`[Didit API ${endpoint} Warning]:`, res.status, errorDetail);
      lastError = errorDetail;
    } catch (err: any) {
      console.error(`[Didit API ${endpoint} Error]:`, err);
      lastError = err?.message || 'Network error';
    }
  }

  throw new Error(`Didit KYC verification session failed: ${lastError || 'Unable to connect to Didit verification service.'}`);
}

/**
 * Queries decision status for an existing Didit verification session.
 */
export async function getDiditSessionDecision(sessionId: string): Promise<DiditDecisionResponse> {
  const apiKey = process.env.DIDIT_API_KEY;

  if (!apiKey || !sessionId || sessionId.startsWith('didit_sess_')) {
    return { sessionId, status: 'pending' };
  }

  try {
    const res = await fetch(`${DIDIT_API_BASE}/session/${sessionId}/decision/`, {
      headers: {
        'x-api-key': apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const statusRaw = (data.status || data.decision || '').toLowerCase();
      let status: 'approved' | 'rejected' | 'pending' | 'in_progress' = 'pending';

      if (statusRaw.includes('approve') || statusRaw === 'verified' || statusRaw === 'pass') {
        status = 'approved';
      } else if (statusRaw.includes('reject') || statusRaw === 'fail') {
        status = 'rejected';
      } else if (statusRaw.includes('progress') || statusRaw === 'review') {
        status = 'in_progress';
      }

      return {
        sessionId,
        status,
        decision: data.decision,
        verifiedAt: data.created_at || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('[Didit Decision API Error]:', err);
  }

  return { sessionId, status: 'pending' };
}
