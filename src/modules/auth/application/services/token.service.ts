import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../../users/domain/entities/user.entity';
import { TokenResponse } from '../../domain/interfaces/auth.interface';
import { AuthTokenRepository } from '../../domain/repositories/auth-token.repository';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly userSessionRepository: UserSessionRepository
  ) {}

  async generateTokens(user: User): Promise<TokenResponse> {
    const payload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { ...payload, tokenType: 'refresh' },
        { expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION') }
      ),
    ]);

    const expirationTime = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') || '15m';

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.parseExpirationTime(expirationTime),
    };
  }

  async verifyToken(token: string): Promise<any> {
    // Verify JWT signature and expiration
    const payload = await this.jwtService.verifyAsync(token);

    // Check if token exists in user_sessions and is not soft deleted
    const session = await this.userSessionRepository.findOneWithOptions({
      where: {
        token,
        deleted_at: IsNull()
      }
    });

    if (!session) {
      throw new Error('Token has been invalidated');
    }

    // If it's a refresh token, verify it exists in auth_tokens and is not soft deleted
    if (payload.tokenType === 'refresh') {
      const authToken = await this.authTokenRepository.findOneWithOptions({
        where: {
          refresh_token: token,
          deleted_at: IsNull()
        }
      });

      if (!authToken) {
        throw new Error('Refresh token has been invalidated');
      }
    }

    return payload;
  }

  parseExpirationTime(expiration: string): number {
    if (!expiration) return 900000; // Default 15 minutes

    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return value;
    }
  }
}