import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { FeatureRepository } from '../../../features/domain/repositories/feature.repository';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  UpdatePermissionStatusDto,
} from '../dtos/permission.dto';
import { PermissionQueryDto } from '../dtos/permission-query.dto';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async findAll(query: PermissionQueryDto) {
    const { page = 1, limit = 10, roleName, featureName } = query;
    const skip = (page - 1) * limit;

    const [permissions, total] = await this.permissionRepository.findWithRelationsAndCount({
      relations: ['role', 'feature'],
      where: {
        ...(roleName && { role: { name: roleName } }),
        ...(featureName && { feature: { name: featureName } }),
      },
      order: { role: { name: 'ASC' } },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: permissions.map(permission => ({
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
        permissions: permission.methods,
        status: permission.status,
        created_at: permission.created_at,
        updated_at: permission.updated_at,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOneWithRelations(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return {
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
      permissions: permission.methods,
      status: permission.status,
      created_at: permission.created_at,
      updated_at: permission.updated_at,
    };
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const role = await this.roleRepository.findById(createPermissionDto.role_id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const feature = await this.featureRepository.findById(
      createPermissionDto.feature_id,
    );
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    const permission = await this.permissionRepository.create({
      role_id: createPermissionDto.role_id,
      feature_id: createPermissionDto.feature_id,
      methods: createPermissionDto.permissions,
      status: createPermissionDto.status ?? true,
    });

    return {
      id: permission.id,
      role_id: permission.role_id,
      feature_id: permission.feature_id,
      permissions: permission.methods,
      status: permission.status,
    };
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.update(id, {
      methods: {
        ...permission.methods,
        ...updatePermissionDto.permissions,
      },
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
  }

  async remove(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.softDelete(id);
  }
}