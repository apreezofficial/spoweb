import { query } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/crypto';

export const SPOTIFY_SCOPES = 'user-read-currently-playing user-read-recently-played user-read-playback-state';

/** Where Spotify sends the user back. Set SPOTIFY_REDIRECT_URI to the exact URI registered in the Spotify app. */
export function redirectUri(req: Request): string {
  return process.env.SPOTIFY_REDIRECT_URI || `${new URL(req.url).origin}/api/spotify/callback`;
}

export async function saveSpotifyAccount(userId: number, spotifyUserId: string, displayName: string, refreshToken: string) {
  await query(
    `INSERT INTO spotify_accounts (user_id, spotify_user_id, display_name, refresh_token_enc)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       spotify_user_id = EXCLUDED.spotify_user_id,
       display_name = EXCLUDED.display_name,
       refresh_token_enc = EXCLUDED.refresh_token_enc,
       connected_at = now()`,
    [userId, spotifyUserId, displayName, encrypt(refreshToken)],
  );
}

/** The decrypted refresh token for a user, or null if they haven't connected Spotify. */
export async function refreshTokenForUser(userId: number): Promise<string | null> {
  const { rows } = await query<{ refresh_token_enc: string }>(
    'SELECT refresh_token_enc FROM spotify_accounts WHERE user_id = $1',
    [userId],
  );
  return rows[0] ? decrypt(rows[0].refresh_token_enc) : null;
}

export async function spotifyStatus(userId: number) {
  const { rows } = await query<{ display_name: string; connected_at: Date }>(
    'SELECT display_name, connected_at FROM spotify_accounts WHERE user_id = $1',
    [userId],
  );
  return rows[0] ? { connected: true, displayName: rows[0].display_name, connectedAt: rows[0].connected_at } : { connected: false };
}
