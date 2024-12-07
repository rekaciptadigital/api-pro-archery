export interface Feature {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface RoleFeaturePermission {
  id: number;
  role_id: number;
  feature_id: number;
  methods: {
    get: boolean;
    post: boolean;
    put: boolean;
    patch: boolean;
    delete: boolean;
  };
  status: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  feature: Feature;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
}

export interface UserWithPermissionsResponse {
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
  role: Role | null;
  role_feature_permissions: RoleFeaturePermission[];
  created_at: Date;
  updated_at: Date;
}