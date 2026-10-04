import { paystackFetch } from './client';

/**
 * Generate a branded payout reference in the format: KPG-XXXXX
 * Example: KPG-KPUG1, KPG-A8Z29
 * Complies with Paystack's strict regex validation (only alphanumeric, '-' and '_')
 */
export function generateKpugiPayoutReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KPG-${code}`;
}

/**
 * Create a Transfer Recipient on Paystack
 */
export async function createPaystackRecipient({
  name,
  accountNumber,
  bankCode,
}: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<{ success: boolean; recipientCode?: string; error?: string }> {
  try {
    const res = await paystackFetch('/transferrecipient', {
      method: 'POST',
      body: JSON.stringify({
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      }),
    });

    if (res.status && res.data?.recipient_code) {
      return { success: true, recipientCode: res.data.recipient_code };
    }
    return { success: false, error: res.message || 'Failed to create Paystack transfer recipient.' };
  } catch (err: any) {
    console.error('[createPaystackRecipient Error]:', err);
    return { success: false, error: err.message || 'Failed to create transfer recipient.' };
  }
}

/**
 * Initiate a Live Transfer via Paystack
 */
export async function initiatePaystackTransfer({
  recipientCode,
  amountInKobo,
  reference,
  reason,
}: {
  recipientCode: string;
  amountInKobo: number;
  reference: string;
  reason: string;
}): Promise<{ success: boolean; transferCode?: string; reference?: string; status?: string; error?: string; requiresOtp?: boolean }> {
  try {
    // Sanitize reference to ensure only letters, numbers, hyphens, and underscores are sent to Paystack
    const sanitizedRef = reference.replace(/[^a-zA-Z0-9-_]/g, '-');

    const res = await paystackFetch('/transfer', {
      method: 'POST',
      body: JSON.stringify({
        source: 'balance',
        amount: amountInKobo,
        recipient: recipientCode,
        reference: sanitizedRef,
        reason,
      }),
    });

    if (res.status && res.data) {
      const requiresOtp = res.data.status === 'otp' || (typeof res.message === 'string' && res.message.toLowerCase().includes('otp'));
      return {
        success: true,
        transferCode: res.data.transfer_code,
        reference: res.data.reference || reference,
        status: res.data.status || 'pending',
        requiresOtp,
      };
    }
    return { success: false, error: res.message || 'Paystack transfer initiation failed.' };
  } catch (err: any) {
    console.error('[initiatePaystackTransfer Error]:', err);
    return { success: false, error: err.message || 'Failed to initiate transfer with Paystack.' };
  }
}

/**
 * Finalize a Transfer with OTP (if merchant account has OTP validation enabled)
 */
export async function finalizePaystackTransfer({
  transferCode,
  otp,
}: {
  transferCode: string;
  otp: string;
}): Promise<{ success: boolean; status?: string; message?: string; error?: string }> {
  try {
    const res = await paystackFetch('/transfer/finalize_transfer', {
      method: 'POST',
      body: JSON.stringify({
        transfer_code: transferCode,
        otp: otp.trim(),
      }),
    });

    if (res.status && res.data) {
      return {
        success: true,
        status: res.data.status || 'success',
        message: res.message || 'Transfer finalized successfully.',
      };
    }
    return { success: false, error: res.message || 'OTP verification failed.' };
  } catch (err: any) {
    console.error('[finalizePaystackTransfer Error]:', err);
    return { success: false, error: err.message || 'Failed to finalize transfer with OTP.' };
  }
}

export interface BulkTransferItem {
  amountInKobo: number;
  recipientCode: string;
  reference: string;
  reason?: string;
}

/**
 * Initiate Bulk Transfers via Paystack
 * Paystack supports up to 100 transfers per batch call.
 */
export async function initiatePaystackBulkTransfer({
  transfers,
}: {
  transfers: BulkTransferItem[];
}): Promise<{
  success: boolean;
  transfers?: Array<{
    reference: string;
    recipient: string;
    amount: number;
    transfer_code: string;
    status: string;
  }>;
  error?: string;
  message?: string;
}> {
  try {
    const formattedTransfers = transfers.map((t) => ({
      amount: t.amountInKobo,
      recipient: t.recipientCode,
      reference: t.reference.replace(/[^a-zA-Z0-9-_]/g, '-'),
      reason: t.reason || `Kpugi Creator Payout Batch - ${t.reference}`,
    }));

    const res = await paystackFetch('/transfer/bulk', {
      method: 'POST',
      body: JSON.stringify({
        currency: 'NGN',
        source: 'balance',
        transfers: formattedTransfers,
      }),
    });

    if (res.status && Array.isArray(res.data)) {
      return {
        success: true,
        transfers: res.data,
        message: res.message || 'Bulk transfer successfully submitted to Paystack.',
      };
    }
    return { success: false, error: res.message || 'Failed to initiate bulk transfer.' };
  } catch (err: any) {
    console.error('[initiatePaystackBulkTransfer Error]:', err);
    return { success: false, error: err.message || 'Network error during bulk transfer.' };
  }
}

export async function initiateCreatorTransfer({
  recipientCode,
  amountInKobo,
  submissionId,
}: {
  recipientCode: string;
  amountInKobo: number;
  submissionId: string;
}) {
  return paystackFetch('/transfer', {
    method: 'POST',
    body: JSON.stringify({
      source: 'balance',
      amount: amountInKobo,
      recipient: recipientCode,
      reason: `Kpugi Payout for Submission #${submissionId}`,
    }),
  });
}

