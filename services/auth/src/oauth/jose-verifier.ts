import { createRemoteJWKSet, jwtVerify } from 'jose';
import { IdTokenVerifier } from './types';

/**
 * Verificación del ID Token con la librería `jose` (no se implementa criptografía a mano):
 * firma contra el JWKS de Google (con caché y rotación de llaves), `iss`, `aud`, `exp`/`nbf`.
 * Solo RS256: evita ataques de confusión de algoritmo (alg=none / HS256).
 */
export function joseVerifier(jwksUrl: string): IdTokenVerifier {
  const jwks = createRemoteJWKSet(new URL(jwksUrl), { timeoutDuration: 5000, cooldownDuration: 30000 });
  return async (idToken, opts) => {
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer: opts.issuers, audience: opts.audience, algorithms: ['RS256'], clockTolerance: 30,
    });
    return payload as Record<string, unknown>;
  };
}
