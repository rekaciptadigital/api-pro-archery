import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  APP_URL: string;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_ACCESS_TOKEN_EXPIRATION: string;

  @IsString()
  JWT_REFRESH_TOKEN_EXPIRATION: string;

  @IsNumber()
  PASSWORD_SALT_ROUNDS: number;

  @IsNumber()
  RATE_LIMIT_TTL: number;

  @IsNumber()
  RATE_LIMIT_LIMIT: number;

  @IsString()
  @IsOptional()
  SWAGGER_USERNAME: string;

  @IsString()
  @IsOptional()
  SWAGGER_PASSWORD: string;

  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}