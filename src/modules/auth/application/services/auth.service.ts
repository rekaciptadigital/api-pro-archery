import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuthTokenRepository } from '../../domain/repositories/auth-token.repository';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository';
import { LoginDto, RegisterDto, ChangePasswordDto } from '../dtos/auth.dto';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { User } from '../../../users/domain/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { AuthResponse } from '../../domain/interfaces/auth.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleFeaturePermission } from '../../../permissions/domain/entities/role-feature-permission.entity';
import { UserMapper } from '../../../users/application/mappers/user.mapper';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(RoleFeaturePermission)
    private readonly permissionRepository: Repository<RoleFeaturePermission>
  ) {}

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    const user = await this.authenticationService.validateUser(loginDto.email, loginDto.password);
    return this.handleSuccessfulLogin(user, ipAddress, userAgent);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.authenticationService.registerUser(registerDto);
    return this.handleSuccessfulRegistration(user);
  }

  async logout(token: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = await this.tokenService.verifyToken(token);
      await Promise.all([
        this.userSessionRepository.deleteUserSessions(payload.sub),
        this.authTokenRepository.deleteUserTokens(payload.sub)
      ]);
    } catch (error) {
      // Only throw if error is not related to token invalidation
      if (error.message !== 'Token has been invalidated') {
        throw new UnauthorizedException(error.message);
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { user, tokens } = await this.authenticationService.refreshUserToken(refreshToken);
    return this.handleSuccessfulTokenRefresh(user, tokens);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.validateAndUpdatePassword(user, changePasswordDto);
  }

  private async validateAndUpdatePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<void> {
    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      changePasswordDto.current_password,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new DomainException('Current password is incorrect', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this.passwordService.hashPassword(changePasswordDto.new_password);

    try {
      await this.userRepository.update(user.id, { password: hashedPassword });
      
      // Invalidate all existing sessions and tokens
      await Promise.all([
        this.authTokenRepository.deleteUserTokens(user.id),
        this.userSessionRepository.deleteUserSessions(user.id)
      ]);
    } catch (error) {
      throw new DomainException(
        'Failed to update password. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async handleSuccessfulLogin(user: User, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    const tokens = await this.tokenService.generateTokens(user);
    
    await Promise.all([
      this.authTokenRepository.create({
        user_id: user.id,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + this.tokenService.parseExpirationTime(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'))),
      }),
      this.userSessionRepository.create({
        user_id: user.id,
        token: tokens.access_token,
        ip_address: ipAddress,
        user_agent: userAgent,
        last_activity: new Date(),
      })
    ]);

    const activeRole = user.user_roles?.find(ur => ur.role?.status && !ur.deleted_at)?.role;
    const roleFeaturePermissions = activeRole ? await this.getRoleFeaturePermissions(activeRole.id) : [];

    return {
      status: {
        code: HttpStatus.OK,
        message: 'Success'
      },
      data: [UserMapper.toDetailedResponse(user, activeRole, roleFeaturePermissions)],
      tokens
    };
  }

  private async handleSuccessfulRegistration(user: User): Promise<AuthResponse> {
    const tokens = await this.tokenService.generateTokens(user);

    await this.authTokenRepository.create({
      user_id: user.id,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + this.tokenService.parseExpirationTime(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'))),
    });

    return {
      status: {
        code: HttpStatus.CREATED,
        message: 'Success'
      },
      data: [UserMapper.toDetailedResponse(user, null, [])],
      tokens
    };
  }

  private async handleSuccessfulTokenRefresh(user: User, tokens: any): Promise<AuthResponse> {
    const activeRole = user.user_roles?.find(ur => ur.role?.status && !ur.deleted_at)?.role;
    const roleFeaturePermissions = activeRole ? await this.getRoleFeaturePermissions(activeRole.id) : [];

    return {
      status: {
        code: HttpStatus.OK,
        message: 'Success'
      },
      data: [UserMapper.toDetailedResponse(user, activeRole, roleFeaturePermissions)],
      tokens
    };
  }

  private async getRoleFeaturePermissions(roleId: number) {
    if (!roleId) return [];

    return this.permissionRepository.find({
      where: {
        role_id: roleId,
        status: true,
      },
      relations: ['feature'],
      order: {
        created_at: 'DESC'
      }
    });
  }
}