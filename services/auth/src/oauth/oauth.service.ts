import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuditClient } from '../audit';
import { AuthService } from '../auth.service';
import { Config } from '../config';
import { OAuthCore } from './core';
import { GitHubProvider } from './github';
import { GOOGLE, GoogleProvider } from './google';
import { joseVerifier } from './jose-verifier';
import { PgCodeStore, PgFlowStore } from './stores';
import { FetchLike, OAuthProvider } from './types';
import { TypeOrmUserPort } from './user-port';

@Injectable()
export class OAuthService {
  readonly core: OAuthCore;
  private log = new Logger('OAuth');

  constructor(private cfg: Config, private auth: AuthService, audit: AuditClient, @InjectDataSource() ds: DataSource) {
    const http: FetchLike = (url, init) => fetch(url, init);
    const providers: OAuthProvider[] = [];
    const o = cfg.oauth;
    if (o.google) providers.push(new GoogleProvider(o.google, joseVerifier(GOOGLE.jwksUrl), http));
    if (o.github) providers.push(new GitHubProvider(o.github, http));
    this.log.log(`Proveedores OAuth habilitados: ${providers.map((p) => p.id).join(', ') || 'ninguno'}; auto-registro=${o.autoProvision}`);
    this.core = new OAuthCore({
      cfg: o, providers, flows: new PgFlowStore(ds), codes: new PgCodeStore(ds), users: new TypeOrmUserPort(ds),
      audit: { emit: (a, u, d) => audit.emit(a, 'Auth', u, d) },
    });
  }

  /** Canjea el código y emite el MISMO payload y JWT que el login local. */
  async exchange(code: string | undefined, binding: string | undefined) {
    const u = await this.core.exchange(code, binding);
    return u ? this.auth.issueSessionById(u.id) : null;
  }
}
