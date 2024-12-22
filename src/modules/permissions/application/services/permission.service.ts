import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { CreatePermissionDto, UpdatePermissionDto, UpdatePermissionStatusDto } from '../dtos/permission.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { PermissionValidator } from '../../domain/validators/permission.validator';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

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

    const updated = await this.permissionRepository.update(id, updatePermissionDto);
    return this.responseTransformer.transform(updated);
  }

  async updateStatus(id: number, updateStatusDto: UpdatePermissionStatusDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({ message: 'Permission status updated successfully' });
  }

  async remove(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.softDelete(id);
    return this.responseTransformer.transform({ message: 'Permission deleted successfully' });
  }

  async restore(id: number) {
    const permission = await this.permissionRepository.findWithDeleted(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (!permission.deleted_at) {
      throw new DomainException('Permission is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.permissionRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore permission', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform(restored);
  }
}