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

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.create({
      ...createRoleDto,
      status: createRoleDto.status ?? true,
    });
    return this.responseTransformer.transform(role);
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    const [roles, total] = await this.roleRepository.findAndCount({
      where: { deleted_at: IsNull() },
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'roles',
      totalItems: total,
      page: query.page,
      limit: query.limit,
    });

    return this.responseTransformer.transformPaginated(
      roles,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.responseTransformer.transform(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    const updated = await this.roleRepository.update(id, updateRoleDto);
    return this.responseTransformer.transform({ message: 'Role updated successfully' });
  }

  async updateStatus(id: number, updateStatusDto: UpdateRoleStatusDto) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({ message: 'Role status updated successfully' });
  }

  async remove(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.softDelete(id);
    return this.responseTransformer.transformDelete('Role');
  }
}