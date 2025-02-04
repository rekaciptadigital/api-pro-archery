import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsBoolean,
  IsArray,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreatePriceCategoryDto {
  @ApiProperty({
    description: "Price category type (e.g., customer, marketplace)",
  })
  @IsString()
  type: string;

  @ApiProperty({ description: "Price category name" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Price calculation formula" })
  @IsOptional()
  @IsString()
  formula?: string;

  @ApiProperty({ description: "Markup percentage", minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentage: number;

  @ApiPropertyOptional({ description: "Price category status", default: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class BatchPriceCategoryDto {
  @ApiProperty({
    description: "ID for updates, null for new entries",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @ApiProperty({ description: "Price category type" })
  @IsString()
  type: string;

  @ApiProperty({ description: "Price category name" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Price calculation formula" })
  @IsOptional()
  @IsString()
  formula?: string;

  @ApiProperty({ description: "Markup percentage" })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentage: number;

  @ApiPropertyOptional({ description: "Price category status", default: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class BatchPriceCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchPriceCategoryDto)
  @ApiProperty({ type: [BatchPriceCategoryDto] })
  data: BatchPriceCategoryDto[];
}

export class SetDefaultPriceCategoryDto {
  @IsBoolean()
  set_default: boolean;
}
