import { useEffect, useState, type CSSProperties } from 'react';

export type SpotifyTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  url: string;
};

export type NowPlaying = {
  isPlaying: boolean;
  track: SpotifyTrack | null;
};

export type SpotifyClientOptions = {
  /** API key you created at spoweb.apcodesphere.xyz/dashboard */
  apiKey: string;
  /** Override the API host (defaults to https://spoweb.apcodesphere.xyz). */
  baseUrl?: string;
};

const DEFAULT_BASE_URL = "https://spoweb.apcodesphere.xyz";

/** Framework-agnostic client. Works in browsers, Node 18+, Next.js route handlers. */
export function createSpotifyClient({ apiKey, baseUrl = DEFAULT_BASE_URL }: SpotifyClientOptions) {
  if (!apiKey) throw new Error('spoweb: apiKey is required');
  const endpoint = `${baseUrl.replace(/\/$/, '')}/api/v1/now-playing`;

  return {
    async getNowPlaying(): Promise<NowPlaying> {
      const res = await fetch(endpoint, { headers: { 'x-api-key': apiKey } });
      if (res.status === 401) throw new Error('spoweb: invalid API key');
      if (!res.ok) throw new Error(`spoweb: request failed (${res.status})`);
      return (await res.json()) as NowPlaying;
    },
  };
}

export type SpotifyNowPlayingProps = SpotifyClientOptions & {
  /** Refresh interval in ms. Defaults to 30 seconds. */
  refreshMs?: number;
  /** Shown when nothing has been played. */
  emptyText?: string;
  className?: string;
  style?: CSSProperties;
};

/** React component: live now-playing card with Spotify's embedded player. */
export function SpotifyNowPlaying({
  apiKey,
  baseUrl,
  refreshMs = 30_000,
  emptyText = "I'm not listening to anything right now.",
  className,
  style,
}: SpotifyNowPlayingProps) {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    const client = createSpotifyClient({ apiKey, baseUrl });
    let cancelled = false;
    const load = () =>
      client
        .getNowPlaying()
        .then((d) => !cancelled && setData(d))
        .catch(() => {});
    load();
    const timer = setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [apiKey, baseUrl, refreshMs]);

  if (!data?.track) return <p className={className} style={style}>{emptyText}</p>;

  const { track, isPlaying } = data;
  return (
    <div className={className} style={style}>
      <p>{isPlaying ? 'Right now I am listening to' : 'Last I listened to'}</p>
      <iframe
        key={track.id}
        title={`Spotify player: ${track.title}`}
        src={`https://open.spotify.com/embed/track/${encodeURIComponent(track.id)}?utm_source=generator`}
        width="100%"
        height="152"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        style={{ border: 0, borderRadius: 12 }}
      />
      <p>
        {track.title} by {track.artist}
        {isPlaying && ' · Live'}
      </p>
    </div>
  );
}
