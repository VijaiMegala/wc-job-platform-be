import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Application } from './application.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  job_id: string;

  @Column({ type: 'uuid' })
  org_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  work_policy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employment_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  experience_level: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  job_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  salary_range: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  job_slug: string;

  @Column({ type: 'text', nullable: true })
  job_description: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date | null;

  @ManyToOne(() => Organization, (org) => org.jobs)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}

