import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { CreateRoleDto, UpdateRoleDto, UpdateRoleStatusDto } from '../dtos/role.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { IsNull } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [roles, total] = await this.roleRepository.findAndCount({
      skip,
      take,
      order: { created_at: 'DESC' },
      where: {
        deleted_at: IsNull()
      }
    });

    const mappedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
    }));

    const { links, meta } = this.paginationHelper.generatePaginationData({
      serviceName: 'roles',
      totalItems: total,
      page: query.page || 1,
      limit: query.limit || 10
    });

    return this.responseTransformer.transformPaginated(
      mappedRoles,
      total,
      query.page || 1,
      query.limit || 10,
      links
    );
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.responseTransformer.transform({
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
    });
  }

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.create(createRoleDto);
    return this.responseTransformer.transform({
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.update(id, updateRoleDto);
    return this.responseTransformer.transform({
      message: 'Role updated successfully'
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateRoleStatusDto) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({
      message: 'Role status updated successfully'
    });
  }

  async remove(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.softDelete(id);
    return this.responseTransformer.transform({
      message: 'Role deleted successfully'
    });
  }
}