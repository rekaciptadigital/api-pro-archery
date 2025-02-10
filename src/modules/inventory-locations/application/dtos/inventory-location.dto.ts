import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryLocationDto {
  @ApiProperty({ description: 'Location code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Location name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Location type (Warehouse, Store)' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Location description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Location status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateInventoryLocationDto {
  @ApiProperty({ description: 'Location name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Location type (Warehouse, Store)' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Location description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Location status' })
  @IsBoolean()
  status: boolean;
}