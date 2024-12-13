import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { ApiResponse } from '../../../../common/interfaces/api-response.interface';
import { AuthResponse } from '../../domain/interfaces/auth.interface';
import { LoginDto, RegisterDto, ChangePasswordDto } from '../dtos/auth.dto';
import { UserMapper } from '../../../users/application/mappers/user.mapper';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly responseTransformer: ResponseTransformer,
    private readonly authenticationService: AuthenticationService
  ) {}

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    const { user, tokens } = await this.authenticationService.validateUserAndGenerateTokens(
      loginDto.email,
      loginDto.password,
      ipAddress,
      userAgent
    );

    return {
      status: { code: 200, message: 'Success' },
      data: UserMapper.toDetailedResponse(user),
      tokens
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { user, tokens } = await this.authenticationService.registerUser(registerDto);
    
    return {
      status: { code: 201, message: 'Success' },
      data: UserMapper.toDetailedResponse(user),
      tokens
    };
  }

  async logout(token: string): Promise<ApiResponse<null>> {
    if (!token) {
      throw new UnauthorizedException("Token not provided");
    }

    try {
      const payload = await this.tokenService.verifyToken(token);
      await this.invalidateUserSessions(payload.id);
      return {
        status: { code: 200, message: 'Success' },
        data: null
      };
    } catch (error) {
      if (error.message !== "Token has been invalidated") {
        throw new UnauthorizedException(error.message);
      }
      return {
        status: { code: 200, message: 'Success' },
        data: null
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { user, tokens } = await this.authenticationService.refreshUserToken(refreshToken);
    
    return {
      status: { code: 200, message: 'Success' },
      data: UserMapper.toDetailedResponse(user),
      tokens
    };
  }

  async changePassword(userId: number | undefined, changePasswordDto: ChangePasswordDto): Promise<ApiResponse<null>> {
    await this.authenticationService.changeUserPassword(userId, changePasswordDto);
    
    return {
      status: { code: 200, message: 'Success' },
      data: null
    };
  }

  private async invalidateUserSessions(userId: number): Promise<void> {
    await this.authenticationService.invalidateUserSessions(userId);
  }
}