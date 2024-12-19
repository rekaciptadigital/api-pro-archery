import { IsString, IsBoolean, IsOptional, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @ApiProperty({ description: 'Variant name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Display order' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  display_order: number;

  @ApiPropertyOptional({ description: 'Variant status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ description: 'Variant values', type: [String] })
  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class UpdateVariantDto {
  @ApiPropertyOptional({ description: 'Variant name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  display_order?: number;

  @ApiPropertyOptional({ description: 'Variant status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ description: 'Variant values', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];
}

export class UpdateVariantStatusDto {
  @ApiProperty({ description: 'Variant status' })
  @IsBoolean()
  status: boolean;
}