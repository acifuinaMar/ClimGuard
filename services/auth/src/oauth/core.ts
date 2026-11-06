import { pkceChallenge, randomToken, sha256Hex, TOKEN_RE } from './crypto';
import { OAuthConfig, redirectUri } from './oauth.config';
import { AuditPort, CodeStore, ExternalProfile, FlowStore, OAuthError, OAuthErrorReason, OAuthProvider, UserPort, UserRecord } from './types';

/** Rol de las cuentas aprovisionadas por OAuth. Constante A PROPÓSITO: no es configurable y nunca es Administrador. */
export const OAUTH_DEFAULT_ROLE = 'Consulta';

export type CallbackResult =
  | { kind: 'login'; code: string }
  | { kind: 'linked' }
  | { kind: 'error'; reason: OAuthErrorReason };

export interface CoreDeps {
  cfg: OAuthConfig; providers: OAuthProvider[]; flows: FlowStore; codes: CodeStore; users: UserPort; audit: AuditPort;
  now?: () => Date;
}

/** Orquesta el flujo. Sin dependencias de Nest/TypeORM: se prueba con fakes. */
export class OAuthCore {
  private providers = new Map<string, OAuthProvider>();
  private now: () => Date;
  constructor(private d: CoreDeps) { d.providers.forEach((p) => this.providers.set(p.id, p)); this.now = d.now ?? (() => new Date()); }

  listProviders() { return [...this.providers.values()].map((p) => ({ id: p.id, label: p.label })); }

  /** Paso 1: crea state/nonce/PKCE y los guarda en servidor (solo hash del state), ligados al navegador por `binding`. */
  async start(providerId: string, opts: { linkUserId?: number } = {}): Promise<{ url: string; binding: string }> {
    const p = this.providers.get(providerId);
    if (!p) throw new OAuthError('unknown_provider');
    const state = randomToken(), nonce = randomToken(), codeVerifier = randomToken(), binding = randomToken();
    await this.d.flows.create({
      stateHash: sha256Hex(state), provider: p.id, nonce, codeVerifier, bindingHash: sha256Hex(binding),
      linkUserId: opts.linkUserId ?? null, expiresAt: new Date(this.now().getTime() + this.d.cfg.flowTtlSeconds * 1000),
    });
    const url = p.buildAuthUrl({ state, nonce, codeChallenge: pkceChallenge(codeVerifier), redirectUri: redirectUri(this.d.cfg, p.id) });
    return { url, binding };
  }

  /** Paso 2: el proveedor vuelve aquí. NUNCA lanza: siempre devuelve un resultado con motivo fijo. */
  async callback(providerId: string, q: { code?: string; state?: string; error?: string }, binding: string | undefined): Promise<CallbackResult> {
    const p = this.providers.get(providerId);
    if (!p) return { kind: 'error', reason: 'unknown_provider' };
    if (!q.state || !TOKEN_RE.test(q.state) || !binding || !TOKEN_RE.test(binding)) return { kind: 'error', reason: 'invalid_state' };
    const bindingHash = sha256Hex(binding);
    const flow = await this.d.flows.consume(sha256Hex(q.state), bindingHash, p.id, this.now());
    if (!flow) { this.fail(p.id, 'invalid_state'); return { kind: 'error', reason: 'invalid_state' }; }
    if (q.error) { this.fail(p.id, 'provider_error', { motivo: 'denegado_o_error_del_proveedor' }); return { kind: 'error', reason: 'provider_error' }; }
    if (!q.code || q.code.length > 2048) return { kind: 'error', reason: 'invalid_state' };

    try {
      const profile = await p.completeLogin({ code: q.code, codeVerifier: flow.codeVerifier, nonce: flow.nonce, redirectUri: redirectUri(this.d.cfg, p.id) });
      return flow.linkUserId !== null
        ? await this.doLink(flow.linkUserId, profile)
        : await this.doLogin(profile, bindingHash);
    } catch (e) {
      const reason: OAuthErrorReason = e instanceof OAuthError ? e.reason : 'provider_unavailable';
      this.fail(p.id, reason, { detalle: e instanceof OAuthError ? e.message : 'error_inesperado' });
      return { kind: 'error', reason };
    }
  }

  /** Paso 3: canje del código temporal (POST). Un solo uso, hash en BD, ligado al navegador que inició el flujo. */
  async exchange(code: string | undefined, binding: string | undefined): Promise<UserRecord | null> {
    if (!code || !binding || !TOKEN_RE.test(code) || !TOKEN_RE.test(binding)) return null;
    const userId = await this.d.codes.consume(sha256Hex(code), sha256Hex(binding), this.now());
    if (userId === null) return null;
    const user = await this.d.users.findById(userId);
    return user && user.active ? user : null;
  }

  private async doLogin(profile: ExternalProfile, bindingHash: string): Promise<CallbackResult> {
    let user = await this.d.users.findByIdentity(profile.provider, profile.subject);
    if (user) {
      if (!user.active) throw new OAuthError('account_disabled');
      await this.d.users.touchIdentity(profile);
    } else {
      // Sin identidad conocida. NUNCA se enlaza a una cuenta local existente por coincidencia de correo.
      if (!this.d.cfg.autoProvision) throw new OAuthError('not_registered');
      if (!profile.email || !profile.emailVerified) throw new OAuthError('email_not_verified');
      const dom = profile.email.split('@')[1] ?? '';
      const allow = this.d.cfg.allowedEmailDomains;
      if (allow.length && !allow.includes(dom)) throw new OAuthError('domain_not_allowed');
      try { user = await this.d.users.provision(profile); }
      catch (e) {   // carrera: otro callback creó la misma identidad un instante antes
        user = await this.d.users.findByIdentity(profile.provider, profile.subject);
        if (!user) throw e;
      }
      this.d.audit.emit('OAUTH_USER_PROVISIONED', user, { proveedor: profile.provider, rol: OAUTH_DEFAULT_ROLE });
    }
    const code = randomToken();
    await this.d.codes.create({ codeHash: sha256Hex(code), userId: user.id, bindingHash, expiresAt: new Date(this.now().getTime() + this.d.cfg.codeTtlSeconds * 1000) });
    this.d.audit.emit('OAUTH_LOGIN', user, { proveedor: profile.provider });
    return { kind: 'login', code };
  }

  private async doLink(userId: number, profile: ExternalProfile): Promise<CallbackResult> {
    const user = await this.d.users.findById(userId);
    if (!user || !user.active) throw new OAuthError('account_disabled');
    if ((await this.d.users.link(userId, profile)) === 'in_use') throw new OAuthError('identity_in_use');
    this.d.audit.emit('OAUTH_IDENTITY_LINKED', user, { proveedor: profile.provider });
    return { kind: 'linked' };
  }

  private fail(provider: string, reason: string, extra: Record<string, unknown> = {}) {
    this.d.audit.emit('OAUTH_LOGIN_FAILED', { id: 'anon', username: '' }, { proveedor: provider, motivo: reason, ...extra });
  }
}
