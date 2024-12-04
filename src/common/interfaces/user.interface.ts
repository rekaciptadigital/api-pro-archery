export interface IUser {
  id: string;
  nip: string | null;
  nik: string | null;
  first_name: string;
  last_name: string;
  photo_profile: string | null;
  email: string;
  phone_number: string | null;
  address: string | null;
  status: boolean;
  role: {
    id: number;
    name: string;
    description: string | null;
    status: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}