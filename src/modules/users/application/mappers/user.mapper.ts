import { User } from '../../domain/entities/user.entity';
import { IUserWithRole } from '../../domain/interfaces/user.interface';

export class UserMapper {
  static toResponse(user: User): IUserWithRole {
    const role = user.user_roles?.[0]?.role;

    return {
      id: user.id,
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
        id: role.id,
        name: role.name,
        description: role.description,
        status: role.status,
      } : null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}