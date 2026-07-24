import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ submissions: [] });
}

export async function POST() {
  return NextResponse.json({ success: true });
}
