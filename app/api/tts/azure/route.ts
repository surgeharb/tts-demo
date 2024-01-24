export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const speechKey = process.env.SPEECH_KEY;
  const speechRegion = process.env.SPEECH_REGION;

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
      ).then((response) => response.json());
      return Response.json({ token: tokenResponse.data, region: speechRegion });
    } catch (err) {
      return new Response('There was an error authorizing your speech key.', {
        status: 401,
      });
    }
  }
}
