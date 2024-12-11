export interface VerifyTokenResponse {
  isValid: boolean;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name?: string;
  };
  expiresIn?: number;
}