import { NextResponse } from 'next/server';
import { DeepgramClient } from '@deepgram/sdk';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY || process.env.DEEPGRAM_SECRET;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key missing. Please add DEEPGRAM_API_KEY or DEEPGRAM_SECRET to .env.local.' },
        { status: 500 }
      );
    }

    const deepgram = new DeepgramClient({ apiKey });
    const audioBuffer = await req.arrayBuffer();

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'No audio recorded' }, { status: 400 });
    }

    const response = await deepgram.listen.v1.media.transcribeFile(
      Buffer.from(audioBuffer),
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
      }
    );

    const resObj = response as any;
    const transcript =
      resObj?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return NextResponse.json({ transcript });
  } catch (err: any) {
    console.error('[Deepgram STT] Server error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error during audio transcription' },
      { status: 500 }
    );
  }
}
