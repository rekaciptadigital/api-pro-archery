import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateInventoryLocationDto {
  @ApiProperty({ description: "Location code" })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: "Location name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description:
      "Location type (Warehouse, Store, Booth, Affiliate Store, Other)",
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: "Location description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Location status" })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateInventoryLocationDto {
  @ApiProperty({ description: "Location code" })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: "Location name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description:
      "Location type (Warehouse, Store, Booth, Affiliate Store, Other)",
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: "Location description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Location status" })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
