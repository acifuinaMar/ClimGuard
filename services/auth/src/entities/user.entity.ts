import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Index({ unique: true }) @Column({ length: 60 }) username: string;
  @Column({ name: 'full_name', length: 200 }) fullName: string;
  /** scrypt$... o SHA256-hex heredado (se reemplaza en el primer login correcto). */
  @Column({ name: 'password_hash', type: 'varchar', length: 300, nullable: true })
passwordHash: string | null;
  @Column({ default: true }) active: boolean;
  @Column({ name: 'role_id' }) roleId: number;
  @ManyToOne(() => Role, { eager: true }) @JoinColumn({ name: 'role_id' }) role: Role;
  @Column({ name: 'last_access', type: 'timestamptz', nullable: true }) lastAccess: Date | null;
  @Column({ name: 'created_by', type: 'int', nullable: true }) createdBy: number | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @Column({ name: 'updated_by', type: 'int', nullable: true }) updatedBy: number | null;
  @Column({ name: 'updated_at', type: 'timestamptz', nullable: true }) updatedAt: Date | null;
  @OneToMany(() => ExternalIdentity, (e) => e.user) identities: ExternalIdentity[];
}

/** Identidad en un proveedor externo (Google, GitHub…) vinculada a un usuario local. Se identifica por (provider, subject), nunca por correo. */
@Entity('external_identities')
@Unique(['provider', 'subject'])
export class ExternalIdentity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 60 }) provider: string;   // 'google' | 'github' | ...
  @Column({ length: 200 }) subject: string;   // `sub` (OIDC) o id numérico (GitHub): estable, no cambia con el correo
  @Index() @Column({ name: 'user_id' }) userId: number;
  @ManyToOne(() => User, (u) => u.identities, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
  /** Informativos (último valor visto). No se usan para autorizar. */
  @Column({ type: 'varchar', length: 320, nullable: true }) email: string | null;
  @Column({ name: 'email_verified', default: false }) emailVerified: boolean;
  @Column({ name: 'display_name', type: 'varchar', length: 200, nullable: true }) displayName: string | null;
  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true }) avatarUrl: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true }) lastLoginAt: Date | null;
}
