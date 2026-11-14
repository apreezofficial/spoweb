import mysql from 'mysql2/promise';

// Aiven MySQL. DATABASE_URL example:
//   mysql://user:password@host:port/defaultdb
// MYSQL_CA is the CA certificate PEM from Aiven (recommended).

declare global {
  // eslint-disable-next-line no-var
  var __spowebPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var __spowebSchema: Promise<void> | undefined;
}

function pool(): mysql.Pool {
  if (!global.__spowebPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    global.__spowebPool = mysql.createPool({
      uri: url,
      connectionLimit: 5,
      ssl: { rejectUnauthorized: true, ca: process.env.MYSQL_CA || undefined },
    });
  }
  return global.__spowebPool;
}

async function ensureSchema(p: mysql.Pool): Promise<void> {
  await p.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    key_hash CHAR(64) NOT NULL UNIQUE,
    prefix VARCHAR(16) NOT NULL,
    label VARCHAR(60) NOT NULL,
    created_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    CONSTRAINT fk_keys_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
}

/** Runs a parameterized query. Creates the tables on first use. */
export async function query<T = any>(sql: string, params: unknown[] = []): Promise<T> {
  const p = pool();
  if (!global.__spowebSchema) global.__spowebSchema = ensureSchema(p);
  await global.__spowebSchema;
  const [rows] = await p.query(sql, params);
  return rows as T;
}
