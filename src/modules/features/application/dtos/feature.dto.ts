import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({ description: 'Feature name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Feature description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Feature status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateFeatureDto {
  @ApiPropertyOptional({ description: 'Feature name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Feature description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Feature status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateFeatureStatusDto {
  @ApiProperty({ description: 'Feature status' })
  @IsBoolean()
  status: boolean;
}