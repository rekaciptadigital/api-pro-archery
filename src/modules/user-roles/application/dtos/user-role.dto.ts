import { IsNumber, IsBoolean, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserRoleDto {
  @ApiProperty({ description: "User ID" })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: "Role ID" })
  @IsNumber()
  role_id: number;

  @ApiPropertyOptional({ description: "User role status" })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateUserRoleDto {
  @ApiProperty({ description: "Role ID" })
  @IsNumber()
  role_id: number;

  @ApiPropertyOptional({ description: "User role status" })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateUserRoleStatusDto {
  @ApiProperty({ description: "User role status" })
  @IsBoolean()
  status: boolean;
}