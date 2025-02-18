import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "../../../users/domain/entities/user.entity";
import { TokenResponse } from "../../domain/interfaces/auth.interface";
import { AuthTokenRepository } from "../../domain/repositories/auth-token.repository";
import { UserSessionRepository } from "../../domain/repositories/user-session.repository";
import { FindOptionsWhere, IsNull } from "typeorm";
import { UserSession } from "../../domain/entities/user-session.entity";
import { AuthToken } from "../../domain/entities/auth-token.entity";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly userSessionRepository: UserSessionRepository
  ) {}

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Use findByToken from UserSessionRepository
      const session = await this.userSessionRepository.findByToken(token);

      if (!session) {
        throw new UnauthorizedException("Token has been invalidated");
      }

      if (payload.tokenType === "refresh") {
        const authToken =
          await this.authTokenRepository.findByRefreshToken(token);

        if (!authToken) {
          throw new UnauthorizedException("Refresh token has been invalidated");
        }

        if (new Date() > authToken.expires_at) {
          await this.authTokenRepository.deleteById(authToken.id);
          throw new UnauthorizedException("Refresh token has expired");
        }
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid token");
    }
  }

  async generateTokens(user: User): Promise<TokenResponse> {
    const payload = { id: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { ...payload, tokenType: "refresh" },
        { expiresIn: this.configService.get("JWT_REFRESH_TOKEN_EXPIRATION") }
      ),
    ]);

    const expirationTime =
      this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRATION") || "15m";

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.parseExpirationTime(expirationTime),
    };
  }

  parseExpirationTime(expiration: string): number {
    if (!expiration) return 900000; // Default 15 minutes

    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return value;
    }
  }
}
