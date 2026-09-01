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
}): Promise<{ success: boolean; transferCode?: string; reference?: string; status?: string; error?: string }> {
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
      return {
        success: true,
        transferCode: res.data.transfer_code,
        reference: res.data.reference || reference,
        status: res.data.status || 'pending',
      };
    }
    return { success: false, error: res.message || 'Paystack transfer initiation failed.' };
  } catch (err: any) {
    console.error('[initiatePaystackTransfer Error]:', err);
    return { success: false, error: err.message || 'Failed to initiate transfer with Paystack.' };
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
