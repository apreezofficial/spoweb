import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';

const scryptAsync = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const COOKIE = 'spw_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set (32+ characters)');
  return s;
}

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(pw, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, saltB64, keyB64] = stored.split('$');
  if (alg !== 'scrypt' || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64');
  const actual = await scryptAsync(pw, Buffer.from(saltB64, 'base64'), expected.length);
  return timingSafeEqual(actual, expected);
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function makeSessionToken(userId: number): string {
  const payload = Buffer.from(`${userId}:${Date.now() + MAX_AGE_SECONDS * 1000}`).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || sign(payload) !== sig) return null;
  const [id, expiry] = Buffer.from(payload, 'base64url').toString().split(':');
  if (Number(expiry) < Date.now()) return null;
  return Number(id);
}

export async function setSession(userId: number): Promise<void> {
  (await cookies()).set(COOKIE, makeSessionToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function currentUserId(): Promise<number | null> {
  return readSessionToken((await cookies()).get(COOKIE)?.value);
}

export function newApiKey(): { key: string; hash: string; prefix: string } {
  const key = `spw_${randomBytes(24).toString('hex')}`;
  return { key, hash: hashKey(key), prefix: key.slice(0, 8) };
}

export function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}
