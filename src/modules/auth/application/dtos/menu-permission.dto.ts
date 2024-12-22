import { IsString, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuPermissionDto {
  @ApiProperty({ description: 'Role ID' })
  @IsNumber()
  role_id: number;

  @ApiProperty({ description: 'Menu key identifier' })
  @IsString()
  menu_key: string;

  @ApiProperty({ description: 'Can view menu' })
  @IsBoolean()
  can_view: boolean;

  @ApiProperty({ description: 'Can create in menu' })
  @IsBoolean()
  can_create: boolean;

  @ApiProperty({ description: 'Can edit in menu' })
  @IsBoolean()
  can_edit: boolean;

  @ApiProperty({ description: 'Can delete in menu' })
  @IsBoolean()
  can_delete: boolean;
}

export class UpdateMenuPermissionDto {
  @ApiProperty({ description: 'Can view menu' })
  @IsBoolean()
  can_view: boolean;

  @ApiProperty({ description: 'Can create in menu' })
  @IsBoolean()
  can_create: boolean;

  @ApiProperty({ description: 'Can edit in menu' })
  @IsBoolean()
  can_edit: boolean;

  @ApiProperty({ description: 'Can delete in menu' })
  @IsBoolean()
  can_delete: boolean;
}