import { ImageResponse } from 'next/og';
import { connection } from 'next/server';
import { getNowPlaying } from '@/lib/spotify';

export const alt = 'spoweb: show what you are listening to on your site';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social preview: what spoweb does, plus the track the owner is listening to right now. */
export default async function OpengraphImage() {
  await connection(); // fetch live, never prerender a stale track
  let track: Awaited<ReturnType<typeof getNowPlaying>>['track'] = null;
  let isPlaying = false;
  try {
    const now = await getNowPlaying();
    track = now.track;
    isPlaying = now.isPlaying;
  } catch {
    // Fall back to the generic card below.
  }

  const pill = {
    display: 'flex',
    padding: '12px 22px',
    borderRadius: 999,
    background: '#18181b',
    color: '#e4e4e7',
  } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(135deg, #0b0d10 0%, #0f1f16 100%)',
          color: '#f5f5f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 34, color: '#1db954', fontWeight: 700 }}>spoweb</div>
          {isPlaying && (
            <div style={{ display: 'flex', fontSize: 24, color: '#1db954' }}>● Live now</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', fontSize: 30, color: '#a1a1aa' }}>
              {track ? (isPlaying ? 'Listening to' : 'Last listened to') : 'Live Spotify on your website'}
            </div>
            <div style={{ display: 'flex', marginTop: 8, fontSize: track ? 64 : 60, fontWeight: 700, lineHeight: 1.1 }}>
              {track ? track.title : 'Show what you are listening to.'}
            </div>
            <div style={{ display: 'flex', marginTop: 16, fontSize: 32, color: '#a1a1aa' }}>
              {track ? track.artist : 'One API key, one component, no OAuth on your side.'}
            </div>
          </div>
          {track?.albumArt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumArt}
              width={260}
              height={260}
              style={{ borderRadius: 24, border: '1px solid #27272a' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 24 }}>
          <div style={pill}>Live every 30s</div>
          <div style={pill}>Up next queue</div>
          <div style={pill}>npm install github:apreezofficial/spoweb</div>
        </div>
      </div>
    ),
    size,
  );
}
