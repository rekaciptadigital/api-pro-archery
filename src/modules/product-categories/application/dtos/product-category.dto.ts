import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category code (unique)' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category ID' })
  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @ApiPropertyOptional({ description: 'Category status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateProductCategoryDto {
  @ApiPropertyOptional({ description: 'Category name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Category code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category ID' })
  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @ApiPropertyOptional({ description: 'Category status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateProductCategoryStatusDto {
  @ApiProperty({ description: 'Category status' })
  @IsBoolean()
  status: boolean;
}