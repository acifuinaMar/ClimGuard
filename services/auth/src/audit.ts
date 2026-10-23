import { Injectable, Logger } from '@nestjs/common';
import { Config } from './config';

@Injectable()
export class AuditClient {
  private log = new Logger('Audit');
  constructor(private cfg: Config) {}
  /** Fire-and-forget: la auditoría nunca debe tumbar el login. */
  emit(action: string, resource: string, user: { id: string | number; username: string }, detail: Record<string, unknown> = {}) {
    if (!this.cfg.auditUrl) return;
    fetch(`${this.cfg.auditUrl.replace(/\/$/, '')}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Key': this.cfg.internalKey },
      body: JSON.stringify({ action, resource, detail, userId: String(user.id), user: user.username }),
      signal: AbortSignal.timeout(3000),
    }).catch((e) => this.log.warn(`No se pudo auditar ${action}: ${e?.name}`));
  }
}
