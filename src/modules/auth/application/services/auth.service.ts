import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuthTokenRepository } from '../../domain/repositories/auth-token.repository';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository';
import { LoginDto, RegisterDto, ChangePasswordDto } from '../../domain/dtos/auth.dto';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { User } from '../../../users/domain/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { AuthResponse } from '../../domain/interfaces/auth.interface';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.status) {
      throw new UnauthorizedException('Account is inactive');
    }

    return user;
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const tokens = await this.tokenService.generateTokens(user);
    
    await this.authTokenRepository.create({
      user_id: user.id,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + this.getRefreshTokenExpirationTime()),
    });

    await this.userSessionRepository.create({
      user_id: user.id,
      token: tokens.access_token,
      ip_address: ipAddress,
      user_agent: userAgent,
      last_activity: new Date(),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      tokens,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new DomainException('Email already registered', HttpStatus.CONFLICT);
    }

    if (!this.passwordService.validatePasswordStrength(registerDto.password)) {
      throw new DomainException(
        'Password must contain uppercase, lowercase, number/special character',
        HttpStatus.BAD_REQUEST
      );
    }

    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);
    
    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      status: true,
    });

    const tokens = await this.tokenService.generateTokens(user);

    await this.authTokenRepository.create({
      user_id: user.id,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + this.getRefreshTokenExpirationTime()),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      tokens,
    };
  }

  async logout(token: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    const payload = await this.tokenService.verifyToken(token);
    await this.userSessionRepository.deleteUserSessions(payload.sub);
    await this.authTokenRepository.deleteUserTokens(payload.sub);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const authToken = await this.authTokenRepository.findByRefreshToken(refreshToken);
    if (!authToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(authToken.user_id);
    if (!user || !user.status) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.tokenService.generateTokens(user);

    await this.authTokenRepository.update(authToken.id, {
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + this.getRefreshTokenExpirationTime()),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      tokens,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      changePasswordDto.current_password,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new DomainException('Current password is incorrect', HttpStatus.BAD_REQUEST);
    }

    if (!this.passwordService.validatePasswordStrength(changePasswordDto.new_password)) {
      throw new DomainException(
        'New password must contain uppercase, lowercase, number/special character',
        HttpStatus.BAD_REQUEST
      );
    }

    const hashedPassword = await this.passwordService.hashPassword(
      changePasswordDto.new_password,
    );

    await this.userRepository.update(userId, { password: hashedPassword });
    await this.logout(user.id.toString());
  }

  private getRefreshTokenExpirationTime(): number {
    const expiration = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') || '7d';
    return this.tokenService.parseExpirationTime(expiration);
  }
}