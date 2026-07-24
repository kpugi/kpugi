export default async function SubmitPostPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Clock In to Campaign #{campaignId}</h1>
      <p className="text-kpugi-slate text-sm">Submit your live post link and screenshot to reserve your payout slot.</p>
    </div>
  );
}
