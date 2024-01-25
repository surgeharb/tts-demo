import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const speechKey = process.env.SPEECH_KEY;
  const speechRegion = process.env.SPEECH_REGION;

  if (request.headers.get('Authorization') !== `Basic ${process.env.BASIC_TTS_PASSWORD}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!speechKey || !speechRegion) {
    return new Response('You forgot to add your speech key or region to the .env file.', {
      status: 401,
    });
  } else {
    try {
      const tokenResponse = await fetch(
        `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': speechKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      ).then((response) => response.text());
      return Response.json({ token: tokenResponse, region: speechRegion });
    } catch (err) {
      return new Response('There was an error authorizing your speech key.', {
        status: 401,
      });
    }
  }
}
