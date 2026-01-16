import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { Job } from './job.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('application')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  application_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  org_id: string;

  @Column({ type: 'uuid' })
  job_id: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Organization, (org) => org.applications)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @ManyToOne(() => Job, (job) => job.applications)
  @JoinColumn({ name: 'job_id' })
  job: Job;
}

