import { NextResponse } from 'next/server';
import { hashKey } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail } from '@/lib/http';
import { nowPlayingForRefreshToken } from '@/lib/spotify';
import { refreshTokenForUser } from '@/lib/spotify-account';

// Public widget API. Requires a key from the dashboard in the x-api-key header.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-api-key, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const key = req.headers.get('x-api-key') ?? '';
  if (!key) return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401, headers: CORS });

  const { rows } = await query<{ user_id: number }>(
    'SELECT user_id FROM api_keys WHERE key_hash = $1 AND revoked_at IS NULL',
    [hashKey(key)],
  );
  if (!rows[0]) return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401, headers: CORS });

  // Each key belongs to a developer, and the widget shows that developer's own Spotify.
  const refreshToken = await refreshTokenForUser(rows[0].user_id);
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Connect a Spotify account in your spoweb dashboard first' },
      { status: 409, headers: CORS },
    );
  }

  try {
    return NextResponse.json(await nowPlayingForRefreshToken(refreshToken), {
      headers: { ...CORS, 'Cache-Control': 'public, max-age=0, s-maxage=20' },
    });
  } catch {
    return fail('Spotify is unavailable', 502);
  }
}
