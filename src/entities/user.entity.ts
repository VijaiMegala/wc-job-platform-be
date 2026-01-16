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
import { Role } from './role.entity';
import { Application } from './application.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  user_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  user_email: string;

  @Column({ type: 'varchar', length: 255 })
  user_password: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'uuid' })
  org_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Organization, (org) => org.users)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];
}

