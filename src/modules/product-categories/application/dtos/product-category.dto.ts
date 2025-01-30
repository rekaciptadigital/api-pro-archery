import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateProductCategoryDto {
  @ApiProperty({ description: "Category name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Category code" })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: "Category description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Parent category ID" })
  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @ApiPropertyOptional({ description: "Category status" })
  @IsNotEmpty()
  @IsBoolean()
  status?: boolean;
}

export class UpdateProductCategoryDto {
  @ApiPropertyOptional({ description: "Category name" })
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Category description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Category status" })
  @IsNotEmpty()
  @IsBoolean()
  status?: boolean;
}

export class UpdateProductCategoryStatusDto {
  @ApiProperty({ description: "Category status" })
  @IsBoolean()
  status: boolean;
}
