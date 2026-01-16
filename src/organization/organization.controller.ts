import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createOrgDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrgDto);
  }

  @Get()
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':orgId')
  findOne(@Param('orgId') orgId: string) {
    return this.organizationService.findOne(orgId);
  }

  @Patch(':orgId')
  @UseGuards(JwtAuthGuard)
  update(@Param('orgId') orgId: string, @Body() updateOrgDto: UpdateOrganizationDto) {
    return this.organizationService.update(orgId, updateOrgDto);
  }
}

