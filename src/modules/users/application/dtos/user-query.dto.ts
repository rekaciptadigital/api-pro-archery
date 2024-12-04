import { IsOptional, IsInt, IsString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum SortField {
  ID = 'id',
  USERNAME = 'username',
  EMAIL = 'email',
  CREATED_AT = 'created_at'
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

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

  @ApiPropertyOptional({ enum: SortField, description: 'Field to sort by' })
  @IsEnum(SortField)
  @IsOptional()
  sort?: SortField;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order' })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({ description: 'Filter by role name' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ description: 'Search term for username or email' })
  @IsString()
  @IsOptional()
  search?: string;
}