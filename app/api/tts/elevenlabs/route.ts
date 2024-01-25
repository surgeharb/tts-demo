import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (request.headers.get('Authorization') !== `Basic ${process.env.BASIC_TTS_PASSWORD}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({
    token: process.env.ELEVENLABS,
  });
}
