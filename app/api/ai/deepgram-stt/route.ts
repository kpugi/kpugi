import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const deepgramKey = process.env.DEEPGRAM_SECRET;

    if (!deepgramKey) {
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || 'audio/webm';
    const audioBuffer = await req.arrayBuffer();

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'No audio data received' }, { status: 400 });
    }

    const response = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${deepgramKey}`,
          'Content-Type': contentType,
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Deepgram STT] Deepgram API error:', errText);
      return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: response.status });
    }

    const data = await response.json();
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return NextResponse.json({ transcript });
  } catch (err) {
    console.error('[Deepgram STT] Server error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
