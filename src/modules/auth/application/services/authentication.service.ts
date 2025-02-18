import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { AuthTokenRepository } from "../../domain/repositories/auth-token.repository";
import { UserSessionRepository } from "../../domain/repositories/user-session.repository";
import { User } from "../../../users/domain/entities/user.entity";
import { RegisterDto, ChangePasswordDto } from "../dtos/auth.dto";
import { DomainException } from "../../../common/exceptions/domain.exception";
import { TokenResponse } from "../../domain/interfaces/auth.interface";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly userSessionRepository: UserSessionRepository
  ) {}

  async validateUserAndGenerateTokens(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; tokens: TokenResponse }> {
    const user = await this.validateUser(email, password);
    const tokens = await this.generateAndStoreTokens(
      user,
      ipAddress,
      userAgent
    );
    return { user, tokens };
  }

  async registerUser(
    registerDto: RegisterDto
  ): Promise<{ user: User; tokens: TokenResponse }> {
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email
    );
    if (existingUser) {
      throw new DomainException("Email already registered");
    }

    const hashedPassword = await this.passwordService.hashPassword(
      registerDto.password
    );

    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      status: true,
    });

    const tokens = await this.tokenService.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refresh_token);

    return { user, tokens };
  }

  async refreshUserToken(
    refreshToken: string
  ): Promise<{ user: User; tokens: TokenResponse }> {
    const authToken =
      await this.authTokenRepository.findByRefreshToken(refreshToken);
    if (!authToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (new Date() > authToken.expires_at) {
      await this.authTokenRepository.deleteById(authToken.id);
      throw new UnauthorizedException("Refresh token has expired");
    }

    const user = await this.userRepository.findOneWithOptions({
      where: { id: authToken.user_id },
      relations: ["user_roles", "user_roles.role"],
    });

    if (!user || !user.status) {
      throw new UnauthorizedException("User not found or inactive");
    }

    const tokens = await this.tokenService.generateTokens(user);
    await this.authTokenRepository.update(authToken.id, {
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { user, tokens };
  }

  async invalidateUserSessions(userId: number): Promise<void> {
    await Promise.all([
      this.authTokenRepository.deleteUserTokens(userId),
      this.userSessionRepository.deleteUserSessions(userId),
    ]);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneWithOptions({
      where: { email },
      relations: ["user_roles", "user_roles.role"],
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.status) {
      throw new UnauthorizedException("Account is inactive");
    }

    return user;
  }

  async changeUserPassword(
    userId: number | undefined,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    if (!userId) {
      throw new UnauthorizedException("User ID is required");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      changePasswordDto.current_password,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new DomainException("Current password is incorrect");
    }

    const hashedPassword = await this.passwordService.hashPassword(
      changePasswordDto.new_password
    );

    await this.userRepository.update(user.id, { password: hashedPassword });
  }

  private async generateAndStoreTokens(
    user: User,
    ipAddress: string,
    userAgent: string
  ): Promise<TokenResponse> {
    const tokens = await this.tokenService.generateTokens(user);

    await Promise.all([
      this.storeRefreshToken(user.id, tokens.refresh_token),
      this.storeUserSession(user.id, tokens.access_token, ipAddress, userAgent),
    ]);

    return tokens;
  }

  private async storeRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.authTokenRepository.create({
      user_id: userId,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    });
  }

  private async storeUserSession(
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
}
