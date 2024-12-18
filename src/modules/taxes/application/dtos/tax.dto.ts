import { IsString, IsNumber, IsBoolean, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTaxDto {
  @ApiProperty({ description: 'Tax name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Tax description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Tax percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentage: number;

  @ApiPropertyOptional({ description: 'Tax status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateTaxDto {
  @ApiPropertyOptional({ description: 'Tax name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Tax description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tax percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentage?: number;

  @ApiPropertyOptional({ description: 'Tax status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateTaxStatusDto {
  @ApiProperty({ description: 'Tax status' })
  @IsBoolean()
  status: boolean;
}