import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobService.create({
      ...createJobDto,
      org_id: createJobDto.org_id || req.user.orgId,
    });
  }

  @Get('org/:orgId')
  findAll(
    @Param('orgId') orgId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.jobService.findAll(orgId, paginationDto);
  }

  @Get(':jobId')
  findOne(@Param('jobId') jobId: string) {
    return this.jobService.findOne(jobId);
  }

  @Patch(':jobId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('jobId') jobId: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req,
  ) {
    return this.jobService.update(jobId, updateJobDto, req.user.orgId);
  }

  @Delete(':jobId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('jobId') jobId: string, @Request() req) {
    return this.jobService.remove(jobId, req.user.orgId);
  }

  @Get('org/:orgId/analytics')
  @UseGuards(JwtAuthGuard)
  getAnalytics(
    @Param('orgId') orgId: string,
    @Query('jobName') jobName?: string,
    @Query('jobType') jobType?: string,
    @Query('workPolicy') workPolicy?: string,
    @Query('location') location?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.jobService.getJobAnalytics(
      orgId,
      jobName,
      jobType,
      workPolicy,
      location,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}

