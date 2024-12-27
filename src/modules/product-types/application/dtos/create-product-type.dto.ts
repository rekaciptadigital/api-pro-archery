import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductTypeDto {
  @ApiProperty({ description: 'Product type name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product type code (unique)' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Product type description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Product type status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}