import { NextResponse, connection } from 'next/server';
import { richNowPlaying } from '@/lib/spotify';

/**
 * Public sample for the /sample page: the owner's current or last-played track plus the queue.
 * Needs no API key. Spotify secrets stay on the server.
 */
export async function GET() {
  await connection(); // always fetch live data, never prerender
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!refresh) return NextResponse.json({ isPlaying: false, track: null, queue: [], error: 'Not configured' }, { status: 502 });
  try {
    return NextResponse.json(await richNowPlaying(refresh), {
      headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json({ isPlaying: false, track: null, queue: [], error: 'Spotify is unavailable' }, { status: 502 });
  }
}
