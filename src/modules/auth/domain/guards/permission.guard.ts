import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { ApiEndpointRepository } from '../repositories/api-endpoint.repository';
import { RoleFeaturePermission } from '../../../permissions/domain/entities/role-feature-permission.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userRepository: UserRepository,
    private apiEndpointRepository: ApiEndpointRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = request.url;
    const method = request.method.toLowerCase();

    if (!user) {
      return false;
    }

    const endpoint = await this.apiEndpointRepository.findByPathAndMethod(path, method);
    if (!endpoint) {
      return true; // If endpoint is not registered, allow access
    }

    if (endpoint.is_public) {
      return true;
    }

    const userWithRoles = await this.userRepository.findOneWithOptions({
      where: { id: user.id },
      relations: ['user_roles', 'user_roles.role', 'user_roles.role.role_feature_permissions', 'user_roles.role.role_feature_permissions.feature']
    });

    if (!userWithRoles?.user_roles?.length) {
      throw new ForbiddenException('User has no roles assigned');
    }

    const hasPermission = userWithRoles.user_roles.some(userRole => {
      const permissions = userRole.role?.role_feature_permissions || [];
      return permissions.some((permission: RoleFeaturePermission) => 
        permission.methods[method] && permission.status
      );
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}