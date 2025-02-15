import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
} from "class-validator";

class CategoryDto {
  @ApiProperty({ description: "Product category ID" })
  @IsNumber()
  product_category_id: number;

  @ApiPropertyOptional({ description: "Parent category ID" })
  @IsOptional()
  @IsNumber()
  product_category_parent: number | null;

  @ApiProperty({ description: "Category name" })
  @IsString()
  @IsNotEmpty()
  product_category_name: string;

  @ApiPropertyOptional({ description: "Category hierarchy level", default: 1 })
  @IsOptional()
  @IsNumber()
  category_hierarchy?: number = 1;
}

class VariantValueDto {
  @ApiProperty({ description: "Variant value ID" })
  @IsNumber()
  variant_value_id: number;

  @ApiProperty({ description: "Variant value name" })
  @IsString()
  @IsNotEmpty()
  variant_value_name: string;
}

class VariantDto {
  @ApiProperty({ description: "Variant ID" })
  @IsNumber()
  variant_id: number;

  @ApiProperty({ description: "Variant name" })
  @IsString()
  @IsNotEmpty()
  variant_name: string;

  @ApiProperty({ type: [VariantValueDto], description: "Variant values" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantValueDto)
  variant_values: VariantValueDto[];
}

class ProductByVariantDto {
  @ApiProperty({ description: "Full product name with variant" })
  @IsString()
  @IsNotEmpty()
  full_product_name: string;

  @ApiProperty({ description: "SKU with variant" })
  @IsString()
  @IsNotEmpty()
  sku: string; // This will be mapped to sku_product_variant in the entity

  @ApiProperty({ description: "SKU product unique code" })
  @IsString()
  @IsNotEmpty()
  sku_product_unique_code: string;

  @ApiProperty({
    description: "Product variant status",
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: any }) => value === "true" || value === true)
  status?: boolean;
}

export class CreateInventoryProductDto {
  @ApiProperty({ description: "Brand ID" })
  @IsNumber()
  brand_id: number;

  @ApiProperty({ description: "Brand code" })
  @IsString()
  @IsNotEmpty()
  brand_code: string;

  @ApiProperty({ description: "Brand name" })
  @IsString()
  @IsNotEmpty()
  brand_name: string;

  @ApiProperty({ description: "Product type ID" })
  @IsNumber()
  product_type_id: number;

  @ApiProperty({ description: "Product type code" })
  @IsString()
  @IsNotEmpty()
  product_type_code: string;

  @ApiProperty({ description: "Product type name" })
  @IsString()
  @IsNotEmpty()
  product_type_name: string;

  @ApiPropertyOptional({ description: "Unique code" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unique_code?: string;

  @ApiProperty({ description: "SKU" })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: "Product name" })
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @ApiProperty({ description: "Full product name" })
  @IsString()
  @IsNotEmpty()
  full_product_name: string;

  @ApiPropertyOptional({ description: "Vendor SKU" })
  @IsOptional()
  @IsString()
  vendor_sku?: string;

  @ApiPropertyOptional({ description: "Product description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Product unit" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  unit: string;

  @ApiProperty({ description: "Product slug" })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ type: [CategoryDto], description: "Product categories" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @ApiProperty({ type: [VariantDto], description: "Product variants" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];

  @ApiProperty({
    type: [ProductByVariantDto],
    description: "Product variants combinations",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductByVariantDto)
  product_by_variant: ProductByVariantDto[];

  @ApiProperty({
    description: "Product variant status",
    default: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  status?: boolean;
}
