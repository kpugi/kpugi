import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    console.log('Meta Data Deletion Request Received:', body);

    const confirmationCode = `DEL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const statusUrl = `https://kpugi.com/delete?code=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process deletion request' }, { status: 400 });
  }
}
