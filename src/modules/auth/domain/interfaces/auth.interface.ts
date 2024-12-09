export interface JwtPayload {
  sub: number;
  email: string;
  tokenType?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string | null;
  };
  tokens: TokenResponse;
}