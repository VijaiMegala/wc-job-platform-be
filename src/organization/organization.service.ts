import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createOrgDto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create(createOrgDto);
    return await this.organizationRepository.save(organization);
  }

  async findOne(orgId: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { org_id: orgId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }

    return organization;
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find();
  }

  async update(orgId: string, updateOrgDto: Partial<Organization>): Promise<Organization> {
    const organization = await this.findOne(orgId);
    
    // If logo_url is being updated and old logo exists, delete it from Cloudinary
    if (updateOrgDto.logo_url !== undefined) {
      const oldLogoUrl = organization.logo_url;
      
      // If new logo is empty/null and old logo exists, delete old logo
      if (!updateOrgDto.logo_url && oldLogoUrl) {
        try {
          // Check if it's a Cloudinary URL before attempting deletion
          if (oldLogoUrl.includes('cloudinary.com')) {
            await this.cloudinaryService.deleteImage(oldLogoUrl);
          }
        } catch (error) {
          // Log error but don't fail the update
          console.error('Error deleting old logo from Cloudinary:', error);
        }
      }
      // If new logo is different from old logo and old logo exists, delete old logo
      else if (updateOrgDto.logo_url !== oldLogoUrl && oldLogoUrl) {
        try {
          // Check if old logo is a Cloudinary URL before attempting deletion
          if (oldLogoUrl.includes('cloudinary.com')) {
            await this.cloudinaryService.deleteImage(oldLogoUrl);
          }
        } catch (error) {
          // Log error but don't fail the update
          console.error('Error deleting old logo from Cloudinary:', error);
        }
      }
    }
    
    Object.assign(organization, updateOrgDto);
    
    return await this.organizationRepository.save(organization);
  }
}

