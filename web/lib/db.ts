import { Pool, type QueryResult, type QueryResultRow } from 'pg';

// Aiven PostgreSQL. DATABASE_URL is the service URI from the Aiven console:
//   postgres://user:password@host:port/defaultdb?sslmode=require
// DATABASE_CA is Aiven's CA certificate PEM (recommended; use \n for newlines).

declare global {
  // eslint-disable-next-line no-var
  var __spowebPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __spowebSchema: Promise<void> | undefined;
}

function pool(): Pool {
  if (!global.__spowebPool) {
    const raw = process.env.DATABASE_URL;
    if (!raw) throw new Error('DATABASE_URL is not set');
    // Parse the URL ourselves so sslmode in the query string can't override our TLS settings.
    const u = new URL(raw);
    global.__spowebPool = new Pool({
      host: u.hostname,
      port: Number(u.port || 5432),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: decodeURIComponent(u.pathname.slice(1)) || 'defaultdb',
      // Local development databases skip TLS; every other host requires it.
      ssl: ['localhost', '127.0.0.1'].includes(u.hostname)
        ? false
        : { rejectUnauthorized: true, ca: process.env.DATABASE_CA?.replace(/\\n/g, '\n') || undefined },
      max: 5,
    });
  }
  return global.__spowebPool;
}

async function ensureSchema(p: Pool): Promise<void> {
  await p.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash CHAR(64) UNIQUE NOT NULL,
    prefix TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ NULL
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS spotify_accounts (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    spotify_user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    refresh_token_enc TEXT NOT NULL,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
}

/** Parameterized query ($1, $2, ...). Creates the tables on first use. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  const p = pool();
  if (!global.__spowebSchema) global.__spowebSchema = ensureSchema(p);
  await global.__spowebSchema;
  return p.query<T>(text, params);
}
