export default async function SubmissionDetailPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Submission Status #{submissionId}</h1>
      <p className="text-kpugi-slate text-sm">Live scraper check timeline, view count tracking, and payout status.</p>
    </div>
  );
}
