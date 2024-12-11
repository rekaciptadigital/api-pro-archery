import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AuthTokenRepository } from '../../domain/repositories/auth-token.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { RegisterDto } from '../dtos/auth.dto';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly authTokenRepository: AuthTokenRepository,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneWithOptions({
      where: { email },
      relations: ['user_roles', 'user_roles.role']
    });

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

  async registerUser(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new DomainException('Email already registered', HttpStatus.CONFLICT);
    }

    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);
    
    return this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      status: true,
    });
  }

  async refreshUserToken(refreshToken: string): Promise<{ user: User; tokens: any }> {
    const authToken = await this.authTokenRepository.findByRefreshToken(refreshToken);
    if (!authToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > authToken.expires_at) {
      await this.authTokenRepository.softDelete(authToken.id);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = await this.userRepository.findOneWithOptions({
      where: { id: authToken.user_id },
      relations: ['user_roles', 'user_roles.role']
    });

    if (!user || !user.status) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.tokenService.generateTokens(user);

    await this.authTokenRepository.update(authToken.id, {
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + this.tokenService.parseExpirationTime('7d')),
    });

    return { user, tokens };
  }
}