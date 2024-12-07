export interface Feature {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
}

export interface RoleFeaturePermissionsResponse {
  role_feature_permissions: {
    features: Feature[];
    permissions: Permission[];
  };
}

export interface UserWithPermissionsResponse {
  id: number;
  nip?: string;
  nik?: string;
  first_name: string;
  last_name?: string;
  photo_profile?: string;
  email: string;
  phone_number?: string;
  address?: string;
  status: boolean;
  role_feature_permissions: {
    features: Feature[];
    permissions: Permission[];
  };
  created_at: Date;
  updated_at: Date;
}