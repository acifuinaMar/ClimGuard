import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Valor aleatorio URL-safe (32 bytes = 43 caracteres base64url). */
export function randomToken(bytes = 32): string { return randomBytes(bytes).toString('base64url'); }

export function sha256Hex(v: string): string { return createHash('sha256').update(v, 'utf8').digest('hex'); }

/** PKCE S256 (RFC 7636): BASE64URL(SHA256(code_verifier)). */
export function pkceChallenge(verifier: string): string { return createHash('sha256').update(verifier, 'ascii').digest('base64url'); }

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, 'utf8'), y = Buffer.from(b, 'utf8');
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Formato esperado de state/code/binding: generados por randomToken(32). Rechaza basura antes de tocar la BD. */
export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}
