import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationService.create(createApplicationDto);
  }

  @Get('org/:orgId')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Param('orgId') orgId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.applicationService.findAll(orgId, paginationDto);
  }

  @Get('org/:orgId/user/:userId')
  @UseGuards(JwtAuthGuard)
  getUserApplications(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.applicationService.getUserApplications(
      userId,
      orgId,
      paginationDto,
    );
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  getMyApplications(
    @Param('userId') userId: string,
    @Request() req,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.applicationService.getUserApplications(
      userId,
      req.user.orgId,
      paginationDto,
    );
  }

  @Get(':applicationId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('applicationId') applicationId: string, @Request() req) {
    return this.applicationService.findOne(
      applicationId,
      req.user.orgId,
      req.user.userId,
    );
  }

  @Patch(':applicationId/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('applicationId') applicationId: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @Request() req,
  ) {
    return this.applicationService.updateStatus(
      applicationId,
      updateStatusDto,
      req.user.orgId,
    );
  }
}

