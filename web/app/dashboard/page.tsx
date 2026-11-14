'use client';

import { useEffect, useState } from 'react';

type Key = { id: number; prefix: string; label: string; revoked_at: string | null };

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

/** Sign up, log in, and manage API keys. */
export default function Dashboard() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [keys, setKeys] = useState<Key[]>([]);
  const [fresh, setFresh] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function loadKeys() {
    const res = await fetch('/api/keys', { credentials: 'same-origin' });
    if (res.status === 401) return setLoggedIn(false);
    const data = await res.json();
    setLoggedIn(true);
    setKeys(data.keys);
  }
  useEffect(() => {
    loadKeys();
  }, []);

  async function auth(mode: 'login' | 'register', form: HTMLFormElement) {
    setError('');
    const f = new FormData(form);
    try {
      await call(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
      });
      loadKeys();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function createKey(form: HTMLFormElement) {
    setError('');
    try {
      const data = await call('/api/keys', {
        method: 'POST',
        body: JSON.stringify({ label: new FormData(form).get('label') }),
      });
      setFresh(data.key);
      loadKeys();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function revoke(id: number) {
    setError('');
    try {
      await call('/api/keys', { method: 'DELETE', body: JSON.stringify({ id }) });
      loadKeys();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function logout() {
    await call('/api/auth/logout', { method: 'POST' });
    setFresh(null);
    loadKeys();
  }

  if (loggedIn === null) return <div className="wrap"><p>Loading…</p></div>;

  return (
    <div className="wrap">
      <nav>
        <a className="brand" href="/">spoweb</a>
      </nav>
      <section>
        <span className="eyebrow">API keys</span>
        {error && <p style={{ color: '#f87171' }}>{error}</p>}

        {!loggedIn ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
              auth(submitter?.value === 'register' ? 'register' : 'login', e.currentTarget);
            }}
            style={{ display: 'grid', gap: 10, maxWidth: 360 }}
          >
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password (8+ characters)" minLength={8} required />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" name="mode" value="login">Log in</button>
              <button className="btn ghost" name="mode" value="register">Create account</button>
            </div>
          </form>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createKey(e.currentTarget);
              }}
              style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
            >
              <input name="label" placeholder="Label, e.g. my-portfolio" maxLength={60} />
              <button className="btn">Create key</button>
              <button type="button" className="btn ghost" onClick={logout}>Log out</button>
            </form>

            {fresh && (
              <p style={{ marginTop: 16 }}>
                Copy this key now. It won&apos;t be shown again: <code style={{ wordBreak: 'break-all' }}>{fresh}</code>
              </p>
            )}

            <h2 style={{ marginTop: 32 }}>Your keys</h2>
            {keys.length === 0 && <p>No keys yet.</p>}
            {keys.map((k) => (
              <div key={k.id} style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0' }}>
                <span>
                  {k.label} · <code>{k.prefix}…</code> · {k.revoked_at ? 'revoked' : 'active'}
                </span>
                {!k.revoked_at && (
                  <button className="btn ghost" onClick={() => revoke(k.id)}>Revoke</button>
                )}
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
