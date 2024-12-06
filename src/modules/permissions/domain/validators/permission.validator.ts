import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { FeatureRepository } from '../../../features/domain/repositories/feature.repository';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class PermissionValidator {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async validateRoleAndFeature(roleId: number, featureId: number): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new DomainException('Role not found');
    }
    if (!role.status) {
      throw new DomainException('Role is inactive');
    }

    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new DomainException('Feature not found');
    }
    if (!feature.status) {
      throw new DomainException('Feature is inactive');
    }
  }
}