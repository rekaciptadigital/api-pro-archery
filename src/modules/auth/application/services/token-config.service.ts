import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenConfigService {
  constructor(private readonly configService: ConfigService) {}

  getRefreshTokenExpiration(): string {
    return this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') || '7d';
  }

  getAccessTokenExpiration(): string {
    return this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') || '15m';
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'default-secret-key';
  }
}