import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ description: 'Sort order (asc/desc)', default: 'asc' })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({ description: 'Search term for name or email' })
  @IsString()
  @IsOptional()
  search?: string;
}