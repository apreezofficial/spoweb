'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { NowPlaying } from '@/lib/spotify';

/** Live card in the landing hero, using the same sample data as /sample. */
export default function HeroNowPlaying() {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch('/api/sample', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d: NowPlaying) => !cancelled && setData(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const track = data?.track;
  return (
    <>
      <div className="now">
        {track?.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.albumArt} alt="" width={52} height={52} style={{ borderRadius: 8 }} />
        ) : (
          <div className="art" />
        )}
        <div style={{ minWidth: 0 }}>
          <div className="title">{track ? track.title : 'Loading…'}</div>
          <div className="sub">{track ? track.artist : ''}</div>
        </div>
        {data?.isPlaying && (
          <span className="live">
            <span className="dot" />Live
          </span>
        )}
      </div>
      <p className="hint" style={{ marginTop: 12 }}>
        {data?.isPlaying ? 'This is live from Spotify. ' : data?.track ? 'Last played. ' : ''}
        <Link href="/sample" style={{ color: 'var(--accent)' }}>See the full sample and queue →</Link>
      </p>
    </>
  );
}
