export async function GET() {
  const speechKey = process.env.ELEVENLABS;

  if (!speechKey) {
    return new Response('You forgot to add your speech key to the .env file.', {
      status: 401,
    });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': speechKey,
      },
    });

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
