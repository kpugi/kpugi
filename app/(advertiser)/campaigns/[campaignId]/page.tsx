export default async function CampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Campaign Overview #{campaignId}</h1>
      <p className="text-kpugi-slate text-sm">Campaign details, submissions list, and budget breakdown.</p>
    </div>
  );
}
