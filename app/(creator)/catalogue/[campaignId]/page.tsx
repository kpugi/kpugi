export default async function CreatorCampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Campaign Detail #{campaignId}</h1>
      <p className="text-kpugi-slate text-sm">Creative preview, CPM rate, advisory requirements, and budget progress bar.</p>
    </div>
  );
}
