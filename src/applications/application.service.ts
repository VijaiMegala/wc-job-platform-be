import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    // Check if application already exists
    const existing = await this.applicationRepository.findOne({
      where: {
        user_id: createApplicationDto.user_id,
        job_id: createApplicationDto.job_id,
      },
    });

    if (existing) {
      throw new ConflictException('Application already exists for this job');
    }

    const application = this.applicationRepository.create(createApplicationDto);
    return await this.applicationRepository.save(application);
  }

  async findAll(
    orgId: string,
    paginationDto: PaginationDto,
    userId?: string,
  ): Promise<PaginatedResponse<Application>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = { org_id: orgId };
    if (userId) {
      where.user_id = userId;
    }

    const [applications, total] = await this.applicationRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
      relations: ['user', 'job', 'organization'],
    });

    return new PaginatedResponse(applications, total, page, limit);
  }

  async findOne(applicationId: string, orgId?: string, userId?: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { application_id: applicationId },
      relations: ['user', 'job', 'organization'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    if (orgId && application.org_id !== orgId) {
      throw new ForbiddenException('Access denied to this application');
    }

    if (userId && application.user_id !== userId) {
      throw new ForbiddenException('Access denied to this application');
    }

    return application;
  }

  async updateStatus(
    applicationId: string,
    updateStatusDto: UpdateApplicationStatusDto,
    orgId: string,
  ): Promise<Application> {
    const application = await this.findOne(applicationId, orgId);
    application.status = updateStatusDto.status;
    return await this.applicationRepository.save(application);
  }

  async getUserApplications(
    userId: string,
    orgId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Application>> {
    return this.findAll(orgId, paginationDto, userId);
  }
}

