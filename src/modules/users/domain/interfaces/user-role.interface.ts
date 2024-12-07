import { Role } from './permission-response.interface';

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  status: boolean;
  deleted_at: Date | null;
  role: Role;
}

export interface UserWithRoles {
  id: number;
  nip: string | null;
  nik: string | null;
  first_name: string;
  last_name: string | null;
  photo_profile: string | null;
  email: string;
  phone_number: string | null;
  address: string | null;
  status: boolean;
  user_roles: UserRole[];
  created_at: Date;
  updated_at: Date;
}