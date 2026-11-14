import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth';
import { fail } from '@/lib/http';
import { spotifyStatus } from '@/lib/spotify-account';

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  return NextResponse.json(await spotifyStatus(userId));
}
