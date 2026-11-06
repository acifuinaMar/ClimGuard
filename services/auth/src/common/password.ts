import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

const N = 16384, R = 8, P = 1, KEYLEN = 64;

/** Hash nuevo: scrypt con sal aleatoria. Formato: scrypt$N$salt(b64)$hash(b64). */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const dk = scryptSync(plain, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${salt.toString('base64')}$${dk.toString('base64')}`;
}

export function isLegacyHash(stored: string): boolean {
  return /^[0-9a-f]{64}$/i.test(stored);
}

function safeEq(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Verifica scrypt o el SHA256-hex heredado de la Fase 2 (migrado sin pedir cambio de contraseña). */
export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored) return false;
  if (isLegacyHash(stored)) {
    const h = createHash('sha256').update(plain, 'utf8').digest();
    return safeEq(h, Buffer.from(stored.toLowerCase(), 'hex'));
  }
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const n = Number(parts[1]);
  if (!Number.isInteger(n) || n < 1024 || n > 1 << 20) return false;
  const salt = Buffer.from(parts[2], 'base64');
  const expected = Buffer.from(parts[3], 'base64');
  const dk = scryptSync(plain, salt, expected.length, { N: n, r: R, p: P });
  return safeEq(dk, expected);
}

/** Hash que verifica siempre algo, para igualar tiempos cuando el usuario no existe. */
export const DUMMY_HASH = hashPassword('dummy-password-for-timing');
