import { ImageResponse } from 'next/og';

export const alt = 'spoweb: show what you are listening to on your site';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social preview image: what spoweb does, in one card. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0b0d10',
          color: '#f5f5f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, color: '#1db954', fontWeight: 700 }}>spoweb</div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
            Show what you&apos;re listening to.
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 30, color: '#a1a1aa' }}>
            A live Spotify now-playing card and queue for any website. One API key, no OAuth on your side.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 26 }}>
          <div style={{ display: 'flex', padding: '12px 22px', borderRadius: 999, background: '#18181b' }}>Live every 30s</div>
          <div style={{ display: 'flex', padding: '12px 22px', borderRadius: 999, background: '#18181b' }}>Up next queue</div>
          <div style={{ display: 'flex', padding: '12px 22px', borderRadius: 999, background: '#18181b' }}>npm install github:apreezofficial/spoweb</div>
        </div>
      </div>
    ),
    size,
  );
}
