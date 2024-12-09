import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from '../../domain/dtos/auth.dto';
import { JwtAuthGuard } from '../../domain/guards/jwt-auth.guard';
import { Public } from '../../domain/decorators/public.decorator';
import { RateLimit } from '../../domain/decorators/rate-limit.decorator';
import { AuthLoggerInterceptor } from '../../domain/interceptors/auth-logger.interceptor';
import { FastifyRequest } from 'fastify';
import { User } from '../../../users/domain/entities/user.entity';

interface AuthenticatedRequest extends FastifyRequest {
  user: User;
}

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(AuthLoggerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ points: 5, duration: 60 })
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() request: FastifyRequest) {
    const ipAddress = request.ip || '';
    const userAgent = request.headers['user-agent'] || '';
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('register')
  @RateLimit({ points: 3, duration: 60 })
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout successful' })
  async logout(@Req() request: FastifyRequest) {
    const token = request.headers.authorization?.split(' ')[1] || '';
    return this.authService.logout(token);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ points: 10, duration: 60 })
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token refreshed successfully' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ points: 5, duration: 60 })
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password changed successfully' })
  async changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(request.user.id, changePasswordDto);
  }
}