export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    token: process.env.ELEVENLABS,
  });
}
