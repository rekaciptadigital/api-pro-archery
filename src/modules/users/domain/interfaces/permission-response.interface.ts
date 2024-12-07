export interface Feature {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
}

export interface RoleFeaturePermissionsResponse {
  role: Role | null;
  role_feature_permissions: {
    features: Feature[];
    permissions: Permission[];
  };
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
  role_feature_permissions: {
    features: Feature[];
    permissions: Permission[];
  };
  created_at: Date;
  updated_at: Date;
}