import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { FeatureRepository } from '../../../features/domain/repositories/feature.repository';
import { CreatePermissionDto, UpdatePermissionDto, UpdatePermissionStatusDto } from '../dtos/permission.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { FindOptionsWhere, IsNull } from 'typeorm';
import { RoleFeaturePermission } from '../../domain/entities/role-feature-permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const role = await this.roleRepository.findById(createPermissionDto.role_id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const feature = await this.featureRepository.findById(createPermissionDto.feature_id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    const existingPermission = await this.permissionRepository.findOne({
      role_id: createPermissionDto.role_id,
      feature_id: createPermissionDto.feature_id,
      deleted_at: IsNull(),
    } as FindOptionsWhere<RoleFeaturePermission>);

    if (existingPermission) {
      throw new ConflictException('Permission already exists for this role and feature');
    }

    const permission = await this.permissionRepository.create({
      role_id: createPermissionDto.role_id,
      feature_id: createPermissionDto.feature_id,
      methods: createPermissionDto.permissions,
      status: createPermissionDto.status ?? true,
    });

    return this.responseTransformer.transform(permission);
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    const [permissions, total] = await this.permissionRepository.findAndCount({
      where: { deleted_at: IsNull() } as FindOptionsWhere<RoleFeaturePermission>,
      relations: ['role', 'feature'],
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'role-feature-permissions',
      totalItems: total,
      page: query.page,
      limit: query.limit,
    });

    return this.responseTransformer.transformPaginated(
      permissions,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOneWithRelations(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return this.responseTransformer.transform(permission);
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const updatedMethods = {
      ...permission.methods,
      ...updatePermissionDto.permissions,
    };

    await this.permissionRepository.update(id, { methods: updatedMethods } as Partial<RoleFeaturePermission>);
    return this.responseTransformer.transform({ message: 'Permission updated successfully' });
  }

  async updateStatus(id: number, updateStatusDto: UpdatePermissionStatusDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    await this.permissionRepository.update(id, { status: updateStatusDto.status } as Partial<RoleFeaturePermission>);
    return this.responseTransformer.transform({ message: 'Permission status updated successfully' });
  }

  async remove(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    await this.permissionRepository.softDelete(id);
    return this.responseTransformer.transformDelete('Permission');
  }
}