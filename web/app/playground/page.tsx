'use client';

import Link from 'next/link';
import { useState } from 'react';

type Result = { status: number; body: unknown } | null;
type Track = { title: string; artist: string; albumArt: string | null; id: string; url: string };

const SNIPPET_REACT = `import { SpotifyNowPlaying } from 'spoweb';

export default function Page() {
  return <SpotifyNowPlaying apiKey="YOUR_API_KEY" />;
}`;

const SNIPPET_JS = `import { createSpotifyClient } from 'spoweb';

const spotify = createSpotifyClient({ apiKey: 'YOUR_API_KEY' });
const { isPlaying, track } = await spotify.getNowPlaying();
console.log(track?.title, track?.artist, isPlaying);`;

const SNIPPET_CURL = `curl -H "x-api-key: YOUR_API_KEY" https://web-seven-omega-90.vercel.app/api/v1/now-playing`;

/** Try your API key: see the live response and a preview of the widget. The key is never stored. */
export default function Playground() {
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [tab, setTab] = useState<'react' | 'js' | 'curl'>('react');
  const [copied, setCopied] = useState(false);

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
  const track = (result?.body as { track?: Track | null })?.track ?? null;
  const isPlaying = Boolean((result?.body as { isPlaying?: boolean })?.isPlaying);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; the code is still visible */
    }
  }

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
        <h1 className="sample-title">Try your key</h1>
        <p className="lead">
          Paste an API key from your dashboard to see the live response and how the widget will look. The key is only
          sent to spoweb to make this request. It isn&apos;t saved.
        </p>

        <div className="card">
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
            <button className="btn" disabled={busy || !apiKey.trim()}>
              {busy ? 'Checking…' : 'Try it'}
            </button>
          </form>

          {result && (
            <div style={{ marginTop: 18 }}>
              <div className="row-between">
                <strong>{result.status === 200 ? 'Working' : `Error ${result.status || ''}`}</strong>
                <span className={`status ${result.status === 200 ? 'active' : ''}`}>HTTP {result.status || 'network'}</span>
              </div>

              {result.status === 200 && track && (
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
                    {isPlaying ? (<><span className="dot" />Live</>) : 'Last played'}
                  </span>
                </div>
              )}
              {result.status === 200 && !track && (
                <p className="hint">Nothing has been played on this account yet.</p>
              )}

              <pre style={{ marginTop: 14, borderRadius: 12, fontSize: 13, maxHeight: 260, overflow: 'auto' }}>
                <code>{JSON.stringify(result.body, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="card">
          <div className="row-between">
            <h2>Use it on your site</h2>
            <button className="btn small ghost" onClick={copySnippet}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
          <div className="tabs" style={{ marginTop: 14 }}>
            {(['react', 'js', 'curl'] as const).map((t) => (
              <button
                key={t}
                className={`tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
                style={{ cursor: 'pointer' }}
              >
                {t === 'react' ? 'React' : t === 'js' ? 'JavaScript' : 'curl'}
              </button>
            ))}
          </div>
          <pre style={{ marginTop: 0 }}><code>{snippet}</code></pre>
          <p className="hint">Replace YOUR_API_KEY with your key. In the browser, the key is visible to visitors, so use a read-only key.</p>
        </div>
      </main>

      <footer className="site-foot">
        <span>spoweb</span>
        <span>Built by <a href="https://preciousadeodokun.com.ng">preciousadeodokun.com.ng</a></span>
      </footer>
    </div>
  );
}
