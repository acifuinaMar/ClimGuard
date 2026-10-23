import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';

export interface TokenInput {
  sub: string; username: string; role: string; permissions: string[];
  issuer: string; audience: string; ttlSeconds: number; key: string; now?: number;
}
const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const ROLE_URI = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const NAMEID_URI = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

/** JWT HS256. Incluye los claims largos de .NET (compat. con la API de la Fase 2) y `role`/`permissions` estándar. */
export function signToken(i: TokenInput): { token: string; expiresAt: Date } {
  const now = i.now ?? Math.floor(Date.now() / 1000);
  const exp = now + i.ttlSeconds;
  const payload = {
    sub: i.sub, preferred_username: i.username, role: i.role, permissions: i.permissions,
    [ROLE_URI]: i.role, [NAMEID_URI]: i.username,
    iss: i.issuer, aud: i.audience, iat: now, nbf: now, exp, jti: randomUUID(),
  };
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify(payload));
  const sig = createHmac('sha256', i.key).update(`${head}.${body}`).digest();
  return { token: `${head}.${body}.${b64u(sig)}`, expiresAt: new Date(exp * 1000) };
}

export class TokenError extends Error {}

export function verifyToken(token: string, o: { key: string; issuer: string; audience: string; now?: number }): Record<string, any> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new TokenError('Token mal formado');
  let header: any, payload: any;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  } catch { throw new TokenError('Token mal formado'); }
  if (header.alg !== 'HS256') throw new TokenError('Algoritmo no permitido');
  const expected = createHmac('sha256', o.key).update(`${parts[0]}.${parts[1]}`).digest();
  const given = Buffer.from(parts[2], 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new TokenError('Firma inválida');
  const now = o.now ?? Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number') throw new TokenError('Token sin expiración');
  if (payload.exp + 30 < now) throw new TokenError('Token expirado');
  if (typeof payload.nbf === 'number' && payload.nbf - 30 > now) throw new TokenError('Token aún no válido');
  if (payload.iss !== o.issuer) throw new TokenError('Issuer inválido');
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(o.audience)) throw new TokenError('Audience inválida');
  return payload;
}
