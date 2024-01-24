export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { voice_id, model_id, pronunciation_dictionary_locators, text, voice_settings } =
    request.body;

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model_id: '<string>',
      pronunciation_dictionary_locators: [
        { pronunciation_dictionary_id: '<string>', version_id: '<string>' },
      ],
      text: '<string>',
      voice_settings: {
        similarity_boost: 123,
        stability: 123,
        style: 123,
        use_speaker_boost: true,
      },
    }),
  };

  return Response.json({});
}
