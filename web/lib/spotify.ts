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

async function accessToken(): Promise<string> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) throw new Error('Spotify env vars are not set');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Current track if playing, otherwise the last played track. */
export async function getNowPlaying(): Promise<NowPlaying> {
  const headers = { Authorization: `Bearer ${await accessToken()}` };
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
