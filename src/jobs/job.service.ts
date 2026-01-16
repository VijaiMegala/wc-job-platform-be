import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const { closed_at, ...rest } = createJobDto;
    const jobData: Partial<Job> = {
      ...rest,
    };
    
    if (closed_at) {
      jobData.closed_at = new Date(closed_at);
    }
    
    const job = this.jobRepository.create(jobData);
    return await this.jobRepository.save(job);
  }

  async findAll(
    orgId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Job>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [jobs, total] = await this.jobRepository.findAndCount({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
      relations: ['organization'],
    });

    return new PaginatedResponse(jobs, total, page, limit);
  }

  async findOne(jobId: string, orgId?: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { job_id: jobId },
      relations: ['organization', 'applications'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (orgId && job.org_id !== orgId) {
      throw new ForbiddenException('Access denied to this job');
    }

    return job;
  }

  async update(
    jobId: string,
    updateJobDto: UpdateJobDto,
    orgId: string,
  ): Promise<Job> {
    const job = await this.findOne(jobId, orgId);

    if (updateJobDto.closed_at) {
      job.closed_at = new Date(updateJobDto.closed_at);
    } else {
      // If closed_at is explicitly set to empty string, set it to null
      if (updateJobDto.closed_at === '') {
        job.closed_at = null;
      }
    }

    // Update other fields
    if (updateJobDto.title !== undefined) job.title = updateJobDto.title;
    if (updateJobDto.work_policy !== undefined) job.work_policy = updateJobDto.work_policy;
    if (updateJobDto.location !== undefined) job.location = updateJobDto.location;
    if (updateJobDto.department !== undefined) job.department = updateJobDto.department;
    if (updateJobDto.employment_type !== undefined) job.employment_type = updateJobDto.employment_type;
    if (updateJobDto.experience_level !== undefined) job.experience_level = updateJobDto.experience_level;
    if (updateJobDto.job_type !== undefined) job.job_type = updateJobDto.job_type;
    if (updateJobDto.salary_range !== undefined) job.salary_range = updateJobDto.salary_range;
    if (updateJobDto.job_slug !== undefined) job.job_slug = updateJobDto.job_slug;
    if (updateJobDto.job_description !== undefined) job.job_description = updateJobDto.job_description;

    return await this.jobRepository.save(job);
  }

  async remove(jobId: string, orgId: string): Promise<void> {
    const job = await this.findOne(jobId, orgId);
    await this.jobRepository.remove(job);
  }

  async getJobAnalytics(
    orgId: string,
    jobName?: string,
    jobType?: string,
    workPolicy?: string,
    location?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.applications', 'application')
      .where('job.org_id = :orgId', { orgId });

    if (jobName) {
      queryBuilder.andWhere('job.title ILIKE :jobName', { 
        jobName: `%${jobName}%` 
      });
    }

    if (jobType) {
      queryBuilder.andWhere('job.job_type ILIKE :jobType', { 
        jobType: `%${jobType}%` 
      });
    }

    if (workPolicy) {
      queryBuilder.andWhere('job.work_policy ILIKE :workPolicy', { 
        workPolicy: `%${workPolicy}%` 
      });
    }

    if (location) {
      queryBuilder.andWhere('job.location ILIKE :location', { 
        location: `%${location}%` 
      });
    }

    if (startDate) {
      queryBuilder.andWhere('application.created_at >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('application.created_at <= :endDate', { endDate });
    }

    const jobs = await queryBuilder.getMany();

    return jobs.map((job) => ({
      job_id: job.job_id,
      title: job.title,
      work_policy: job.work_policy,
      job_type: job.job_type,
      location: job.location,
      total_applications: job.applications?.length || 0,
      applications: job.applications?.map((app) => ({
        application_id: app.application_id,
        user_id: app.user_id,
        status: app.status,
        created_at: app.created_at,
      })) || [],
    }));
  }
}

