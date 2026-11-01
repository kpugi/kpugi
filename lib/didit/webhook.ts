import crypto from 'crypto';

export interface VerifyDiditWebhookParams {
  rawBody: string;
  headers: Headers;
  secret?: string;
}

export interface VerifyDiditWebhookResult {
  isValid: boolean;
  error?: string;
  payload?: any;
  verificationMethod?: 'x-signature-v2' | 'x-signature' | 'x-signature-simple' | 'bearer';
}

/**
 * Recursively sort all object keys alphabetically and truncate whole-number floats to integers.
 * Complies with Didit's X-Signature-V2 canonical JSON specification.
 */
export function canonicalizeDiditPayload(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'number' && Number.isFinite(obj) && Math.floor(obj) === obj) {
      return Math.floor(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(canonicalizeDiditPayload);
  }

  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = canonicalizeDiditPayload(obj[key]);
  }
  return sortedObj;
}

/**
 * Perform a constant-time comparison of two hexadecimal signature strings to prevent timing attacks.
 */
export function timingSafeEqualHex(signatureHex: string, expectedHex: string): boolean {
  try {
    const cleanSig = signatureHex.trim().replace(/^sha256=/, '');
    const cleanExpected = expectedHex.trim().replace(/^sha256=/, '');
    const bufA = Buffer.from(cleanSig, 'hex');
    const bufB = Buffer.from(cleanExpected, 'hex');

    if (bufA.length === 0 || bufA.length !== bufB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Extracts all warning strings from Didit decision nodes.
 */
export function extractDecisionWarnings(decision: any): string[] {
  if (!decision || typeof decision !== 'object') return [];
  const warnings: string[] = [];

  const featureArrays = [
    decision.id_verifications,
    decision.nfc_verifications,
    decision.liveness_checks,
    decision.face_matches,
    decision.aml_screenings,
    decision.poa_verifications,
    decision.phone_verifications,
    decision.email_verifications,
    decision.ip_analyses,
    decision.database_validations,
    decision.reviews,
  ];

  for (const arr of featureArrays) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (item?.warnings && Array.isArray(item.warnings)) {
          warnings.push(
            ...item.warnings.map((w: any) => (typeof w === 'string' ? w : JSON.stringify(w)))
          );
        } else if (item?.warning) {
          warnings.push(String(item.warning));
        }
      }
    }
  }

  if (decision.warnings && Array.isArray(decision.warnings)) {
    warnings.push(
      ...decision.warnings.map((w: any) => (typeof w === 'string' ? w : JSON.stringify(w)))
    );
  }

  return warnings;
}

/**
 * Validates incoming Didit Webhook requests.
 *
 * 1. Checks X-Signature-V2 (canonical JSON), X-Signature (raw bytes), or X-Signature-Simple
 * 2. Uses constant-time comparison
 * 3. Validates the SIGNED payload body `timestamp` field is fresh (within 300 seconds)
 *    (never the unsigned X-Timestamp header)
 */
export function verifyDiditWebhookSignature({
  rawBody,
  headers,
  secret,
}: VerifyDiditWebhookParams): VerifyDiditWebhookResult {
  const webhookSecret =
    secret ||
    process.env.DIDIT_WEBHOOK_SECRET ||
    process.env.DIDIT_CLIENT_SECRET;

  if (!webhookSecret) {
    return {
      isValid: false,
      error: 'DIDIT_WEBHOOK_SECRET is not configured on the server',
    };
  }

  // Pre-parse payload to obtain signed fields (required for canonicalization, simple signature, & signed timestamp)
  let parsedBody: any;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch (err: any) {
    return {
      isValid: false,
      error: `Invalid JSON payload: ${err.message}`,
    };
  }

  // Header candidates
  const sigV2 = headers.get('x-signature-v2') || headers.get('x-signature-v2-previous');
  const sigRaw = headers.get('x-signature') || headers.get('x-signature-previous') || headers.get('x-didit-signature');
  const sigSimple = headers.get('x-signature-simple');
  const authHeader = headers.get('authorization');

  let isValidSignature = false;
  let matchedMethod: 'x-signature-v2' | 'x-signature' | 'x-signature-simple' | 'bearer' | undefined;

  // 1. Primary: X-Signature-V2 (Canonical JSON HMAC-SHA256)
  if (sigV2) {
    const canonicalPayload = canonicalizeDiditPayload(parsedBody);
    const canonicalJsonString = JSON.stringify(canonicalPayload);
    const computedV2 = crypto
      .createHmac('sha256', webhookSecret)
      .update(canonicalJsonString, 'utf8')
      .digest('hex');

    if (timingSafeEqualHex(sigV2, computedV2)) {
      isValidSignature = true;
      matchedMethod = 'x-signature-v2';
    }
  }

  // 2. Fallback: X-Signature (Raw bytes HMAC-SHA256)
  if (!isValidSignature && sigRaw) {
    const computedRawHex = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody, 'utf8')
      .digest('hex');

    if (timingSafeEqualHex(sigRaw, computedRawHex)) {
      isValidSignature = true;
      matchedMethod = 'x-signature';
    }
  }

  // 3. Fallback: X-Signature-Simple ("{timestamp}:{session_id}:{status}:{webhook_type}")
  if (!isValidSignature && sigSimple) {
    const simpleString = `${parsedBody.timestamp}:${parsedBody.session_id}:${parsedBody.status}:${parsedBody.webhook_type}`;
    const computedSimpleHex = crypto
      .createHmac('sha256', webhookSecret)
      .update(simpleString, 'utf8')
      .digest('hex');

    if (timingSafeEqualHex(sigSimple, computedSimpleHex)) {
      isValidSignature = true;
      matchedMethod = 'x-signature-simple';
    }
  }

  // 4. Fallback: Bearer Authorization token (Sandbox testing)
  if (!isValidSignature && authHeader && authHeader === `Bearer ${webhookSecret}`) {
    isValidSignature = true;
    matchedMethod = 'bearer';
  }

  if (!isValidSignature) {
    return {
      isValid: false,
      error: 'Invalid or missing Didit webhook signature',
    };
  }

  // 5. Freshness check: Validate signed body `timestamp` (or `created_at`) is within 300 seconds
  //    NEVER the unsigned X-Timestamp header!
  const signedTimestamp = Number(parsedBody.timestamp ?? parsedBody.created_at);

  if (signedTimestamp && !isNaN(signedTimestamp)) {
    // If timestamp is in milliseconds, convert to seconds
    const timestampSec = signedTimestamp > 9999999999 ? Math.floor(signedTimestamp / 1000) : signedTimestamp;
    const nowSec = Math.floor(Date.now() / 1000);

    if (Math.abs(nowSec - timestampSec) > 300) {
      return {
        isValid: false,
        error: `Signed timestamp outside freshness window (drift: ${Math.abs(nowSec - timestampSec)}s > 300s). Replay rejected.`,
      };
    }
  }

  return {
    isValid: true,
    payload: parsedBody,
    verificationMethod: matchedMethod,
  };
}
