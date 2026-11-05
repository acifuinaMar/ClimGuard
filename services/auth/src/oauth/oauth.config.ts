export interface ProviderCreds { clientId: string; clientSecret: string }
export interface OAuthConfig {
  /** URL pública del sitio (la que ve el navegador), sin “/” final. Con ella se arman los redirect URI. */
  publicBaseUrl: string;
  /** Dónde vive Angular; por defecto el mismo origen. */
  frontendUrl: string;
  cookieSecure: boolean;
  autoProvision: boolean;
  allowedEmailDomains: string[];
  flowTtlSeconds: number; codeTtlSeconds: number;
  google?: ProviderCreds; github?: ProviderCreds;
}

export function loadOAuthConfig(env: NodeJS.ProcessEnv = process.env): OAuthConfig {
  const pair = (p: string): ProviderCreds | undefined => {
    const clientId = env[`${p}_CLIENT_ID`]?.trim(), clientSecret = env[`${p}_CLIENT_SECRET`]?.trim();
    if (!clientId && !clientSecret) return undefined;
    if (!clientId || !clientSecret) throw new Error(`${p}_CLIENT_ID y ${p}_CLIENT_SECRET deben definirse juntas`);
    return { clientId, clientSecret };
  };
  const google = pair('GOOGLE'), github = pair('GITHUB');
  const base = (env.OAUTH_PUBLIC_BASE_URL ?? '').trim().replace(/\/+$/, '');
  if ((google || github) && !base) throw new Error('OAUTH_PUBLIC_BASE_URL es obligatoria cuando hay un proveedor OAuth configurado');
  if (base) {
    let u: URL; try { u = new URL(base); } catch { throw new Error('OAUTH_PUBLIC_BASE_URL no es una URL válida'); }
    const local = ['localhost', '127.0.0.1'].includes(u.hostname);
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) throw new Error('OAUTH_PUBLIC_BASE_URL debe ser https (http solo para localhost)');
    if (u.pathname !== '/' || u.search || u.hash) throw new Error('OAUTH_PUBLIC_BASE_URL no debe llevar ruta ni parámetros');
  }
  const frontendUrl = (env.OAUTH_FRONTEND_URL?.trim() || base).trim().replace(/\/+$/, '');
  return {
    publicBaseUrl: base, frontendUrl,
    cookieSecure: base.startsWith('https://'),
    autoProvision: env.OAUTH_AUTO_PROVISION === 'true',
    allowedEmailDomains: (env.OAUTH_ALLOWED_EMAIL_DOMAINS ?? '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean),
    flowTtlSeconds: Number(env.OAUTH_FLOW_TTL_SECONDS ?? 600), codeTtlSeconds: Number(env.OAUTH_CODE_TTL_SECONDS ?? 60),
    google, github,
  };
}

export const redirectUri = (c: OAuthConfig, provider: string) => `${c.publicBaseUrl}/api/auth/oauth/${provider}/callback`;
