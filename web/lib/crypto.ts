import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

// Encrypts Spotify refresh tokens at rest (AES-256-GCM).
// Uses TOKEN_ENCRYPTION_KEY if set, otherwise derives a key from SESSION_SECRET.
function key(): Buffer {
  const source = process.env.TOKEN_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!source || source.length < 32) throw new Error('Set TOKEN_ENCRYPTION_KEY or SESSION_SECRET (32+ chars)');
  return createHash('sha256').update(source).digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64url')).join('.');
}

export function decrypt(payload: string): string {
  const [iv, tag, data] = payload.split('.').map((p) => Buffer.from(p, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
