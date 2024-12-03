import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { CreateRoleDto, UpdateRoleDto, UpdateRoleStatusDto } from '../dtos/role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.create(createRoleDto);
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
    };
  }

  async findAll() {
    const roles = await this.roleRepository.findAll();
    return roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
    }));
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.update(id, updateRoleDto);
  }

  async updateStatus(id: number, updateStatusDto: UpdateRoleStatusDto) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.update(id, updateStatusDto);
  }

  async remove(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.softDelete(id);
  }
}