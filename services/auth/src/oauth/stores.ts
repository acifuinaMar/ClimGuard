import { CodeStore, FlowRow, FlowStore } from './types';

/** Lo mínimo que necesitamos de TypeORM DataSource (permite probar con otro driver). */
export interface Queryable { query(sql: string, params?: unknown[]): Promise<any> }

/**
 * Los consumos usan `WITH u AS (UPDATE … RETURNING …) SELECT … FROM u`: una sola sentencia atómica
 * (dos peticiones simultáneas con el mismo código/state: solo una obtiene fila) y devuelve filas planas.
 */
export class PgFlowStore implements FlowStore {
  constructor(private db: Queryable) {}
  async create(f: Parameters<FlowStore['create']>[0]) {
    // Limpieza oportunista de flujos vencidos (no hay job aparte).
    await this.db.query(`DELETE FROM oauth_flows WHERE expires_at < now() - interval '1 hour'`);
    await this.db.query(
      `INSERT INTO oauth_flows (state_hash, provider, nonce, code_verifier, binding_hash, link_user_id, expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [f.stateHash, f.provider, f.nonce, f.codeVerifier, f.bindingHash, f.linkUserId, f.expiresAt]);
  }
  async consume(stateHash: string, bindingHash: string, provider: string, now: Date): Promise<FlowRow | null> {
    const rows = await this.db.query(
      `WITH u AS (UPDATE oauth_flows SET consumed_at = $4
                   WHERE state_hash = $1 AND binding_hash = $2 AND provider = $3 AND consumed_at IS NULL AND expires_at > $4
                   RETURNING nonce, code_verifier, link_user_id)
       SELECT nonce, code_verifier, link_user_id FROM u`, [stateHash, bindingHash, provider, now]);
    const r = rows?.[0];
    return r ? { nonce: r.nonce, codeVerifier: r.code_verifier, linkUserId: r.link_user_id === null ? null : Number(r.link_user_id) } : null;
  }
}

export class PgCodeStore implements CodeStore {
  constructor(private db: Queryable) {}
  async create(c: Parameters<CodeStore['create']>[0]) {
    await this.db.query(`DELETE FROM oauth_login_codes WHERE expires_at < now() - interval '1 hour'`);
    await this.db.query(`INSERT INTO oauth_login_codes (code_hash, user_id, binding_hash, expires_at) VALUES ($1,$2,$3,$4)`,
      [c.codeHash, c.userId, c.bindingHash, c.expiresAt]);
  }
  async consume(codeHash: string, bindingHash: string, now: Date): Promise<number | null> {
    const rows = await this.db.query(
      `WITH u AS (UPDATE oauth_login_codes SET consumed_at = $3
                   WHERE code_hash = $1 AND binding_hash = $2 AND consumed_at IS NULL AND expires_at > $3
                   RETURNING user_id)
       SELECT user_id FROM u`, [codeHash, bindingHash, now]);
    return rows?.[0] ? Number(rows[0].user_id) : null;
  }
}
