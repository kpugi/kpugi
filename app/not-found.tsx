import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-kpugi-paper text-center p-6">
      <h1 className="font-display font-bold text-5xl text-kpugi-ink mb-4">404</h1>
      <p className="text-kpugi-slate mb-8 max-w-md">The page or campaign you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn btn-primary font-semibold">
        Return to Home
      </Link>
    </div>
  );
}
