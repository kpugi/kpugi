export default async function EditCampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Edit Campaign #{campaignId}</h1>
      <p className="text-kpugi-slate text-sm">Update campaign details and advisory requirements.</p>
    </div>
  );
}
