import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { FeatureRepository } from '../../../features/domain/repositories/feature.repository';
import { CreatePermissionDto, UpdatePermissionDto, UpdatePermissionStatusDto } from '../dtos/permission.dto';
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

  // ... other methods remain the same ...

  async remove(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    await this.permissionRepository.softDelete(id);
    return this.responseTransformer.transformDelete('Permission');
  }
}