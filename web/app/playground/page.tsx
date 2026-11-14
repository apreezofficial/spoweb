'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { NowPlaying, Track } from '@/lib/spotify';

type Result = { status: number; body: unknown } | null;
type Status = { loggedIn: boolean; connected: boolean; displayName?: string };

const SNIPPET_REACT = `import { SpotifyNowPlaying } from 'spoweb';

export default function Page() {
  return <SpotifyNowPlaying apiKey="YOUR_API_KEY" />;
}`;
const SNIPPET_JS = `import { createSpotifyClient } from 'spoweb';

const spotify = createSpotifyClient({ apiKey: 'YOUR_API_KEY' });
const { isPlaying, track } = await spotify.getNowPlaying();
console.log(track?.title, track?.artist, isPlaying);`;
const SNIPPET_CURL = `curl -H "x-api-key: YOUR_API_KEY" https://spoweb.apcodesphere.xyz/api/v1/now-playing`;

function TrackRow({ track, live }: { track: Track; live: boolean }) {
  return (
    <div className="track" style={{ marginTop: 14 }}>
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
      <span className="live" style={{ marginLeft: 'auto' }}>
        {live ? (<><span className="dot" />Live</>) : 'Last played'}
      </span>
    </div>
  );
}

/** Step by step: connect Spotify, preview your music, then try an API key. */
export default function Playground() {
  const [status, setStatus] = useState<Status | null>(null);
  const [preview, setPreview] = useState<NowPlaying | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [tab, setTab] = useState<'react' | 'js' | 'curl'>('react');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const keysRes = await fetch('/api/keys', { credentials: 'same-origin' });
      const st = await fetch('/api/spotify/status', { credentials: 'same-origin' });
      const spotify = st.ok ? await st.json() : { connected: false };
      const loggedIn = keysRes.status !== 401;
      setStatus({ loggedIn, connected: Boolean(spotify.connected), displayName: spotify.displayName });
      if (loggedIn && spotify.connected) {
        const p = await fetch('/api/me/now-playing', { credentials: 'same-origin' });
        if (p.ok) setPreview(await p.json());
      }
    })();
  }, []);

  async function tryKey(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/v1/now-playing', { headers: { 'x-api-key': apiKey.trim() } });
      const body = await res.json().catch(() => ({ error: 'Invalid response from server' }));
      setResult({ status: res.status, body });
    } catch {
      setResult({ status: 0, body: { error: 'Network error. Try again.' } });
    } finally {
      setBusy(false);
    }
  }

  const snippet = tab === 'react' ? SNIPPET_REACT : tab === 'js' ? SNIPPET_JS : SNIPPET_CURL;
  const keyTrack = (result?.body as { track?: Track | null })?.track ?? null;
  const keyPlaying = Boolean((result?.body as { isPlaying?: boolean })?.isPlaying);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; the code is still visible */
    }
  }

  const step1Done = status?.connected;

  return (
    <div className="page">
      <header className="top">
        <nav>
          <Link className="brand" href="/">spoweb</Link>
          <div className="links">
            <Link href="/sample">Sample</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </nav>
      </header>

      <main className="page-main" style={{ maxWidth: 680 }}>
        <span className="eyebrow">Playground</span>
        <h1 className="sample-title">Try it out</h1>

        {/* Step 1: account and Spotify */}
        <div className="card">
          <div className="row-between">
            <h2>1. Connect Spotify</h2>
            <span className={`status ${step1Done ? 'active' : ''}`}>{step1Done ? 'Connected' : 'Not yet'}</span>
          </div>
          {!status && <p className="hint">Checking your account…</p>}
          {status && !status.loggedIn && (
            <>
              <p className="lead" style={{ marginTop: 8 }}>
                Create a free account or log in first. Then connect the Spotify account you want to show.
              </p>
              <Link className="btn" href="/dashboard">Log in or create account</Link>
            </>
          )}
          {status?.loggedIn && !status.connected && (
            <>
              <p className="lead" style={{ marginTop: 8 }}>
                Connect Spotify so your widget can show what you are listening to.
              </p>
              <a className="btn" href="/api/spotify/connect">Connect Spotify</a>
            </>
          )}
          {status?.loggedIn && status.connected && (
            <>
              <p className="hint" style={{ marginTop: 8 }}>
                Connected as <strong>{status.displayName}</strong>. Here is what your widget will show:
              </p>
              {preview?.track ? (
                <>
                  <TrackRow track={preview.track} live={preview.isPlaying} />
                  {preview.queue && preview.queue.length > 0 && (
                    <p className="hint">Up next: {preview.queue.slice(0, 3).map((t) => t.title).join(', ')}</p>
                  )}
                </>
              ) : (
                <p className="hint">Nothing played on this account yet. Play a song on Spotify and refresh.</p>
              )}
            </>
          )}
        </div>

        {/* Step 2: API key */}
        <div className="card">
          <h2>2. Try your API key</h2>
          <p className="lead" style={{ marginTop: 6 }}>
            {status?.loggedIn ? (
              <>Need a key? <Link href="/dashboard" style={{ color: 'var(--accent)' }}>Create one on your dashboard</Link>.</>
            ) : (
              'Log in to create a key. Paste it here to see the live response.'
            )}{' '}
            The key is only sent to make this request. It isn&apos;t saved.
          </p>
          <form className="row-actions" onSubmit={tryKey}>
            <input
              className="input"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="spw_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ flex: 1, minWidth: 200, fontFamily: 'ui-monospace, Menlo, monospace' }}
            />
            <button className="btn" disabled={busy || !apiKey.trim()}>{busy ? 'Checking…' : 'Try it'}</button>
          </form>

          {result && (
            <div style={{ marginTop: 18 }}>
              <div className="row-between">
                <strong>{result.status === 200 ? 'Working' : `Error ${result.status || ''}`}</strong>
                <span className={`status ${result.status === 200 ? 'active' : ''}`}>HTTP {result.status || 'network'}</span>
              </div>
              {result.status === 200 && keyTrack && <TrackRow track={keyTrack} live={keyPlaying} />}
              <pre style={{ marginTop: 14, borderRadius: 12, fontSize: 13, maxHeight: 260, overflow: 'auto' }}>
                <code>{JSON.stringify(result.body, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Step 3: code */}
        <div className="card">
          <div className="row-between">
            <h2>3. Use it on your site</h2>
            <button className="btn small ghost" onClick={copySnippet}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
          <div className="tabs" style={{ marginTop: 14 }}>
            {(['react', 'js', 'curl'] as const).map((t) => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ cursor: 'pointer' }}>
                {t === 'react' ? 'React' : t === 'js' ? 'JavaScript' : 'curl'}
              </button>
            ))}
          </div>
          <pre style={{ marginTop: 0 }}><code>{snippet}</code></pre>
          <p className="hint">Replace YOUR_API_KEY with your key. Browser code exposes the key to visitors, so keep the key read-only.</p>
        </div>
      </main>

      <footer className="site-foot">
        <span>spoweb</span>
        <span>Built by <a href="https://preciousadedokun.com.ng">preciousadedokun.com.ng</a></span>
      </footer>
    </div>
  );
}
