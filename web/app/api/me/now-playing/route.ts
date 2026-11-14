import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth';
import { fail } from '@/lib/http';
import { richNowPlaying } from '@/lib/spotify';
import { refreshTokenForUser } from '@/lib/spotify-account';

/** The logged-in developer's own now-playing and queue, for previewing before they make a key. */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  const refresh = await refreshTokenForUser(userId);
  if (!refresh) return fail('Connect Spotify first', 409);
  try {
    return NextResponse.json(await richNowPlaying(refresh));
  } catch {
    return fail('Spotify is unavailable', 502);
  }
}
