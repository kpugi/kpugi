import { paystackFetch } from './client';

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
