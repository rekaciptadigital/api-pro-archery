export interface IUser {
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
  created_at: Date;
  updated_at: Date;
}

export interface IUserWithRole extends IUser {
  role: {
    id: number;
    name: string;
    description?: string;
    status: boolean;
  } | null;
}

export interface IPaginatedUsers {
  data: IUserWithRole[];
  metadata: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}