import { DataSource } from 'typeorm';
import { sha256Hex } from './crypto';
import { OAUTH_DEFAULT_ROLE } from './core';
import { ExternalProfile, UserPort, UserRecord } from './types';
import { ExternalIdentity, User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

const rec = (u: User): UserRecord => ({ id: u.id, username: u.username, active: u.active });

export class TypeOrmUserPort implements UserPort {
  constructor(private ds: DataSource) {}

  async findByIdentity(provider: string, subject: string) {
    const i = await this.ds.getRepository(ExternalIdentity).findOne({ where: { provider, subject }, relations: { user: true } });
    return i?.user ? rec(i.user) : null;
  }
  async findById(id: number) {
    const u = await this.ds.getRepository(User).findOne({ where: { id } });
    return u ? rec(u) : null;
  }

  /** Usuario nuevo con rol Consulta (fijo). El username NO sale del correo: evita suplantar a 'admin' con admin@gmail.com. */
  async provision(p: ExternalProfile) {
    return this.ds.transaction(async (m) => {
      const role = await m.getRepository(Role).findOne({ where: { name: OAUTH_DEFAULT_ROLE } });
      if (!role) throw new Error(`No existe el rol ${OAUTH_DEFAULT_ROLE}`);
      const u = await m.getRepository(User).save(m.getRepository(User).create({
        username: `${p.provider}_${sha256Hex(`${p.provider}:${p.subject}`).slice(0, 12)}`,
        fullName: (p.name || p.email || `${p.provider} user`).slice(0, 200),
        passwordHash: null, active: true, roleId: role.id, lastAccess: new Date(),
      }));
      await m.getRepository(ExternalIdentity).save(this.toRow(u.id, p, m.getRepository(ExternalIdentity).create()));
      return rec(u);
    });
  }

  async link(userId: number, p: ExternalProfile) {
    const repo = this.ds.getRepository(ExternalIdentity);
    const existing = await repo.findOne({ where: { provider: p.provider, subject: p.subject } });
    if (existing) return existing.userId === userId ? 'linked' as const : 'in_use' as const;
    try { await repo.save(this.toRow(userId, p, repo.create())); return 'linked' as const; }
    catch { return 'in_use' as const; }   // carrera por la unicidad (provider, subject)
  }

  async touchIdentity(p: ExternalProfile) {
    await this.ds.getRepository(ExternalIdentity).update({ provider: p.provider, subject: p.subject }, {
      email: p.email ?? null, emailVerified: p.emailVerified, displayName: p.name?.slice(0, 200) ?? null,
      avatarUrl: p.avatarUrl?.slice(0, 500) ?? null, lastLoginAt: new Date(),
    });
    const i = await this.ds.getRepository(ExternalIdentity).findOne({ where: { provider: p.provider, subject: p.subject } });
    if (i) await this.ds.getRepository(User).update(i.userId, { lastAccess: new Date() });
  }

  private toRow(userId: number, p: ExternalProfile, row: ExternalIdentity): ExternalIdentity {
    return Object.assign(row, {
      userId, provider: p.provider, subject: p.subject, email: p.email ?? null, emailVerified: p.emailVerified,
      displayName: p.name?.slice(0, 200) ?? null, avatarUrl: p.avatarUrl?.slice(0, 500) ?? null, lastLoginAt: new Date(),
    });
  }
}
