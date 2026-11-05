import { safeEqual } from './crypto';
import { AuthUrlInput, CompleteInput, ExternalProfile, FetchLike, IdTokenVerifier, OAuthError, OAuthProvider } from './types';
import { ProviderCreds } from './oauth.config';

export const GOOGLE = {
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs',
  issuers: ['https://accounts.google.com', 'accounts.google.com'],
};

/** Google vía OpenID Connect: Authorization Code + PKCE(S256) + state + nonce; el ID Token se valida con `jose`. */
export class GoogleProvider implements OAuthProvider {
  readonly id = 'google'; readonly label = 'Google';
  constructor(private creds: ProviderCreds, private verify: IdTokenVerifier, private http: FetchLike) {}

  buildAuthUrl(i: AuthUrlInput): string {
    const q = new URLSearchParams({
      response_type: 'code', client_id: this.creds.clientId, redirect_uri: i.redirectUri, scope: 'openid email profile',
      state: i.state, nonce: i.nonce, code_challenge: i.codeChallenge, code_challenge_method: 'S256', prompt: 'select_account',
    });
    return `${GOOGLE.authUrl}?${q}`;
  }

  async completeLogin(i: CompleteInput): Promise<ExternalProfile> {
    let res;
    try {
      res = await this.http(GOOGLE.tokenUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({
          grant_type: 'authorization_code', code: i.code, redirect_uri: i.redirectUri, client_id: this.creds.clientId,
          client_secret: this.creds.clientSecret, code_verifier: i.codeVerifier,
        }).toString(),
        signal: AbortSignal.timeout(8000),
      });
    } catch { throw new OAuthError('provider_unavailable', 'google token endpoint'); }
    if (!res.ok) throw new OAuthError('provider_error', `google token status ${res.status}`);
    const body = await res.json().catch(() => null);
    const idToken = body?.id_token;
    if (typeof idToken !== 'string' || !idToken) throw new OAuthError('invalid_token', 'sin id_token');

    let claims: Record<string, unknown>;
    try { claims = await this.verify(idToken, { issuers: GOOGLE.issuers, audience: this.creds.clientId }); }
    catch { throw new OAuthError('invalid_token', 'id_token no válido (firma/iss/aud/exp)'); }

    // El nonce NO lo valida la librería: ata el ID Token a ESTA petición (anti-replay).
    if (typeof claims.nonce !== 'string' || !safeEqual(claims.nonce, i.nonce)) throw new OAuthError('invalid_token', 'nonce');
    if (typeof claims.sub !== 'string' || !claims.sub) throw new OAuthError('invalid_token', 'sin sub');

    const ev = claims.email_verified;
    return {
      provider: this.id, subject: claims.sub,
      email: typeof claims.email === 'string' ? claims.email.toLowerCase() : undefined,
      emailVerified: ev === true || ev === 'true',
      name: typeof claims.name === 'string' ? claims.name : undefined,
      avatarUrl: typeof claims.picture === 'string' ? claims.picture : undefined,
    };
  }
}
