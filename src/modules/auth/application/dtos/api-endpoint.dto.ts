import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApiEndpointDto {
  @ApiProperty({ description: 'API endpoint path' })
  @IsString()
  path: string;

  @ApiProperty({ description: 'HTTP method', example: 'GET' })
  @IsString()
  method: string;

  @ApiPropertyOptional({ description: 'API endpoint description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is endpoint public?' })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({ description: 'Role ID' })
  @IsOptional()
  @IsNumber()
  role_id?: number;
}

export class UpdateApiEndpointDto {
  @ApiPropertyOptional({ description: 'API endpoint path' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: 'HTTP method' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'API endpoint description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is endpoint public?' })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({ description: 'Role ID' })
  @IsOptional()
  @IsNumber()
  role_id?: number;
}