import { User } from '../../domain/entities/user.entity';
import { Role } from '../../../roles/domain/entities/role.entity';
import { RoleFeaturePermission } from '../../../permissions/domain/entities/role-feature-permission.entity';
import { DateUtil } from '../../../../common/utils/date.util';

export class UserMapper {
  static toDetailedResponse(user: User, role?: Role | null, permissions: RoleFeaturePermission[] = []) {
    const mappedPermissions = permissions.map(permission => ({
      id: permission.id.toString(),
      role_id: permission.role_id.toString(),
      feature_id: permission.feature_id.toString(),
      methods: permission.methods,
      status: permission.status,
      created_at: DateUtil.formatTimestamp(permission.created_at),
      updated_at: DateUtil.formatTimestamp(permission.updated_at),
      deleted_at: DateUtil.formatTimestamp(permission.deleted_at),
      feature: permission.feature ? {
        id: permission.feature.id.toString(),
        name: permission.feature.name,
        description: permission.feature.description,
        status: permission.feature.status,
        created_at: DateUtil.formatTimestamp(permission.feature.created_at),
        updated_at: DateUtil.formatTimestamp(permission.feature.updated_at),
        deleted_at: DateUtil.formatTimestamp(permission.feature.deleted_at)
      } : null
    }));

    return {
      id: user.id.toString(),
      nip: user.nip,
      nik: user.nik,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_profile: user.photo_profile,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
      status: user.status,
      role: role ? {
        id: role.id.toString(),
        name: role.name,
        description: role.description,
        status: role.status
      } : null,
      role_feature_permissions: mappedPermissions,
      created_at: DateUtil.formatTimestamp(user.created_at),
      updated_at: DateUtil.formatTimestamp(user.updated_at)
    };
  }
}