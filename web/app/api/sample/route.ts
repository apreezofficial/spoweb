import { NextResponse, connection } from 'next/server';
import { getNowPlaying } from '@/lib/spotify';


/**
 * Public sample for the /sample page: the site owner's current or last-played track.
 * Needs no API key. Spotify secrets stay on the server.
 */
export async function GET() {
  await connection(); // always fetch live data, never prerender
  try {
    return NextResponse.json(await getNowPlaying(), {
      headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json({ isPlaying: false, track: null, error: 'Spotify is unavailable' }, { status: 502 });
  }
}
