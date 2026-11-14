import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail } from '@/lib/http';
import { SPOTIFY_SCOPES, redirectUri } from '@/lib/spotify-account';

/** Starts "Connect Spotify": sends the logged-in user to Spotify to approve access. */
export async function GET(req: Request) {
  if (!(await currentUserId())) return NextResponse.redirect(new URL('/dashboard', req.url));

  const state = randomBytes(16).toString('base64url');
  (await cookies()).set('spw_spotify_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/spotify',
    maxAge: 600,
  });

  const url = new URL('https://accounts.spotify.com/authorize');
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID ?? '',
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri(req),
    state,
  }).toString();
  return NextResponse.redirect(url);
}

/** Disconnects the user's Spotify account. */
export async function DELETE() {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  await query('DELETE FROM spotify_accounts WHERE user_id = $1', [userId]);
  return NextResponse.json({ ok: true });
}
