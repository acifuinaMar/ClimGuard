import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryColumn() id: number;
  @Column({ unique: true, length: 50 }) name: string;
  /** Permisos que se emiten en el claim `permissions` del JWT. */
  @Column('text', { array: true, default: '{}' }) permissions: string[];
}
