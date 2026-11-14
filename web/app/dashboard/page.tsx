'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Key = { id: number; prefix: string; label: string; revoked_at: string | null };
type Mode = 'login' | 'register';

async function call(path: string, init: { method?: string; body?: unknown } = {}) {
  const res = await fetch(path, {
    method: init.method ?? 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
}

/** Sign up, log in, and manage API keys for the spoweb widget. */
export default function Dashboard() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode>('login');
  const [keys, setKeys] = useState<Key[]>([]);
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [spotify, setSpotify] = useState<{ connected: boolean; displayName?: string } | null>(null);
  const [notice, setNotice] = useState('');

  async function loadKeys() {
    const res = await fetch('/api/keys', { credentials: 'same-origin' });
    if (res.status === 401) return setLoggedIn(false);
    const data = await res.json();
    setLoggedIn(true);
    setKeys(data.keys);
    const st = await fetch('/api/spotify/status', { credentials: 'same-origin' });
    if (st.ok) setSpotify(await st.json());
  }
  useEffect(() => {
    loadKeys();
    const result = new URLSearchParams(window.location.search).get('spotify');
    const messages: Record<string, string> = {
      connected: 'Spotify connected. Your widget will now show your music.',
      denied: 'You declined the Spotify request.',
      bad_state: 'That Spotify link expired. Try connecting again.',
      failed: 'Spotify could not be connected. Try again.',
      login_required: 'Log in, then connect Spotify.',
    };
    if (result && messages[result]) setNotice(messages[result]);
  }, []);

  function disconnectSpotify() {
    if (!window.confirm('Disconnect Spotify? Your widgets will stop showing music until you reconnect.')) return;
    run(async () => {
      await call('/api/spotify/connect', { method: 'DELETE' });
      await loadKeys();
    });
  }

  async function run(action: () => Promise<void>) {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function submitAuth(form: HTMLFormElement) {
    const f = new FormData(form);
    run(async () => {
      await call(`/api/auth/${mode}`, {
        body: { email: f.get('email'), password: f.get('password') },
      });
      await loadKeys();
    });
  }

  function createKey(form: HTMLFormElement) {
    const label = String(new FormData(form).get('label') || 'default');
    run(async () => {
      const data = await call('/api/keys', { body: { label } });
      setFresh(data.key);
      setCopied(false);
      form.reset();
      await loadKeys();
    });
  }

  function revoke(id: number) {
    if (!window.confirm('Revoke this key? Sites using it will stop working.')) return;
    run(async () => {
      await call('/api/keys', { method: 'DELETE', body: { id } });
      await loadKeys();
    });
  }

  function logout() {
    run(async () => {
      await call('/api/auth/logout');
      setFresh(null);
      await loadKeys();
    });
  }

  async function copyKey() {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh);
      setCopied(true);
    } catch {
      setError('Could not copy. Select the key and copy it manually.');
    }
  }

  const header = (
    <header className="top">
      <nav>
        <Link className="brand" href="/">spoweb</Link>
        <div className="links">
          <Link href="/sample">Sample</Link>
          {loggedIn && (
            <button className="link" onClick={logout} disabled={busy}>Log out</button>
          )}
        </div>
      </nav>
    </header>
  );

  const footer = (
    <footer className="site-foot">
      <span>spoweb</span>
      <span>Built by <a href="https://preciousadedokun.com.ng">preciousadedokun.com.ng</a></span>
    </footer>
  );

  if (loggedIn === null) {
    return (
      <div className="page">
        {header}
        <main className="page-main"><p>Loading…</p></main>
        {footer}
      </div>
    );
  }

  return (
    <div className="page">
      {header}
      <main className="page-main">
        {!loggedIn ? (
          <>
            <span className="eyebrow">Developer access</span>
            <h1 className="sample-title">{mode === 'login' ? 'Log in' : 'Create your account'}</h1>
            <div className="card">
              <p className="lead">
                {mode === 'login'
                  ? 'Log in to manage your spoweb API keys.'
                  : 'Create an account to get API keys for the spoweb widget.'}
              </p>
              <form
                className="stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitAuth(e.currentTarget);
                }}
              >
                <label className="field">
                  <span>Email</span>
                  <input className="input" name="email" type="email" autoComplete="email" required />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input
                    className="input"
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={8}
                    required
                  />
                </label>
                {error && <p className="notice">{error}</p>}
                <button className="btn btn-block" disabled={busy}>
                  {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
                </button>
              </form>
            </div>
            <p className="hint" style={{ textAlign: 'center', marginTop: 16 }}>
              {mode === 'login' ? "New here? " : 'Already have an account? '}
              <button
                className="link"
                onClick={() => {
                  setError('');
                  setMode(mode === 'login' ? 'register' : 'login');
                }}
              >
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </button>
            </p>
          </>
        ) : (
          <>
            <span className="eyebrow">Dashboard</span>
            <h1 className="sample-title">Your API keys</h1>

            <div className="card">
              <div className="row-between">
                <h2>Spotify</h2>
                <span className={`status ${spotify?.connected ? 'active' : ''}`}>
                  {spotify?.connected ? 'Connected' : 'Not connected'}
                </span>
              </div>
              {notice && <p className="hint" style={{ color: 'var(--accent)' }}>{notice}</p>}
              {spotify?.connected ? (
                <div className="row-actions" style={{ marginTop: 12 }}>
                  <span>Showing music from <strong>{spotify.displayName}</strong></span>
                  <button className="btn small danger" onClick={disconnectSpotify} disabled={busy}>Disconnect</button>
                </div>
              ) : (
                <>
                  <p className="lead" style={{ marginTop: 8 }}>
                    Connect your Spotify account so your widgets show what you are listening to.
                  </p>
                  <a className="btn" href="/api/spotify/connect">Connect Spotify</a>
                </>
              )}
            </div>

            <div className="card">
              <h2>Create a key</h2>
              <p className="lead">Give it a name so you remember where it&apos;s used.</p>
              <form
                className="row-actions"
                onSubmit={(e) => {
                  e.preventDefault();
                  createKey(e.currentTarget);
                }}
              >
                <input className="input" name="label" placeholder="e.g. my-portfolio" maxLength={60} style={{ flex: 1, minWidth: 180 }} />
                <button className="btn" disabled={busy}>Create key</button>
              </form>
              {error && <p className="notice" style={{ marginTop: 12 }}>{error}</p>}

              {fresh && (
                <div style={{ marginTop: 18 }}>
                  <p className="hint" style={{ marginTop: 0 }}>
                    Copy your key now. For your security it won&apos;t be shown again.
                  </p>
                  <div className="key-box">
                    <code>{fresh}</code>
                    <button className="btn small" onClick={copyKey}>{copied ? 'Copied' : 'Copy'}</button>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="row-between">
                <h2>Keys</h2>
                <span className="hint" style={{ margin: 0 }}>{keys.filter((k) => !k.revoked_at).length} active</span>
              </div>
              {keys.length === 0 ? (
                <div className="empty">No keys yet. Create one above to get started.</div>
              ) : (
                <div className="key-list">
                  {keys.map((k) => (
                    <div key={k.id} className="key-item">
                      <div style={{ minWidth: 0 }}>
                        <div className="label">{k.label}</div>
                        <div className="prefix">{k.prefix}…</div>
                      </div>
                      <div className="row-actions">
                        <span className={`status ${k.revoked_at ? '' : 'active'}`}>
                          {k.revoked_at ? 'Revoked' : 'Active'}
                        </span>
                        {!k.revoked_at && (
                          <button className="btn small danger" onClick={() => revoke(k.id)} disabled={busy}>
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="hint">Keys are sent in the <code>x-api-key</code> header. Only the first characters are shown here.</p>
            </div>
          </>
        )}
      </main>
      {footer}
    </div>
  );
}
