export default async function FundCampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Fund Campaign #{campaignId}</h1>
      <p className="text-kpugi-slate text-sm">Fund campaign budget via Paystack to set status live.</p>
    </div>
  );
}
