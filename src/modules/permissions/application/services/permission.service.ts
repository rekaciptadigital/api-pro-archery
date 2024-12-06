import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { CreatePermissionDto, UpdatePermissionDto, UpdatePermissionStatusDto } from '../dtos/permission.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { FindOptionsWhere, IsNull } from 'typeorm';
import { RoleFeaturePermission } from '../../domain/entities/role-feature-permission.entity';
import { PermissionValidator } from '../../domain/validators/permission.validator';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionValidator: PermissionValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    await this.permissionValidator.validateRoleAndFeature(
      createPermissionDto.role_id,
      createPermissionDto.feature_id
    );

    const permission = await this.permissionRepository.create({
      ...createPermissionDto,
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

    await this.permissionValidator.validateRoleAndFeature(
      updatePermissionDto.role_id,
      updatePermissionDto.feature_id
    );

    const updated = await this.permissionRepository.update(id, {
      role_id: updatePermissionDto.role_id,
      feature_id: updatePermissionDto.feature_id,
      methods: updatePermissionDto.methods,
      status: updatePermissionDto.status,
    });

    return this.responseTransformer.transform({
      message: 'Permission updated successfully',
      data: updated
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdatePermissionStatusDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    await this.permissionRepository.update(id, { status: updateStatusDto.status });
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