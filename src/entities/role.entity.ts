import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  role_id: string;

  @Column({ type: 'uuid' })
  org_id: string;

  @Column({ type: 'varchar', length: 255 })
  role_name: string;

  @Column({ type: 'text', nullable: true })
  role_access: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Organization, (org) => org.roles)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}

