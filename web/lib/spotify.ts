export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  url: string;
};
export type NowPlaying = { isPlaying: boolean; track: Track | null };

type SpotifyTrack = {
  id: string;
  name: string;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
};

const TOKEN_URL = 'https://accounts.spotify.com/api/token';

function basicAuth(): string {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Spotify client env vars are not set');
  return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
}

async function tokenRequest(body: URLSearchParams): Promise<{ access_token: string; refresh_token?: string }> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Spotify token request failed: ${res.status}`);
  return res.json();
}

/** Turn a stored refresh token into a short-lived access token. */
export async function accessTokenFromRefresh(refreshToken: string): Promise<string> {
  const data = await tokenRequest(new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }));
  return data.access_token;
}

/** Exchange the one-time code from the OAuth redirect for tokens. */
export async function exchangeCode(code: string, redirectUri: string) {
  return tokenRequest(
    new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
  );
}

export async function fetchProfile(accessToken: string): Promise<{ id: string; display_name: string | null }> {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Spotify profile request failed: ${res.status}`);
  return res.json();
}

function shape(t: SpotifyTrack): Track {
  return {
    id: t.id,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    album: t.album.name,
    albumArt: t.album.images[1]?.url ?? t.album.images[0]?.url ?? null,
    url: t.external_urls.spotify,
  };
}

/** Now playing (or last played) for the account behind a refresh token. */
export async function nowPlayingForRefreshToken(refreshToken: string): Promise<NowPlaying> {
  const headers = { Authorization: `Bearer ${await accessTokenFromRefresh(refreshToken)}` };
  const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers, cache: 'no-store' });
  if (now.status === 200) {
    const data = (await now.json()) as { is_playing: boolean; item: SpotifyTrack | null };
    if (data.item && data.is_playing) return { isPlaying: true, track: shape(data.item) };
  }
  const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers,
    cache: 'no-store',
  });
  if (recent.ok) {
    const data = (await recent.json()) as { items: { track: SpotifyTrack }[] };
    if (data.items?.[0]) return { isPlaying: false, track: shape(data.items[0].track) };
  }
  return { isPlaying: false, track: null };
}

/** Owner's own account (used by the /sample page). */
export async function getNowPlaying(): Promise<NowPlaying> {
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!refresh) throw new Error('SPOTIFY_REFRESH_TOKEN is not set');
  return nowPlayingForRefreshToken(refresh);
}
