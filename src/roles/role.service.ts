import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findByNameAndOrg(
    roleName: string,
    orgId: string,
  ): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { role_name: roleName, org_id: orgId },
    });
  }

  async createDefaultRoles(orgId: string): Promise<{ admin: Role; candidate: Role }> {
    const adminRole = this.roleRepository.create({
      org_id: orgId,
      role_name: 'admin',
      role_access: JSON.stringify({ all: true }),
    });

    const candidateRole = this.roleRepository.create({
      org_id: orgId,
      role_name: 'candidate',
      role_access: JSON.stringify({ apply: true, view: true }),
    });

    const savedAdmin = await this.roleRepository.save(adminRole);
    const savedCandidate = await this.roleRepository.save(candidateRole);

    return { admin: savedAdmin, candidate: savedCandidate };
  }

  async findOne(roleId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { role_id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return role;
  }
}

