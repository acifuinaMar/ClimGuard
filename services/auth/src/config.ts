export class Config {
  port!: number; jwtKey!: string; issuer!: string; audience!: string; ttlSeconds!: number;
  db!: { host: string; port: number; user: string; password: string; database: string; ssl: boolean };
  auditUrl!: string; internalKey!: string; seedDefaults!: boolean;
}
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const need = (k: string) => { const v = env[k]; if (!v) throw new Error(`Falta variable obligatoria: ${k}`); return v; };
  const jwtKey = need('JWT_KEY');
  if (Buffer.byteLength(jwtKey) < 32) throw new Error('JWT_KEY debe tener al menos 32 bytes');
  return Object.assign(new Config(), {
    port: Number(env.PORT ?? 3000), jwtKey, issuer: need('JWT_ISSUER'), audience: need('JWT_AUDIENCE'),
    ttlSeconds: Number(env.JWT_EXPIRATION_MINUTES ?? 30) * 60,
    db: { host: need('POSTGRES_HOST'), port: Number(env.POSTGRES_PORT ?? 5432), user: need('POSTGRES_USER'),
          password: need('POSTGRES_PASSWORD'), database: env.POSTGRES_DB ?? 'climguard_auth', ssl: env.POSTGRES_SSL === 'true' },
    auditUrl: env.AUDIT_API_URL ?? '', internalKey: env.INTERNAL_API_KEY ?? '',
    seedDefaults: env.SEED_DEFAULT_USERS === 'true',
  });
}
