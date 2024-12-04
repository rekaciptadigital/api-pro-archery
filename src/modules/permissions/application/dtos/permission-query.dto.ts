import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionQueryDto {
  @ApiPropertyOptional({ description: 'Page number (starts from 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by role name' })
  @IsOptional()
  @IsString()
  roleName?: string;

  @ApiPropertyOptional({ description: 'Filter by feature name' })
  @IsOptional()
  @IsString()
  featureName?: string;
}