import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { FeatureRepository } from '../../../features/domain/repositories/feature.repository';
import { CreatePermissionDto, UpdatePermissionDto, UpdatePermissionStatusDto } from '../dtos/permission.dto';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { IsNull } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    const [permissions, total] = await this.permissionRepository.findAndCount({
      relations: ['role', 'feature'],
      where: { deleted_at: IsNull() },
      order: { created_at: 'DESC' },
      skip,
      take,
    });

    const mappedPermissions = permissions.map(permission => ({
      id: permission.id,
      role: {
        id: permission.role.id,
        name: permission.role.name,
        description: permission.role.description,
      },
      feature: {
        id: permission.feature.id,
        name: permission.feature.name,
        description: permission.feature.description,
      },
      methods: permission.methods,
      status: permission.status,
    }));

    const { links } = this.paginationHelper.generatePaginationData({
      serviceName: 'role-feature-permissions',
      totalItems: total,
      page: query.page || 1,
      limit: query.limit || 10
    });

    return this.responseTransformer.transformPaginated(
      mappedPermissions,
      total,
      query.page || 1,
      query.limit || 10,
      links
    );
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOneWithRelations(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return this.responseTransformer.transform({
      id: permission.id,
      role: {
        id: permission.role.id,
        name: permission.role.name,
        description: permission.role.description,
      },
      feature: {
        id: permission.feature.id,
        name: permission.feature.name,
        description: permission.feature.description,
      },
      methods: permission.methods,
      status: permission.status,
    });
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const role = await this.roleRepository.findById(createPermissionDto.role_id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const feature = await this.featureRepository.findById(createPermissionDto.feature_id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    const permission = await this.permissionRepository.create({
      role_id: createPermissionDto.role_id,
      feature_id: createPermissionDto.feature_id,
      methods: createPermissionDto.permissions,
      status: createPermissionDto.status ?? true,
    });

    return this.responseTransformer.transform({
      id: permission.id,
      role_id: permission.role_id,
      feature_id: permission.feature_id,
      methods: permission.methods,
      status: permission.status,
    });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.update(id, {
      methods: updatePermissionDto.permissions,
    });

    return this.responseTransformer.transform({
      message: 'Permission updated successfully'
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdatePermissionStatusDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.update(id, {
      status: updateStatusDto.status,
    });

    return this.responseTransformer.transform({
      message: 'Permission status updated successfully'
    });
  }

  async remove(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.softDelete(id);
    return this.responseTransformer.transform({
      message: 'Permission deleted successfully'
    });
  }
}