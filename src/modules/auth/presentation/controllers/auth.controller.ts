import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "../../application/services/auth.service";
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from "../../domain/dtos/auth.dto";
import { Public } from "../../domain/decorators/public.decorator";
import { AuthLoggerInterceptor } from "../../domain/interceptors/auth-logger.interceptor";
import { FastifyRequest } from "fastify";
import { User } from "../../../users/domain/entities/user.entity";
import { RequestUtil } from "../../../../common/utils/request.util";
import { JwtAuthGuard } from "../../domain/guards/jwt-auth.guard";

interface AuthenticatedRequest extends FastifyRequest {
  user: User;
}

@ApiTags("auth")
@Controller("auth")
@UseInterceptors(AuthLoggerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: HttpStatus.OK, description: "Login successful" })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginDto, @Req() request: FastifyRequest) {
    const ipAddress = RequestUtil.getClientIp(request);
    const userAgent = RequestUtil.getUserAgent(request);
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post("register")
  @ApiOperation({ summary: "User registration" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User registered successfully",
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "User logout" })
  @ApiResponse({ status: HttpStatus.OK, description: "Logout successful" })
  async logout(@Req() request: FastifyRequest) {
    const token = RequestUtil.getAuthToken(request);
    return this.authService.logout(token || "");
  }

  @Public()
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Token refreshed successfully",
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Password changed successfully",
  })
  async changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(request.user?.id, changePasswordDto);
  }
}
