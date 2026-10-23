import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { hashPassword, verifyPassword, isLegacyHash } from '../src/common/password';
import { signToken, verifyToken } from '../src/common/jwt';
import { toUsuarioDto } from '../src/common/legacy';
import { loadConfig } from '../src/config';

const KEY = 'k'.repeat(40);
const base = { sub: '1', username: 'admin', role: 'Administrador', permissions: ['reports.generate'], issuer: 'iss', audience: 'aud', ttlSeconds: 600, key: KEY };

test('hashes heredados de la Fase 2 verifican (admin/Admin123, JDoe/Compu23)', () => {
  assert.ok(verifyPassword('Admin123', '3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2'));
  assert.ok(verifyPassword('Compu23', '34a0d703ced482fcdcbdd2ece107ff84b00edd5d4065ac56529a233865099dd0'));
  assert.ok(!verifyPassword('admin123', '3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2'));
  assert.equal(createHash('sha256').update('Admin123').digest('hex').slice(0, 8), '3b612c75');
});
test('scrypt: sal distinta, verifica, rechaza', () => {
  const a = hashPassword('Secreta#123'), b = hashPassword('Secreta#123');
  assert.notEqual(a, b); assert.ok(!isLegacyHash(a));
  assert.ok(verifyPassword('Secreta#123', a)); assert.ok(!verifyPassword('otra', a));
  assert.ok(!verifyPassword('x', '')); assert.ok(!verifyPassword('x', 'scrypt$1$a$b'));
});
test('JWT: firma/verificación y claims', () => {
  const { token } = signToken({ ...base, now: 1000 });
  const c = verifyToken(token, { key: KEY, issuer: 'iss', audience: 'aud', now: 1100 });
  assert.equal(c.role, 'Administrador'); assert.deepEqual(c.permissions, ['reports.generate']);
  assert.equal(c['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], 'Administrador');
});
test('JWT: rechaza expirado, issuer, audience, firma, alg none, sin exp', () => {
  const { token } = signToken({ ...base, now: 1000 });
  const ok = { key: KEY, issuer: 'iss', audience: 'aud', now: 1100 };
  assert.throws(() => verifyToken(token, { ...ok, now: 1000 + 600 + 31 }), /expirado/);
  assert.throws(() => verifyToken(token, { ...ok, issuer: 'x' }), /Issuer/);
  assert.throws(() => verifyToken(token, { ...ok, audience: 'x' }), /Audience/);
  assert.throws(() => verifyToken(token, { ...ok, key: 'z'.repeat(40) }), /Firma/);
  const [h, p] = token.split('.');
  const none = Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url');
  assert.throws(() => verifyToken(`${none}.${p}.`, ok), /Algoritmo/);
  const noexp = Buffer.from(JSON.stringify({ iss: 'iss', aud: 'aud' })).toString('base64url');
  assert.throws(() => verifyToken(`${h}.${noexp}.x`, ok), /Firma|expiración/);
  assert.throws(() => verifyToken('abc', ok), /mal formado/);
});
test('DTO legado', () => {
  const d = toUsuarioDto({ id: 3, username: 'u', fullName: 'U', active: true, roleId: 2, lastAccess: null, createdBy: null, createdAt: new Date(0), updatedBy: null, updatedAt: null });
  assert.equal(d.usuarioId, 3); assert.equal(d.rolId, 2); assert.equal(d.ultimoAcceso, null); assert.ok(!('passwordHash' in d));
});
test('config exige clave >=32 bytes', () => {
  const env = { JWT_KEY: 'corta', JWT_ISSUER: 'i', JWT_AUDIENCE: 'a', POSTGRES_HOST: 'h', POSTGRES_USER: 'u', POSTGRES_PASSWORD: 'p' };
  assert.throws(() => loadConfig(env), /32 bytes/);
  assert.equal(loadConfig({ ...env, JWT_KEY: KEY }).ttlSeconds, 1800);
});
