import { HttpStatus } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { AuthResponse } from '../../domain/interfaces/auth.interface';
import { UserMapper } from '../../../users/application/mappers/user.mapper';
import { RoleFeaturePermission } from '../../../permissions/domain/entities/role-feature-permission.entity';
import { Repository } from 'typeorm';

export class AuthResponseHelper {
  constructor(
    private readonly permissionRepository: Repository<RoleFeaturePermission>
  ) {}

  async createLoginResponse(
    user: User, 
    tokens: any, 
    status: number = HttpStatus.OK
  ): Promise<AuthResponse> {
    const activeRole = user.user_roles?.find(ur => ur.role?.status && !ur.deleted_at)?.role;
    const roleFeaturePermissions = activeRole ? 
      await this.getRoleFeaturePermissions(activeRole.id) : [];

    return {
      status: {
        code: status,
        message: 'Success'
      },
      data: UserMapper.toDetailedResponse(user, activeRole, roleFeaturePermissions),
      tokens
    };
  }

  private async getRoleFeaturePermissions(roleId: number) {
    if (!roleId) return [];

    return this.permissionRepository.find({
      where: {
        role_id: roleId,
        status: true,
      },
      relations: ['feature'],
      order: {
        created_at: 'DESC'
      }
    });
  }
}