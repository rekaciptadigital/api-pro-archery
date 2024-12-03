import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Role status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: 'Role name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Role status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateRoleStatusDto {
  @ApiProperty({ description: 'Role status' })
  @IsBoolean()
  status: boolean;
}