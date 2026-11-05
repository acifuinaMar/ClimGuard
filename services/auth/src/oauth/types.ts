/** Motivos de error visibles para el navegador. Fijos a propósito: nunca se devuelve texto del proveedor. */
export type OAuthErrorReason =
  | 'unknown_provider' | 'invalid_state' | 'provider_error' | 'provider_unavailable' | 'invalid_token'
  | 'not_registered' | 'account_disabled' | 'email_not_verified' | 'domain_not_allowed' | 'identity_in_use';

export class OAuthError extends Error {
  constructor(public readonly reason: OAuthErrorReason, detail?: string) { super(detail ?? reason); }
}

/** Perfil normalizado devuelto por cualquier proveedor. `subject` es el identificador estable (no el correo). */
export interface ExternalProfile {
  provider: string; subject: string;
  email?: string; emailVerified: boolean; name?: string; avatarUrl?: string;
}

export interface AuthUrlInput { state: string; nonce: string; codeChallenge: string; redirectUri: string }
export interface CompleteInput { code: string; codeVerifier: string; nonce: string; redirectUri: string }

/** Para añadir un proveedor (Microsoft, GitLab…) basta con implementar esta interfaz y registrarlo. */
export interface OAuthProvider {
  readonly id: string; readonly label: string;
  buildAuthUrl(i: AuthUrlInput): string;
  completeLogin(i: CompleteInput): Promise<ExternalProfile>;
}

export type FetchLike = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string; signal?: AbortSignal }) =>
  Promise<{ ok: boolean; status: number; json(): Promise<any> }>;

/** Verifica un ID Token (firma, iss, aud, exp). La implementación real usa `jose` (jose-verifier.ts). */
export type IdTokenVerifier = (idToken: string, opts: { issuers: string[]; audience: string }) => Promise<Record<string, unknown>>;

// ---- Puertos (la lógica de negocio no conoce TypeORM ni Nest) ----
export interface FlowRow { nonce: string; codeVerifier: string; linkUserId: number | null }
export interface FlowStore {
  create(f: { stateHash: string; provider: string; nonce: string; codeVerifier: string; bindingHash: string; linkUserId: number | null; expiresAt: Date }): Promise<void>;
  /** Atómico: marca consumido y devuelve la fila solo si coincide state+navegador+proveedor, no está usado y no expiró. */
  consume(stateHash: string, bindingHash: string, provider: string, now: Date): Promise<FlowRow | null>;
}
export interface CodeStore {
  create(c: { codeHash: string; userId: number; bindingHash: string; expiresAt: Date }): Promise<void>;
  /** Atómico, de un solo uso, ligado al navegador. Devuelve el id de usuario. */
  consume(codeHash: string, bindingHash: string, now: Date): Promise<number | null>;
}
export interface UserRecord { id: number; username: string; active: boolean }
export interface UserPort {
  findByIdentity(provider: string, subject: string): Promise<UserRecord | null>;
  findById(id: number): Promise<UserRecord | null>;
  /** Crea usuario con rol Consulta (siempre) + identidad. Puede lanzar si hay carrera por unicidad. */
  provision(p: ExternalProfile): Promise<UserRecord>;
  link(userId: number, p: ExternalProfile): Promise<'linked' | 'in_use'>;
  touchIdentity(p: ExternalProfile): Promise<void>;
}
export interface AuditPort { emit(action: string, user: { id: string | number; username: string }, detail: Record<string, unknown>): void }
