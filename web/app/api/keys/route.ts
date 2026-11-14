import { NextResponse } from 'next/server';
import { currentUserId, newApiKey } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail, readJson } from '@/lib/http';


type KeyRow = { id: number; prefix: string; label: string; created_at: Date; revoked_at: Date | null };

/** List the logged-in user's keys (no secrets, only prefixes). */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  const keys = await query<KeyRow[]>(
    'SELECT id, prefix, label, created_at, revoked_at FROM api_keys WHERE user_id = ? ORDER BY id DESC',
    [userId],
  );
  return NextResponse.json({ keys });
}

/** Create a key: {"label":"my-site"}. The full key is returned once. */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  const body = await readJson(req);
  const label = String(body.label ?? 'default').trim().slice(0, 60) || 'default';

  const { key, hash, prefix } = newApiKey();
  await query(
    'INSERT INTO api_keys (user_id, key_hash, prefix, label, created_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())',
    [userId, hash, prefix, label],
  );
  return NextResponse.json({ key, prefix, label }, { status: 201 });
}

/** Revoke a key: {"id": 3}. */
export async function DELETE(req: Request) {
  const userId = await currentUserId();
  if (!userId) return fail('Log in first', 401);
  const body = await readJson(req);
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return fail('Invalid key id', 422);
  const result = await query<{ affectedRows: number }>(
    'UPDATE api_keys SET revoked_at = UTC_TIMESTAMP() WHERE id = ? AND user_id = ? AND revoked_at IS NULL',
    [id, userId],
  );
  return NextResponse.json({ ok: result.affectedRows === 1 });
}
