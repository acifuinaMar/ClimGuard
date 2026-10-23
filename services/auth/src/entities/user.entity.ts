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

/** Preparado para OAuth2/OIDC (Fase 4): un usuario local puede vincular identidades de un IdP externo. */
@Entity('external_identities')
@Unique(['provider', 'subject'])
export class ExternalIdentity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 60 }) provider: string;   // p. ej. 'google', 'azuread'
  @Column({ length: 200 }) subject: string;   // claim `sub` del IdP
  @Column({ name: 'user_id' }) userId: number;
  @ManyToOne(() => User, (u) => u.identities, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
}
