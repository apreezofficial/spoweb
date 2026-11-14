import { NextResponse } from 'next/server';
import { currentUserId, newApiKey } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail, readJson } from '@/lib/http';

type KeyRow = { id: number; prefix: string; label: string; created_at: Date; revoked_at: Date | null };

/** List the logged-in user's keys (prefixes only, never full keys). */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  const { rows } = await query<KeyRow>(
    'SELECT id, prefix, label, created_at, revoked_at FROM api_keys WHERE user_id = $1 ORDER BY id DESC',
    [userId],
  );
  return NextResponse.json({ keys: rows });
}

/** Create a key: {"label":"my-site"}. The full key is returned once. */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  const body = await readJson(req);
  const label = String(body.label ?? 'default').trim().slice(0, 60) || 'default';

  const { key, hash, prefix } = newApiKey();
  await query('INSERT INTO api_keys (user_id, key_hash, prefix, label) VALUES ($1, $2, $3, $4)', [
    userId,
    hash,
    prefix,
    label,
  ]);
  return NextResponse.json({ key, prefix, label }, { status: 201 });
}

/** Revoke a key: {"id": 3}. */
export async function DELETE(req: Request) {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  const body = await readJson(req);
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return fail('Invalid key id', 422);
  const result = await query(
    'UPDATE api_keys SET revoked_at = now() WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL',
    [id, userId],
  );
  return NextResponse.json({ ok: result.rowCount === 1 });
}
