import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth';
import { exchangeCode, fetchProfile } from '@/lib/spotify';
import { redirectUri, saveSpotifyAccount } from '@/lib/spotify-account';

/** Spotify redirects here after the user approves. We store their refresh token, encrypted. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const back = (result: string) => NextResponse.redirect(new URL(`/dashboard?spotify=${result}`, req.url));

  const userId = await currentUserId();
  if (!userId) return back('login_required');

  const jar = await cookies();
  const expected = jar.get('spw_spotify_state')?.value;
  jar.delete('spw_spotify_state');
  const state = url.searchParams.get('state');
  if (!expected || !state || state !== expected) return back('bad_state');
  if (url.searchParams.get('error')) return back('denied');

  const code = url.searchParams.get('code');
  if (!code) return back('missing_code');

  try {
    const tokens = await exchangeCode(code, redirectUri(req));
    if (!tokens.refresh_token) return back('no_refresh_token');
    const profile = await fetchProfile(tokens.access_token);
    await saveSpotifyAccount(userId, profile.id, profile.display_name || profile.id, tokens.refresh_token);
    return back('connected');
  } catch (e) {
    // Show the step that failed (no secrets) so the cause is visible on the dashboard.
    const reason = encodeURIComponent(((e as Error).message || 'unknown').slice(0, 120));
    return NextResponse.redirect(new URL(`/dashboard?spotify=failed&reason=${reason}`, req.url));
  }
}
