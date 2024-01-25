export async function GET() {
  const speechKey = process.env.SPEECH_KEY;
  const speechRegion = process.env.SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    return new Response('You forgot to add your speech key or region to the .env file.', {
      status: 401,
    });
  }

  try {
    const response = await fetch(
      `https://${speechRegion}.tts.speech.${
        speechRegion.startsWith('china') ? 'azure.cn' : 'microsoft.com'
      }/cognitiveservices/voices/list`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': speechKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error(err);
  }
}
