import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
const N = 32768,
  r = 8,
  p = 3;
export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const validEmail = (value: string) =>
  value.length <= 254 && /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(value);
export const validPassword = (value: string) =>
  value.length >= 15 && value.length <= 128;
function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(
      password,
      salt,
      64,
      { N, r, p, maxmem: 64 * 1024 * 1024 },
      (err, key) => (err ? reject(err) : resolve(key)),
    ),
  );
}
export async function hashPassword(password: string) {
  if (!validPassword(password))
    throw new Error('Use uma senha entre 15 e 128 caracteres.');
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${key.toString('hex')}`;
}
// Equal work for unknown accounts; this constant is never a usable credential.
const DUMMY = `scrypt$${N}$${r}$${p}$${'00'.repeat(16)}$${'00'.repeat(64)}`;
export async function verifyPassword(
  password: string,
  encoded?: string | null,
) {
  const parts = (encoded || DUMMY).split('$');
  const valid =
    parts.length === 6 &&
    parts[0] === 'scrypt' &&
    parts[1] === String(N) &&
    parts[2] === String(r) &&
    parts[3] === String(p) &&
    /^[a-f0-9]{32}$/.test(parts[4]) &&
    /^[a-f0-9]{128}$/.test(parts[5]);
  const chosen = valid ? parts : DUMMY.split('$');
  const derived = await derive(password, Buffer.from(chosen[4], 'hex'));
  return (
    timingSafeEqual(derived, Buffer.from(chosen[5], 'hex')) &&
    valid &&
    !!encoded
  );
}
export const tokenHash = (token: string) =>
  createHash('sha256').update(token).digest('hex');
export function equalSecret(left: string, right: string) {
  return timingSafeEqual(
    createHash('sha256').update(left).digest(),
    createHash('sha256').update(right).digest(),
  );
}
export const newSessionToken = () => randomBytes(32).toString('base64url');
