'use client';

import { useEffect, useState } from 'react';
import type { NowPlaying } from '@/lib/spotify';

/** Public sample: shows the owner's current or last-played track using the real widget data. */
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

  return (
    <div className="wrap">
      <nav>
        <a className="brand" href="/">spoweb</a>
      </nav>
      <section>
        <span className="eyebrow">Sample</span>
        {failed && <p>Could not load the sample right now.</p>}
        {!failed && !data && <p>Loading…</p>}
        {data?.track && (
          <>
            <h2>{data.isPlaying ? 'Precious is listening to' : 'Precious last listened to'}</h2>
            <div className="now">
              {data.track.albumArt && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.track.albumArt} alt="" width={52} height={52} style={{ borderRadius: 8 }} />
              )}
              <div>
                <div className="title">{data.track.title}</div>
                <div className="sub">{data.track.artist}</div>
              </div>
              {data.isPlaying && <span className="live">● Live</span>}
            </div>
            <iframe
              title={`Spotify player: ${data.track.title}`}
              src={`https://open.spotify.com/embed/track/${encodeURIComponent(data.track.id)}?utm_source=generator`}
              width="100%"
              height="152"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ border: 0, borderRadius: 12, marginTop: 16 }}
            />
          </>
        )}
        {data && !data.track && !failed && <p>Not listening to anything right now.</p>}
      </section>
    </div>
  );
}
