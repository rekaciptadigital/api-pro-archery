import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nik?: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nik?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}