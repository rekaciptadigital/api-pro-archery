import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuthTokenRepository } from '../../domain/repositories/auth-token.repository';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository';
import { LoginDto, RegisterDto, ChangePasswordDto } from '../dtos/auth.dto';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { User } from '../../../users/domain/entities/user.entity';
import { AuthResponse } from '../../domain/interfaces/auth.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleFeaturePermission } from '../../../permissions/domain/entities/role-feature-permission.entity';
import { AuthenticationService } from './authentication.service';
import { AuthResponseHelper } from './auth-response.helper';
import { TokenConfigService } from './token-config.service';

@Injectable()
export class AuthService {
  private readonly authResponseHelper: AuthResponseHelper;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly tokenConfigService: TokenConfigService,
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(RoleFeaturePermission)
    private readonly permissionRepository: Repository<RoleFeaturePermission>
  ) {
    this.authResponseHelper = new AuthResponseHelper(permissionRepository);
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    const user = await this.authenticationService.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.tokenService.generateTokens(user);
    
    await this.createAuthenticationRecords(user, tokens, ipAddress, userAgent);
    
    return this.authResponseHelper.createLoginResponse(user, tokens);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.authenticationService.registerUser(registerDto);
    const tokens = await this.tokenService.generateTokens(user);
    
    await this.createRefreshToken(user.id, tokens.refresh_token);
    
    return this.authResponseHelper.createLoginResponse(user, tokens, HttpStatus.CREATED);
  }

  async logout(token: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = await this.tokenService.verifyToken(token);
      await this.invalidateUserSessions(payload.sub);
    } catch (error) {
      if (error.message !== 'Token has been invalidated') {
        throw new UnauthorizedException(error.message);
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { user, tokens } = await this.authenticationService.refreshUserToken(refreshToken);
    return this.authResponseHelper.createLoginResponse(user, tokens);
  }

  async changePassword(userId: number | undefined, changePasswordDto: ChangePasswordDto): Promise<void> {
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.validateAndUpdatePassword(user, changePasswordDto);
  }

  private async createAuthenticationRecords(
    user: User, 
    tokens: any, 
    ipAddress: string, 
    userAgent: string
  ): Promise<void> {
    await Promise.all([
      this.createRefreshToken(user.id, tokens.refresh_token),
      this.createUserSession(user.id, tokens.access_token, ipAddress, userAgent)
    ]);
  }

  private async createRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const refreshTokenExpiration = this.tokenConfigService.getRefreshTokenExpiration();
    const expiresAt = new Date(
      Date.now() + this.tokenService.parseExpirationTime(refreshTokenExpiration)
    );

    await this.authTokenRepository.create({
      user_id: userId,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    });
  }

  private async createUserSession(
    userId: number,
    accessToken: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.userSessionRepository.create({
      user_id: userId,
      token: accessToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      last_activity: new Date(),
    });
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
      // Removed invalidateUserSessions call since we want to keep existing sessions
    } catch (error) {
      throw new DomainException(
        'Failed to update password. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async invalidateUserSessions(userId: number): Promise<void> {
    await Promise.all([
      this.authTokenRepository.deleteUserTokens(userId),
      this.userSessionRepository.deleteUserSessions(userId)
    ]);
  }
}