import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { CreateUserWithOrgDto } from '../organization/dto/create-user-with-org.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { OrganizationService } from '../organization/organization.service';
import { RoleService } from '../roles/role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private organizationService: OrganizationService,
    private roleService: RoleService,
  ) {}

  async createUserWithOrg(createUserDto: CreateUserWithOrgDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { user_email: createUserDto.user_email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Find or create organization
    let organization;
    const existingOrgs = await this.organizationService.findAll();
    organization = existingOrgs.find(
      (org) => org.org_name.toLowerCase() === createUserDto.organization_name.toLowerCase(),
    );

    if (!organization) {
      organization = await this.organizationService.create({
        org_name: createUserDto.organization_name,
      });
    }

    // Get or create default roles
    let adminRole = await this.roleService.findByNameAndOrg(
      createUserDto.role_name || 'admin',
      organization.org_id,
    );

    if (!adminRole) {
      const roles = await this.roleService.createDefaultRoles(
        organization.org_id,
      );
      adminRole = roles.admin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.user_password, 10);

    // Create user
    const user = this.userRepository.create({
      user_name: createUserDto.user_name,
      user_email: createUserDto.user_email,
      user_password: hashedPassword,
      role_id: adminRole.role_id,
      org_id: organization.org_id,
    });

    return await this.userRepository.save(user);
  }

  async createCandidate(createCandidateDto: CreateCandidateDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: {
        user_email: createCandidateDto.user_email,
        org_id: createCandidateDto.org_id,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this organization');
    }

    // Verify organization exists
    await this.organizationService.findOne(createCandidateDto.org_id);

    // Get or create candidate role
    let candidateRole = await this.roleService.findByNameAndOrg(
      'candidate',
      createCandidateDto.org_id,
    );

    if (!candidateRole) {
      const roles = await this.roleService.createDefaultRoles(
        createCandidateDto.org_id,
      );
      candidateRole = roles.candidate;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createCandidateDto.user_password, 10);

    // Create user
    const user = this.userRepository.create({
      user_name: createCandidateDto.user_name,
      user_email: createCandidateDto.user_email,
      user_password: hashedPassword,
      role_id: candidateRole.role_id,
      org_id: createCandidateDto.org_id,
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { user_email: email },
      relations: ['role', 'organization'],
    });
  }

  async findOne(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['role', 'organization'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}

