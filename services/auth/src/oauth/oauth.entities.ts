import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/** Flujo de autorización en curso. Solo se guarda el HASH del state. Vida corta; consumo atómico. */
@Entity('oauth_flows')
export class OauthFlow {
  @PrimaryColumn({ name: 'state_hash', length: 64 }) stateHash: string;
  @Column({ length: 30 }) provider: string;
  @Column({ length: 100 }) nonce: string;
  @Column({ name: 'code_verifier', length: 128 }) codeVerifier: string;
  @Column({ name: 'binding_hash', length: 64 }) bindingHash: string;
  @Column({ name: 'link_user_id', type: 'int', nullable: true }) linkUserId: number | null;
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt: Date;
  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true }) consumedAt: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}

/** Código temporal de un solo uso que se canjea por el JWT de ClimGuard. Solo se guarda el HASH. */
@Entity('oauth_login_codes')
export class OauthLoginCode {
  @PrimaryColumn({ name: 'code_hash', length: 64 }) codeHash: string;
  @Column({ name: 'user_id' }) userId: number;
  @Column({ name: 'binding_hash', length: 64 }) bindingHash: string;
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt: Date;
  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true }) consumedAt: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}
