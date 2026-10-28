import crypto from 'crypto';

export interface VerifyBachsWebhookResult {
  isValid: boolean;
  error?: string;
  payload?: any;
}

/**
 * Validates incoming Bachs Webhook requests.
 * Uses HMAC-SHA256 signature verification with replay window protection.
 */
export function verifyBachsWebhookSignature({
  rawBody,
  signatureHeader,
  timestampHeader,
  secret,
}: {
  rawBody: string;
  signatureHeader: string | null;
  timestampHeader: string | null;
  secret?: string;
}): VerifyBachsWebhookResult {
  const webhookSecret = secret || process.env.BACHS_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return { isValid: false, error: 'BACHS_WEBHOOK_SECRET is not configured' };
  }

  if (!signatureHeader) {
    return { isValid: false, error: 'Missing Bachs signature header' };
  }

  let timestamp = timestampHeader || '';
  let expectedSignature = '';

  // Handle X-Bachs-Signature-V2 format: "t=1730114000,v1=abc..."
  if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (key === 't' && !timestamp) {
        timestamp = value;
      } else if (key === 'v1') {
        expectedSignature = value;
      }
    }
  } else {
    expectedSignature = signatureHeader.trim();
  }

  // If timestamp exists, enforce 5-minute (300 seconds) replay attack tolerance window
  if (timestamp) {
    const timestampSec = parseInt(timestamp, 10);
    const currentSec = Math.floor(Date.now() / 1000);
    if (!isNaN(timestampSec) && Math.abs(currentSec - timestampSec) > 300) {
      return { isValid: false, error: 'Webhook timestamp expired (replay attack protection)' };
    }
  }

  // Compute HMAC-SHA256
  // Bachs computes over `${timestamp}.${rawBody}` if timestamp header exists, else over rawBody
  const payloadToSign = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  const computedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadToSign)
    .digest('hex');

  const computedBuf = Buffer.from(computedHash, 'utf8');
  const expectedBuf = Buffer.from(expectedSignature, 'utf8');

  // Also check without timestamp prefix if first comparison fails (backward compatibility)
  let isMatch = false;
  if (computedBuf.length === expectedBuf.length && crypto.timingSafeEqual(computedBuf, expectedBuf)) {
    isMatch = true;
  } else {
    const fallbackHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    const fallbackBuf = Buffer.from(fallbackHash, 'utf8');
    if (fallbackBuf.length === expectedBuf.length && crypto.timingSafeEqual(fallbackBuf, expectedBuf)) {
      isMatch = true;
    }
  }

  if (!isMatch) {
    return { isValid: false, error: 'Invalid Bachs signature' };
  }

  try {
    const payload = JSON.parse(rawBody);
    return { isValid: true, payload };
  } catch (err: any) {
    return { isValid: false, error: 'Invalid JSON payload' };
  }
}

