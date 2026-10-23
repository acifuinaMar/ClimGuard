import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditClient } from './audit';
import { DEFAULT_ROLES } from './common/legacy';
import { signToken } from './common/jwt';
import { DUMMY_HASH, hashPassword, isLegacyHash, verifyPassword } from './common/password';
import { Config } from './config';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

export interface UserInput { nombreCompleto?: string; nombreUsuario?: string; password?: string; passwordHash?: string; activo?: boolean; rolId?: number; usuarioLogeado?: number }

@Injectable()
export class AuthService {
  constructor(
    private cfg: Config, private audit: AuditClient,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Role) private roles: Repository<Role>,
  ) {}

  async login(username: string, password: string) {
    const fail = { usuarioId: 0, usuario: '', token: '', mensaje: 'Usuario o contraseña incorrectos.', message: 'Usuario o contraseña incorrectos.' };
    const user = username ? await this.users.findOne({ where: { username: username.trim() } }) : null;
    const ok = verifyPassword(password ?? '', user?.passwordHash ?? DUMMY_HASH) && !!user;
    if (!user || !ok || !user.active) {
      this.audit.emit('LOGIN_FAILED', 'Auth', { id: user?.id ?? 'anon', username: username ?? '' }, { motivo: user && ok ? 'inactivo' : 'credenciales' });
      throw new UnauthorizedException(fail);
    }
    const patch: Partial<User> = { lastAccess: new Date() };
    if (user.passwordHash && isLegacyHash(user.passwordHash)) patch.passwordHash = hashPassword(password);
    await this.users.update(user.id, patch);
    const { token, expiresAt } = signToken({
      sub: String(user.id), username: user.username, role: user.role.name, permissions: user.role.permissions,
      issuer: this.cfg.issuer, audience: this.cfg.audience, ttlSeconds: this.cfg.ttlSeconds, key: this.cfg.jwtKey,
    });
    this.audit.emit('LOGIN', 'Auth', { id: user.id, username: user.username }, { descripcion: 'Inicio de sesión' });
    return { usuarioId: user.id, usuario: user.username, token, mensaje: 'Inicio de sesión correcto.', rol: user.role.name,
             permissions: user.role.permissions, expiresAt: expiresAt.toISOString() };
  }

  list() { return this.users.find({ order: { id: 'ASC' } }); }

  async get(id: number) {
    const u = await this.users.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async create(i: UserInput, actor: { id: number; username: string }) {
    const username = (i.nombreUsuario ?? '').trim();
    const plain = i.password ?? i.passwordHash ?? '';
    if (!username || !i.nombreCompleto?.trim()) throw new BadRequestException('Nombre y usuario son obligatorios');
    if (plain.length < 8) throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    if (!i.rolId || !(await this.roles.existsBy({ id: i.rolId }))) throw new BadRequestException('Rol inválido');
    if (await this.users.existsBy({ username })) throw new ConflictException('El nombre de usuario ya existe');
    const saved = await this.users.save(this.users.create({
      username, fullName: i.nombreCompleto.trim(), passwordHash: hashPassword(plain), active: i.activo ?? true,
      roleId: i.rolId, createdBy: actor.id,
    }));
    this.audit.emit('USER_CREATED', 'Usuario', actor, { id: saved.id, descripcion: `Usuario ${username} creado` });
    return this.get(saved.id);
  }

  async update(id: number, i: UserInput, actor: { id: number; username: string }) {
    const u = await this.get(id);
    if (i.nombreCompleto?.trim()) u.fullName = i.nombreCompleto.trim();
    if (i.nombreUsuario?.trim() && i.nombreUsuario.trim() !== u.username) {
      if (await this.users.existsBy({ username: i.nombreUsuario.trim() })) throw new ConflictException('El nombre de usuario ya existe');
      u.username = i.nombreUsuario.trim();
    }
    const plain = i.password ?? i.passwordHash;
    if (plain) {
      if (plain.length < 8) throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
      if (!isLegacyHash(plain)) u.passwordHash = hashPassword(plain);
    }
    if (typeof i.activo === 'boolean') u.active = i.activo;
    if (i.rolId && i.rolId !== u.roleId) {
      if (!(await this.roles.existsBy({ id: i.rolId }))) throw new BadRequestException('Rol inválido');
      u.roleId = i.rolId; u.role = (await this.roles.findOneBy({ id: i.rolId }))!;
    }
    u.updatedBy = actor.id; u.updatedAt = new Date();
    await this.users.save(u);
    this.audit.emit('USER_UPDATED', 'Usuario', actor, { id, descripcion: `Usuario ${u.username} actualizado` });
    return this.get(id);
  }

  async remove(id: number, actor: { id: number; username: string }) {
    if (id === actor.id) throw new BadRequestException('No puede eliminar su propio usuario');
    const u = await this.get(id);
    await this.users.delete(id);
    this.audit.emit('USER_DELETED', 'Usuario', actor, { id, descripcion: `Usuario ${u.username} eliminado` });
  }

  /** Roles y usuarios iniciales. Los usuarios demo solo con SEED_DEFAULT_USERS=true (nunca en producción). */
  async seed() {
    for (const r of DEFAULT_ROLES) await this.roles.save(this.roles.create(r));
    if (!this.cfg.seedDefaults) return;
    const demo = [
      { username: 'admin', fullName: 'Administrador del Sistema', hash: '3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2', roleId: 1 },
      { username: 'JDoe', fullName: 'John Michael Doe Smith', hash: '34a0d703ced482fcdcbdd2ece107ff84b00edd5d4065ac56529a233865099dd0', roleId: 2 },
    ];
    for (const d of demo) {
      if (!(await this.users.existsBy({ username: d.username })))
        await this.users.save(this.users.create({ username: d.username, fullName: d.fullName, passwordHash: d.hash, roleId: d.roleId, active: true }));
    }
  }
}
