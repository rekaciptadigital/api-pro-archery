import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './application/services/auth.service';
import { TokenService } from './application/services/token.service';
import { VerifyTokenService } from './application/services/verify-token.service';
import { PasswordService } from './application/services/password.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { VerifyTokenController } from './presentation/controllers/verify-token.controller';
import { JwtStrategy } from './domain/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthTokenRepository } from './domain/repositories/auth-token.repository';
import { UserSessionRepository } from './domain/repositories/user-session.repository';
import { ApiEndpointRepository } from './domain/repositories/api-endpoint.repository';
import { AuthToken } from './domain/entities/auth-token.entity';
import { UserSession } from './domain/entities/user-session.entity';
import { ApiEndpoint } from './domain/entities/api-endpoint.entity';
import { AuthLoggerInterceptor } from './domain/interceptors/auth-logger.interceptor';
import { RateLimitGuard } from './domain/guards/rate-limit.guard';
import { AuthExceptionFilter } from './domain/filters/auth-exception.filter';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RoleFeaturePermission } from '../permissions/domain/entities/role-feature-permission.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      AuthToken, 
      UserSession, 
      ApiEndpoint,
      RoleFeaturePermission
    ]),
    UsersModule,
  ],
  providers: [
    AuthService,
    TokenService,
    VerifyTokenService,
    PasswordService,
    JwtStrategy,
    AuthTokenRepository,
    UserSessionRepository,
    ApiEndpointRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthLoggerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
  ],
  controllers: [AuthController, VerifyTokenController],
  exports: [AuthService, TokenService, PasswordService, ApiEndpointRepository],
})