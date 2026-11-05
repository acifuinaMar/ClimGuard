import { signToken } from './jwt';

export interface SessionUser { id: number; username: string; role: { name: string; permissions: string[] } }
export interface SessionOpts { issuer: string; audience: string; ttlSeconds: number; key: string }

/**
 * Contrato de sesión de ClimGuard: lo devuelven EL LOGIN LOCAL (/api/auth/login) y el canje OAuth.
 * Los nombres y el orden de campos NO deben cambiar: los consumen Angular y el firmware ESP8266
 * (que exige rol == "Operador" y lee `token`). El JWT es el mismo para ambos orígenes.
 */
export function buildSession(user: SessionUser, o: SessionOpts) {
  const { token, expiresAt } = signToken({
    sub: String(user.id), username: user.username, role: user.role.name, permissions: user.role.permissions,
    issuer: o.issuer, audience: o.audience, ttlSeconds: o.ttlSeconds, key: o.key,
  });
  return { usuarioId: user.id, usuario: user.username, token, mensaje: 'Inicio de sesión correcto.', rol: user.role.name,
           permissions: user.role.permissions, expiresAt: expiresAt.toISOString() };
}
