import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';

export enum RoleType {
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.MEMBER,
  })
  type: RoleType;

  @OneToMany(() => Permission, (permission) => permission.role)
  permissions: Permission[];
}
