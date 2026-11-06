import { AuthUrlInput, CompleteInput, ExternalProfile, FetchLike, OAuthError, OAuthProvider } from './types';
import { ProviderCreds } from './oauth.config';

export const GITHUB = {
  authUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  userUrl: 'https://api.github.com/user',
  emailsUrl: 'https://api.github.com/user/emails',
};

/**
 * GitHub NO es OIDC: es OAuth 2.0 puro (no entrega ID Token), por eso no hay nonce.
 * Protegido con state + PKCE (S256). La identidad sale de la API: `id` numérico estable.
 * Correo: SOLO se acepta el principal Y verificado de /user/emails; el `email` de /user es público y editable.
 */
export class GitHubProvider implements OAuthProvider {
  readonly id = 'github'; readonly label = 'GitHub';
  constructor(private creds: ProviderCreds, private http: FetchLike) {}

  buildAuthUrl(i: AuthUrlInput): string {
    const q = new URLSearchParams({
      client_id: this.creds.clientId, redirect_uri: i.redirectUri, scope: 'read:user user:email', state: i.state,
      code_challenge: i.codeChallenge, code_challenge_method: 'S256', allow_signup: 'false',
    });
    return `${GITHUB.authUrl}?${q}`;
  }

  async completeLogin(i: CompleteInput): Promise<ExternalProfile> {
    const tokenRes = await this.call(GITHUB.tokenUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: this.creds.clientId, client_secret: this.creds.clientSecret, code: i.code,
                             redirect_uri: i.redirectUri, code_verifier: i.codeVerifier }),
    });
    const accessToken = tokenRes.access_token;   // GitHub responde 200 con {error:...} en fallos
    if (typeof accessToken !== 'string' || !accessToken || tokenRes.error) throw new OAuthError('provider_error', `github token: ${String(tokenRes.error ?? 'sin access_token')}`);

    const auth = { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'ClimGuard-Auth' };
    const user = await this.call(GITHUB.userUrl, { headers: auth });
    if (typeof user.id !== 'number' && typeof user.id !== 'string') throw new OAuthError('invalid_token', 'github sin id');

    let email: string | undefined; let verified = false;
    try {
      const list = await this.call(GITHUB.emailsUrl, { headers: auth });
      const primary = Array.isArray(list) ? list.find((e: any) => e?.primary === true && e?.verified === true && typeof e.email === 'string') : undefined;
      if (primary) { email = primary.email.toLowerCase(); verified = true; }
    } catch { /* sin correo verificado: el servicio decidirá (no se provisiona) */ }

    return {
      provider: this.id, subject: String(user.id), email, emailVerified: verified,
      name: typeof user.name === 'string' && user.name ? user.name : typeof user.login === 'string' ? user.login : undefined,
      avatarUrl: typeof user.avatar_url === 'string' ? user.avatar_url : undefined,
    };
  }

  private async call(url: string, init: { method?: string; headers?: Record<string, string>; body?: string }): Promise<any> {
    let res;
    try { res = await this.http(url, { ...init, signal: AbortSignal.timeout(8000) }); }
    catch { throw new OAuthError('provider_unavailable', 'github'); }
    if (!res.ok) throw new OAuthError('provider_error', `github status ${res.status}`);
    const body = await res.json().catch(() => null);
    if (body === null) throw new OAuthError('provider_error', 'github respuesta no JSON');
    return body;
  }
}
