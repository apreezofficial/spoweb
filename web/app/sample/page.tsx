'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { NowPlaying } from '@/lib/spotify';

/** Public sample: the owner's current or last-played track, using the same data the widget gets. */
export default function Sample() {
  const [data, setData] = useState<NowPlaying | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch('/api/sample', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d: NowPlaying) => !cancelled && setData(d))
        .catch(() => !cancelled && setFailed(true));
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const track = data?.track;

  return (
    <div className="page">
      <header className="top">
        <nav>
          <Link className="brand" href="/">spoweb</Link>
          <div className="links">
            <Link href="/dashboard">Get a key</Link>
          </div>
        </nav>
      </header>

      <main className="page-main">
        <span className="eyebrow">Live sample</span>
        {failed && <p>Could not load the sample right now. Try again in a moment.</p>}
        {!failed && !data && <p>Loading…</p>}

        {data && !track && !failed && (
          <>
            <h1 className="sample-title">Not listening to anything right now.</h1>
            <p>Check back soon. The widget updates every 30 seconds.</p>
          </>
        )}

        {track && (
          <>
            <h1 className="sample-title">
              {data.isPlaying ? 'Precious is listening to' : 'Precious last listened to'}
            </h1>

            <div className="track">
              {track.albumArt ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.albumArt} alt="" />
              ) : (
                <div className="art-fallback" />
              )}
              <div style={{ minWidth: 0 }}>
                <div className="name">{track.title}</div>
                <div className="artist">{track.artist}</div>
              </div>
              {data.isPlaying && (
                <span className="live" style={{ marginLeft: 'auto' }}>
                  <span className="dot" />Live
                </span>
              )}
            </div>

            <div className="embed">
              <iframe
                title={`Spotify player: ${track.title}`}
                src={`https://open.spotify.com/embed/track/${encodeURIComponent(track.id)}?utm_source=generator`}
                width="100%"
                height="152"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                style={{ border: 0, borderRadius: 12 }}
              />
            </div>

            <p className="hint" style={{ marginTop: 28 }}>
              Want this on your own site? <Link href="/dashboard" style={{ color: 'var(--accent)' }}>Create an API key</Link>.
            </p>
          </>
        )}
      </main>

      <footer className="site-foot">
        <span>spoweb</span>
        <span>Built by <a href="https://preciousadeodokun.com.ng">preciousadeodokun.com.ng</a></span>
      </footer>
    </div>
  );
}
