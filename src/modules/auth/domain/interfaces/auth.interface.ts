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
  status: {
    code: number;
    message: string;
  };
  data: any[];
  tokens: TokenResponse;
}