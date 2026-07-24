import { paystackFetch } from './client';

export async function initializeCampaignFunding({
  email,
  amountInKobo,
  campaignId,
}: {
  email: string;
  amountInKobo: number;
  campaignId: string;
}) {
  return paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email,
      amount: amountInKobo,
      metadata: { campaignId },
    }),
  });
}
