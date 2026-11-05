import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSession } from '../src/common/session';
import { verifyToken } from '../src/common/jwt';
import { pkceChallenge, readCookie, sha256Hex, TOKEN_RE } from '../src/oauth/crypto';
import { loadOAuthConfig, OAuthConfig } from '../src/oauth/oauth.config';
import { OAuthCore, OAUTH_DEFAULT_ROLE } from '../src/oauth/core';
import { GoogleProvider, GOOGLE } from '../src/oauth/google';
import { GitHubProvider } from '../src/oauth/github';
import { AuditPort, CodeStore, ExternalProfile, FetchLike, FlowRow, FlowStore, OAuthError, OAuthProvider, UserPort, UserRecord } from '../src/oauth/types';

// ---------------- fakes en memoria (misma semántica atómica que las tablas) ----------------
class MemFlows implements FlowStore {
  rows = new Map<string, any>();
  async create(f: any) { this.rows.set(f.stateHash, { ...f, consumed: false }); }
  async consume(stateHash: string, bindingHash: string, provider: string, now: Date): Promise<FlowRow | null> {
    const r = this.rows.get(stateHash);
    if (!r || r.consumed || r.bindingHash !== bindingHash || r.provider !== provider || r.expiresAt <= now) return null;
    r.consumed = true; return { nonce: r.nonce, codeVerifier: r.codeVerifier, linkUserId: r.linkUserId };
  }
}
class MemCodes implements CodeStore {
  rows = new Map<string, any>();
  async create(c: any) { this.rows.set(c.codeHash, { ...c, consumed: false }); }
  async consume(codeHash: string, bindingHash: string, now: Date) {
    const r = this.rows.get(codeHash);
    if (!r || r.consumed || r.bindingHash !== bindingHash || r.expiresAt <= now) return null;
    r.consumed = true; return r.userId as number;
  }
}
class MemUsers implements UserPort {
  users: (UserRecord & { role: string })[] = [{ id: 1, username: 'admin', active: true, role: 'Administrador' }];
  idents: { provider: string; subject: string; userId: number }[] = [];
  provisioned: ExternalProfile[] = []; failFirstProvision = false;
  async findByIdentity(provider: string, subject: string) {
    const i = this.idents.find((x) => x.provider === provider && x.subject === subject);
    return i ? this.users.find((u) => u.id === i.userId) ?? null : null;
  }
  async findById(id: number) { return this.users.find((u) => u.id === id) ?? null; }
  async provision(p: ExternalProfile) {
    if (this.failFirstProvision) { this.failFirstProvision = false; // simula carrera: otro proceso ya lo creó
      const u = { id: 99, username: 'race', active: true, role: OAUTH_DEFAULT_ROLE }; this.users.push(u); this.idents.push({ provider: p.provider, subject: p.subject, userId: 99 }); throw new Error('duplicate key'); }
    this.provisioned.push(p);
    const u = { id: 10 + this.users.length, username: `${p.provider}_x`, active: true, role: OAUTH_DEFAULT_ROLE };
    this.users.push(u); this.idents.push({ provider: p.provider, subject: p.subject, userId: u.id }); return u;
  }
  async link(userId: number, p: ExternalProfile) {
    const i = this.idents.find((x) => x.provider === p.provider && x.subject === p.subject);
    if (i) return i.userId === userId ? 'linked' as const : 'in_use' as const;
    this.idents.push({ provider: p.provider, subject: p.subject, userId }); return 'linked' as const;
  }
  async touchIdentity() { /* noop */ }
}

const cfg = (o: Partial<OAuthConfig> = {}): OAuthConfig => ({ publicBaseUrl: 'https://cg.example.org', frontendUrl: 'https://cg.example.org', cookieSecure: true,
  autoProvision: false, allowedEmailDomains: [], flowTtlSeconds: 600, codeTtlSeconds: 60, ...o });

/** Proveedor de pruebas: devuelve el perfil configurado y registra lo que recibió. */
class FakeProvider implements OAuthProvider {
  id = 'google'; label = 'Fake'; seen: any; profile: ExternalProfile | Error = { provider: 'google', subject: 'sub-1', email: 'a@b.com', emailVerified: true };
  buildAuthUrl(i: any) { return 'https://idp.example/auth?' + new URLSearchParams({ state: i.state, nonce: i.nonce, code_challenge: i.codeChallenge, redirect_uri: i.redirectUri }); }
  async completeLogin(i: any) { this.seen = i; if (this.profile instanceof Error) throw this.profile; return this.profile; }
}

function setup(o: Partial<OAuthConfig> = {}) {
  const flows = new MemFlows(), codes = new MemCodes(), users = new MemUsers(), p = new FakeProvider();
  const events: string[] = []; const audit: AuditPort = { emit: (a) => { events.push(a); } };
  let t = new Date('2026-01-01T00:00:00Z');
  const core = new OAuthCore({ cfg: cfg(o), providers: [p], flows, codes, users, audit, now: () => t });
  return { core, flows, codes, users, p, events, advance: (s: number) => { t = new Date(t.getTime() + s * 1000); } };
}
const qs = (url: string) => new URL(url).searchParams;

// ---------------- crypto / config ----------------
test('PKCE S256 coincide con el vector de la RFC 7636', () => {
  assert.equal(pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
});
test('readCookie encuentra por nombre exacto', () => {
  assert.equal(readCookie('a=1; cg_oauth_bind=xyz; b=2', 'cg_oauth_bind'), 'xyz');
  assert.equal(readCookie('xcg_oauth_bind=1', 'cg_oauth_bind'), undefined);
  assert.equal(readCookie(undefined, 'a'), undefined);
});
test('config: sin proveedores no exige nada; con proveedor exige URL pública https', () => {
  assert.equal(loadOAuthConfig({}).google, undefined);
  assert.throws(() => loadOAuthConfig({ GOOGLE_CLIENT_ID: 'a', GOOGLE_CLIENT_SECRET: 'b' }), /OAUTH_PUBLIC_BASE_URL/);
  assert.throws(() => loadOAuthConfig({ GOOGLE_CLIENT_ID: 'a' , OAUTH_PUBLIC_BASE_URL: 'https://x.org' }), /juntas/);
  assert.throws(() => loadOAuthConfig({ GITHUB_CLIENT_ID: 'a', GITHUB_CLIENT_SECRET: 'b', OAUTH_PUBLIC_BASE_URL: 'http://climguard.example.org' }), /https/);
  assert.throws(() => loadOAuthConfig({ GITHUB_CLIENT_ID: 'a', GITHUB_CLIENT_SECRET: 'b', OAUTH_PUBLIC_BASE_URL: 'https://x.org/app' }), /ruta/);
  const c = loadOAuthConfig({ GITHUB_CLIENT_ID: 'a', GITHUB_CLIENT_SECRET: 'b', OAUTH_PUBLIC_BASE_URL: 'http://localhost:8080/', OAUTH_ALLOWED_EMAIL_DOMAINS: 'Uni.edu, x.org' });
  assert.equal(c.publicBaseUrl, 'http://localhost:8080'); assert.equal(c.cookieSecure, false); assert.equal(c.autoProvision, false);
  assert.deepEqual(c.allowedEmailDomains, ['uni.edu', 'x.org']);
  assert.equal(loadOAuthConfig({ OAUTH_AUTO_PROVISION: 'true' }).autoProvision, true);
  // docker compose pasa variables vacías (OAUTH_FRONTEND_URL='') cuando no se definen
  const e = loadOAuthConfig({ GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', OAUTH_PUBLIC_BASE_URL: 'https://x.org', OAUTH_FRONTEND_URL: '', OAUTH_ALLOWED_EMAIL_DOMAINS: '' });
  assert.equal(e.frontendUrl, 'https://x.org'); assert.equal(e.google, undefined); assert.deepEqual(e.allowedEmailDomains, []);
});

// ---------------- start ----------------
test('start: state/nonce/PKCE aleatorios, solo se guarda el hash del state, redirect_uri exacto', async () => {
  const { core, flows } = setup();
  const a = await core.start('google'), b = await core.start('google');
  const qa = qs(a.url);
  assert.ok(TOKEN_RE.test(qa.get('state')!) && TOKEN_RE.test(a.binding));
  assert.notEqual(qa.get('state'), qs(b.url).get('state'));
  assert.equal(qa.get('redirect_uri'), 'https://cg.example.org/api/auth/oauth/google/callback');
  const row = flows.rows.get(sha256Hex(qa.get('state')!));
  assert.ok(row, 'se guarda por hash');
  assert.ok(![...flows.rows.keys()].includes(qa.get('state')!), 'el state en claro no se guarda');
  assert.equal(qa.get('code_challenge'), pkceChallenge(row.codeVerifier));
  assert.equal(row.nonce, qa.get('nonce'));
  assert.equal(row.bindingHash, sha256Hex(a.binding));
});
test('start: proveedor desconocido', async () => {
  await assert.rejects(setup().core.start('facebook'), (e: any) => e instanceof OAuthError && e.reason === 'unknown_provider');
});

// ---------------- callback: state / navegador ----------------
test('callback rechaza state ausente, malformado, de otro navegador, repetido y expirado', async () => {
  const s = setup();
  const { url, binding } = await s.core.start('google'); const state = qs(url).get('state')!;
  const bad = async (st: string | undefined, b: string | undefined) => (await s.core.callback('google', { code: 'c', state: st }, b)) as any;
  assert.equal((await bad(undefined, binding)).reason, 'invalid_state');
  assert.equal((await bad('x', binding)).reason, 'invalid_state');
  assert.equal((await bad(state, undefined)).reason, 'invalid_state');
  const other = (await s.core.start('google')).binding;
  assert.equal((await bad(state, other)).reason, 'invalid_state');          // otro navegador
  assert.equal((await bad(state, binding)).kind, 'error');                   // aún no existe usuario → error de negocio, pero el state SÍ era válido
  assert.equal((await bad(state, binding)).reason, 'invalid_state');         // reutilización
  const r2 = await s.core.start('google'); s.advance(601);
  assert.equal((await s.core.callback('google', { code: 'c', state: qs(r2.url).get('state')! }, r2.binding) as any).reason, 'invalid_state'); // expirado
});
test('un navegador ajeno con el state robado no “quema” el flujo legítimo', async () => {
  const s = setup(); s.users.idents.push({ provider: 'google', subject: 'sub-1', userId: 1 });
  const { url, binding } = await s.core.start('google'); const state = qs(url).get('state')!;
  await s.core.callback('google', { code: 'c', state }, 'A'.repeat(43));
  assert.equal((await s.core.callback('google', { code: 'c', state }, binding)).kind, 'login');
});
test('callback con error del proveedor (usuario canceló) no intenta canjear nada', async () => {
  const s = setup(); const { url, binding } = await s.core.start('google');
  const r = await s.core.callback('google', { error: 'access_denied', state: qs(url).get('state')! }, binding) as any;
  assert.equal(r.reason, 'provider_error'); assert.equal(s.p.seen, undefined);
});
test('el code_verifier y el nonce guardados son los que se entregan al proveedor', async () => {
  const s = setup(); s.users.idents.push({ provider: 'google', subject: 'sub-1', userId: 1 });
  const { url, binding } = await s.core.start('google'); const q = qs(url);
  await s.core.callback('google', { code: 'c', state: q.get('state')! }, binding);
  assert.equal(s.p.seen.nonce, q.get('nonce')); assert.equal(pkceChallenge(s.p.seen.codeVerifier), q.get('code_challenge'));
});

// ---------------- código de un solo uso ----------------
async function login(s: ReturnType<typeof setup>) {
  const { url, binding } = await s.core.start('google');
  const r = await s.core.callback('google', { code: 'c', state: qs(url).get('state')! }, binding) as any;
  return { r, binding };
}
test('identidad ya vinculada: emite código; el canje funciona UNA vez y solo desde el mismo navegador', async () => {
  const s = setup(); s.users.idents.push({ provider: 'google', subject: 'sub-1', userId: 1 });
  const { r, binding } = await login(s);
  assert.equal(r.kind, 'login'); assert.ok(TOKEN_RE.test(r.code));
  assert.ok(![...s.codes.rows.keys()].includes(r.code), 'solo se guarda el hash');
  assert.equal(await s.core.exchange(r.code, 'B'.repeat(43)), null, 'otro navegador');
  assert.equal((await s.core.exchange(r.code, binding))?.id, 1);
  assert.equal(await s.core.exchange(r.code, binding), null, 'segundo uso');
});
test('el código expira', async () => {
  const s = setup(); s.users.idents.push({ provider: 'google', subject: 'sub-1', userId: 1 });
  const { r, binding } = await login(s); s.advance(61);
  assert.equal(await s.core.exchange(r.code, binding), null);
});
test('canjes simultáneos del mismo código: solo uno gana', async () => {
  const s = setup(); s.users.idents.push({ provider: 'google', subject: 'sub-1', userId: 1 });
  const { r, binding } = await login(s);
  const res = await Promise.all([1, 2, 3, 4, 5].map(() => s.core.exchange(r.code, binding)));
  assert.equal(res.filter(Boolean).length, 1);
});
test('exchange rechaza entradas malformadas sin tocar el almacén', async () => {
  const s = setup();
  for (const [c, b] of [[undefined, 'x'], ['x', undefined], ['corto', 'A'.repeat(43)], ['A'.repeat(43), 'corto']] as const)
    assert.equal(await s.core.exchange(c, b), null);
});
test('cuenta desactivada tras emitir el código: el canje falla', async () => {
  const s = setup(); s.users.idents.push({ provider: 'google', subject: 'sub-1', userId: 1 });
  const { r, binding } = await login(s); s.users.users[0].active = false;
  assert.equal(await s.core.exchange(r.code, binding), null);
});

// ---------------- aprovisionamiento y vinculación ----------------
test('sin OAUTH_AUTO_PROVISION no se crean usuarios (not_registered)', async () => {
  const s = setup(); const { r } = await login(s);
  assert.equal(r.reason, 'not_registered'); assert.equal(s.users.provisioned.length, 0);
});
test('auto-provisión: crea usuario con rol Consulta, nunca Administrador', async () => {
  const s = setup({ autoProvision: true }); const { r, binding } = await login(s);
  assert.equal(r.kind, 'login'); assert.equal(s.users.provisioned.length, 1);
  const u = await s.core.exchange(r.code, binding);
  assert.equal(s.users.users.find((x) => x.id === u!.id)!.role, 'Consulta');
  assert.equal(OAUTH_DEFAULT_ROLE, 'Consulta');
  assert.ok(s.events.includes('OAUTH_USER_PROVISIONED') && s.events.includes('OAUTH_LOGIN'));
});
test('NO se vincula a una cuenta local por coincidir el correo (admin@… no entra como admin)', async () => {
  const s = setup({ autoProvision: true });
  s.p.profile = { provider: 'google', subject: 'atacante', email: 'admin@example.org', emailVerified: true, name: 'admin' };
  const { r, binding } = await login(s);
  const u = await s.core.exchange(r.code, binding);
  assert.notEqual(u!.id, 1); assert.notEqual(u!.username, 'admin');
  assert.equal(s.users.idents.some((i) => i.userId === 1), false);
});
test('correo no verificado / ausente: no se provisiona', async () => {
  const s = setup({ autoProvision: true });
  s.p.profile = { provider: 'google', subject: 's2', email: 'x@y.com', emailVerified: false };
  assert.equal((await login(s)).r.reason, 'email_not_verified');
  s.p.profile = { provider: 'google', subject: 's3', emailVerified: false };
  assert.equal((await login(s)).r.reason, 'email_not_verified'); assert.equal(s.users.provisioned.length, 0);
});
test('dominios permitidos restringen el auto-registro', async () => {
  const s = setup({ autoProvision: true, allowedEmailDomains: ['uni.edu'] });
  s.p.profile = { provider: 'google', subject: 's4', email: 'a@gmail.com', emailVerified: true };
  assert.equal((await login(s)).r.reason, 'domain_not_allowed');
  s.p.profile = { provider: 'google', subject: 's5', email: 'a@uni.edu', emailVerified: true };
  assert.equal((await login(s)).r.kind, 'login');
});
test('carrera en provision: se reutiliza la identidad creada por el otro proceso', async () => {
  const s = setup({ autoProvision: true }); s.users.failFirstProvision = true;
  const { r, binding } = await login(s);
  assert.equal(r.kind, 'login'); assert.equal((await s.core.exchange(r.code, binding))!.id, 99);
});
test('cuenta desactivada con identidad vinculada: account_disabled y no hay código', async () => {
  const s = setup(); s.users.users[0].active = false; s.users.idents.push({ provider: 'google', subject: 'sub-1', userId: 1 });
  assert.equal((await login(s)).r.reason, 'account_disabled'); assert.equal(s.codes.rows.size, 0);
});
test('vincular (sesión local activa): enlaza la identidad al usuario del flujo, sin emitir código', async () => {
  const s = setup();
  const { url, binding } = await s.core.start('google', { linkUserId: 1 });
  const r = await s.core.callback('google', { code: 'c', state: qs(url).get('state')! }, binding);
  assert.equal(r.kind, 'linked'); assert.equal(s.codes.rows.size, 0);
  assert.deepEqual(s.users.idents, [{ provider: 'google', subject: 'sub-1', userId: 1 }]);
  assert.ok(s.events.includes('OAUTH_IDENTITY_LINKED'));
});
test('vincular una identidad que ya pertenece a otro usuario: identity_in_use', async () => {
  const s = setup(); s.users.users.push({ id: 2, username: 'op', active: true, role: 'Operador' });
  s.users.idents.push({ provider: 'google', subject: 'sub-1', userId: 2 });
  const { url, binding } = await s.core.start('google', { linkUserId: 1 });
  assert.equal((await s.core.callback('google', { code: 'c', state: qs(url).get('state')! }, binding) as any).reason, 'identity_in_use');
});
test('errores del proveedor se traducen a motivos fijos (sin filtrar detalle)', async () => {
  const s = setup(); s.p.profile = new OAuthError('invalid_token', 'detalle interno secreto');
  const r = (await login(s)).r; assert.equal(r.reason, 'invalid_token'); assert.ok(!JSON.stringify(r).includes('secreto'));
  s.p.profile = new Error('ECONNRESET'); assert.equal((await login(s)).r.reason, 'provider_unavailable');
});

// ---------------- Google (OIDC) ----------------
const gCreds = { clientId: 'cid.apps.googleusercontent.com', clientSecret: 'sec' };
const okJson = (b: any): ReturnType<FetchLike> => Promise.resolve({ ok: true, status: 200, json: async () => b });
function google(claims: Record<string, unknown> | Error, tokenBody: any = { id_token: 'x.y.z' }) {
  const calls: any[] = [];
  const http: FetchLike = (url, init) => { calls.push({ url, init }); return okJson(tokenBody); };
  const verify = async (_t: string, o: any) => { calls.push({ verify: o }); if (claims instanceof Error) throw claims; return claims; };
  return { p: new GoogleProvider(gCreds, verify, http), calls };
}
const gIn = { code: 'abc', codeVerifier: 'ver', nonce: 'N'.repeat(43), redirectUri: 'https://cg.example.org/api/auth/oauth/google/callback' };
test('Google: URL de autorización con PKCE S256, nonce, state y scopes OIDC', () => {
  const u = new URL(google({}).p.buildAuthUrl({ state: 's', nonce: 'n', codeChallenge: 'c', redirectUri: gIn.redirectUri }));
  assert.equal(u.origin + u.pathname, GOOGLE.authUrl);
  const q = u.searchParams;
  assert.deepEqual([q.get('response_type'), q.get('code_challenge_method'), q.get('nonce'), q.get('state'), q.get('scope'), q.get('client_id')], ['code', 'S256', 'n', 's', 'openid email profile', gCreds.clientId]);
});
test('Google: canje con code_verifier + secreto en servidor; verifica iss/aud con la librería; devuelve perfil', async () => {
  const { p, calls } = google({ sub: '123', nonce: gIn.nonce, email: 'U@Gmail.com', email_verified: true, name: 'U', picture: 'https://p/x' });
  const prof = await p.completeLogin(gIn);
  assert.deepEqual(prof, { provider: 'google', subject: '123', email: 'u@gmail.com', emailVerified: true, name: 'U', avatarUrl: 'https://p/x' });
  const body = new URLSearchParams(calls[0].init.body);
  assert.equal(body.get('code_verifier'), 'ver'); assert.equal(body.get('grant_type'), 'authorization_code'); assert.equal(body.get('client_secret'), 'sec');
  assert.deepEqual(calls[1].verify, { issuers: GOOGLE.issuers, audience: gCreds.clientId });
});
test('Google: nonce incorrecto o ausente → invalid_token (replay)', async () => {
  for (const claims of [{ sub: '1', nonce: 'otro' }, { sub: '1' }, { sub: '1', nonce: 5 }])
    await assert.rejects(google(claims).p.completeLogin(gIn), (e: any) => e.reason === 'invalid_token');
});
test('Google: firma/iss/aud/exp inválidos (la librería lanza) → invalid_token', async () => {
  await assert.rejects(google(new Error('JWTClaimValidationFailed')).p.completeLogin(gIn), (e: any) => e.reason === 'invalid_token');
});
test('Google: sin id_token, sin sub o endpoint caído', async () => {
  await assert.rejects(google({}, {}).p.completeLogin(gIn), (e: any) => e.reason === 'invalid_token');
  await assert.rejects(google({ nonce: gIn.nonce }).p.completeLogin(gIn), (e: any) => e.reason === 'invalid_token');
  const down = new GoogleProvider(gCreds, async () => ({}), () => Promise.reject(new Error('net')));
  await assert.rejects(down.completeLogin(gIn), (e: any) => e.reason === 'provider_unavailable');
  const bad = new GoogleProvider(gCreds, async () => ({}), () => Promise.resolve({ ok: false, status: 400, json: async () => ({}) }));
  await assert.rejects(bad.completeLogin(gIn), (e: any) => e.reason === 'provider_error');
});
test('Google: email_verified como cadena "true" se acepta; false/ausente no', async () => {
  assert.equal((await google({ sub: '1', nonce: gIn.nonce, email: 'a@b.c', email_verified: 'true' }).p.completeLogin(gIn)).emailVerified, true);
  assert.equal((await google({ sub: '1', nonce: gIn.nonce, email: 'a@b.c' }).p.completeLogin(gIn)).emailVerified, false);
});

// ---------------- GitHub (OAuth2) ----------------
function github(routes: Record<string, any>) {
  const calls: any[] = [];
  const http: FetchLike = (url, init) => { calls.push({ url, init }); const r = routes[url]; return r instanceof Error ? Promise.reject(r) : Promise.resolve({ ok: r?.ok ?? true, status: r?.status ?? 200, json: async () => r?.body ?? r }); };
  return { p: new GitHubProvider({ clientId: 'gid', clientSecret: 'gsec' }, http), calls };
}
const ghIn = { code: 'abc', codeVerifier: 'ver', nonce: 'unused', redirectUri: 'https://cg.example.org/api/auth/oauth/github/callback' };
test('GitHub: URL con state + PKCE y scopes mínimos', () => {
  const q = new URL(github({}).p.buildAuthUrl({ state: 's', nonce: 'n', codeChallenge: 'c', redirectUri: ghIn.redirectUri })).searchParams;
  assert.deepEqual([q.get('code_challenge_method'), q.get('state'), q.get('scope'), q.get('allow_signup')], ['S256', 's', 'read:user user:email', 'false']);
  assert.equal(q.get('nonce'), null);
});
test('GitHub: usa id numérico como subject y SOLO el correo primario verificado de /user/emails', async () => {
  const { p, calls } = github({
    'https://github.com/login/oauth/access_token': { access_token: 'tok' },
    'https://api.github.com/user': { id: 4242, login: 'octo', name: 'Octo Cat', email: 'publico-no-verificado@x.com', avatar_url: 'https://a/b' },
    'https://api.github.com/user/emails': [
      { email: 'viejo@x.com', primary: false, verified: true }, { email: 'sinverificar@x.com', primary: true, verified: false } ],
  });
  let prof = await p.completeLogin(ghIn);
  assert.equal(prof.subject, '4242'); assert.equal(prof.email, undefined); assert.equal(prof.emailVerified, false);   // ninguno es primario+verificado
  const ok = github({
    'https://github.com/login/oauth/access_token': { access_token: 'tok' }, 'https://api.github.com/user': { id: 4242, login: 'octo' },
    'https://api.github.com/user/emails': [{ email: 'Main@X.com', primary: true, verified: true }],
  });
  prof = await ok.p.completeLogin(ghIn);
  assert.deepEqual([prof.email, prof.emailVerified, prof.name], ['main@x.com', true, 'octo']);
  const tokenCall = JSON.parse(ok.calls[0].init.body); assert.equal(tokenCall.code_verifier, 'ver'); assert.equal(tokenCall.client_secret, 'gsec');
  assert.equal(ok.calls[1].init.headers.Authorization, 'Bearer tok');
  assert.ok(calls.length === 3);
});
test('GitHub: error en el canje (200 con {error}), /user caído o /user/emails sin permiso', async () => {
  await assert.rejects(github({ 'https://github.com/login/oauth/access_token': { error: 'bad_verification_code' } }).p.completeLogin(ghIn), (e: any) => e.reason === 'provider_error');
  await assert.rejects(github({ 'https://github.com/login/oauth/access_token': { access_token: 't' }, 'https://api.github.com/user': { ok: false, status: 401 } }).p.completeLogin(ghIn), (e: any) => e.reason === 'provider_error');
  await assert.rejects(github({ 'https://github.com/login/oauth/access_token': new Error('net') }).p.completeLogin(ghIn), (e: any) => e.reason === 'provider_unavailable');
  const noEmails = await github({ 'https://github.com/login/oauth/access_token': { access_token: 't' }, 'https://api.github.com/user': { id: 1 }, 'https://api.github.com/user/emails': { ok: false, status: 403 } }).p.completeLogin(ghIn);
  assert.equal(noEmails.emailVerified, false);
});

// ---------------- compatibilidad: contrato de sesión (Angular, microservicios y ESP8266) ----------------

test('contrato de login: mismos campos que la Fase 3 (el ESP8266 lee `rol` y `token`) y JWT válido para el resto de servicios', () => {
  const KEY = 'k'.repeat(40);
  const operador = { id: 7, username: 'esp8266_climguard', role: { name: 'Operador', permissions: ['dashboard.view', 'audit.write'] } };
  const s = buildSession(operador, { issuer: 'climguard-auth', audience: 'climguard-api', ttlSeconds: 1800, key: KEY });
  assert.deepEqual(Object.keys(s), ['usuarioId', 'usuario', 'token', 'mensaje', 'rol', 'permissions', 'expiresAt']);
  assert.equal(s.rol, 'Operador');                                   // el sketch compara con strcmp(rol, "Operador")
  assert.ok(typeof s.token === 'string' && s.token.split('.').length === 3);
  const c = verifyToken(s.token, { key: KEY, issuer: 'climguard-auth', audience: 'climguard-api' });
  assert.equal(c.role, 'Operador'); assert.equal(c.sub, '7'); assert.equal(c.preferred_username, 'esp8266_climguard');
  assert.deepEqual(c.permissions, operador.role.permissions);
  assert.equal(c['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], 'Operador');   // lo lee Alert (Java) y .NET
});
test('una cuenta OAuth (rol Consulta) obtiene el mismo formato de token pero sin rol de escritura de lecturas', () => {
  const KEY = 'k'.repeat(40);
  const s = buildSession({ id: 20, username: 'google_ab12cd34ef56', role: { name: OAUTH_DEFAULT_ROLE, permissions: ['dashboard.view', 'audit.write'] } },
    { issuer: 'i', audience: 'a', ttlSeconds: 60, key: KEY });
  assert.equal(verifyToken(s.token, { key: KEY, issuer: 'i', audience: 'a' }).role, 'Consulta');   // Sensor exige Administrador/Operador en POST /api/readings
});
