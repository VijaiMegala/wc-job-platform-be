import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Job } from './job.entity';
import { Application } from './application.entity';

@Entity('organization')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  org_id: string;

  @Column({ type: 'varchar', length: 255 })
  org_name: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  theme_color: string;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Role, (role) => role.organization)
  roles: Role[];

  @OneToMany(() => Job, (job) => job.organization)
  jobs: Job[];

  @OneToMany(() => Application, (application) => application.organization)
  applications: Application[];
}

