import { IsString, IsNumber, IsObject, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Role ID' })
  @IsNumber()
  role_id: number;

  @ApiProperty({ description: 'Feature ID' })
  @IsNumber()
  feature_id: number;

  @ApiProperty({
    description: 'Permission methods',
    example: {
      get: true,
      post: false,
      put: false,
      patch: false,
      delete: false,
    },
  })
  @IsObject()
  methods: Record<string, boolean>;

  @ApiPropertyOptional({ description: 'Permission status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdatePermissionDto {
  @ApiProperty({ description: 'Role ID' })
  @IsNumber()
  role_id: number;

  @ApiProperty({ description: 'Feature ID' })
  @IsNumber()
  feature_id: number;

  @ApiProperty({
    description: 'Permission methods',
    example: {
      get: true,
      post: false,
      put: false,
      patch: false,
      delete: false,
    },
  })
  @IsObject()
  methods: Record<string, boolean>;

  @ApiPropertyOptional({ description: 'Permission status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdatePermissionStatusDto {
  @ApiProperty({ description: 'Permission status' })
  @IsBoolean()
  status: boolean;
}