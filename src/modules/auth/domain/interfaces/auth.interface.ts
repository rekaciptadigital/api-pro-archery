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

export interface AuthResponse<T = any> {
  status: {
    code: number;
    message: string;
  };
  data: T;
  tokens: TokenResponse;
}