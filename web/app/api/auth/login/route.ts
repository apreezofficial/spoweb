import { NextResponse } from 'next/server';
import { setSession, verifyPassword } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail, readJson } from '@/lib/http';


export async function POST(req: Request) {
  const body = await readJson(req);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  const rows = await query<{ id: number; password_hash: string }[]>(
    'SELECT id, password_hash FROM users WHERE email = ?',
    [email],
  );
  const user = rows[0];
  // Same message for unknown email and wrong password, so emails cannot be probed.
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return fail('Wrong email or password', 401);
  }
  await setSession(user.id);
  return NextResponse.json({ ok: true });
}
