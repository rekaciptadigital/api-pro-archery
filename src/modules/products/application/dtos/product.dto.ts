import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariantDto {
  @ApiProperty({ description: 'Variant values', example: { "Color": "Red", "Size": "XL" } })
  @IsObject()
  variant_values: Record<string, string>;

  @ApiProperty({ description: 'Variant price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Variant stock' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'Variant status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product SKU' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Brand ID' })
  @IsNumber()
  brand_id: number;

  @ApiPropertyOptional({ description: 'Tax ID' })
  @IsOptional()
  @IsNumber()
  tax_id?: number;

  @ApiProperty({ description: 'Base price' })
  @IsNumber()
  @Min(0)
  base_price: number;

  @ApiPropertyOptional({ description: 'Product status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ description: 'Product variants', type: [ProductVariantDto] })
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsNumber()
  brand_id?: number;

  @ApiPropertyOptional({ description: 'Tax ID' })
  @IsOptional()
  @IsNumber()
  tax_id?: number;

  @ApiPropertyOptional({ description: 'Base price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  base_price?: number;

  @ApiPropertyOptional({ description: 'Product status' })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ description: 'Product variants', type: [ProductVariantDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}

export class UpdateProductStatusDto {
  @ApiProperty({ description: 'Product status' })
  @IsBoolean()
  status: boolean;
}