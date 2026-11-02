import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Didit KYC has been deprecated in favor of native KpugiSync identity verification.',
      deprecated: true,
    },
    { status: 410 }
  );
}
