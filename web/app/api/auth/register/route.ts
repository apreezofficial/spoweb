import { NextResponse } from 'next/server';
import { hashPassword, setSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail, readJson } from '@/lib/http';


export async function POST(req: Request) {
  const body = await readJson(req);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Enter a valid email', 422);
  if (password.length < 8) return fail('Password must be at least 8 characters', 422);

  const existing = await query<{ id: number }[]>('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) return fail('That email is already registered', 409);

  const result = await query<{ insertId: number }>(
    'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, UTC_TIMESTAMP())',
    [email, await hashPassword(password)],
  );
  await setSession(result.insertId);
  return NextResponse.json({ ok: true, email }, { status: 201 });
}
