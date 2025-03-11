import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from "class-validator";

class CustomerCategoryPriceDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  price_category_id: number;

  @ApiProperty()
  @IsString()
  price_category_name: string;

  @ApiProperty()
  @IsString()
  formula: string;

  @ApiProperty()
  @IsNumber()
  percentage: number;

  @ApiProperty()
  @IsBoolean()
  set_default: boolean;

  @ApiProperty()
  @IsNumber()
  pre_tax_price: number;

  @ApiProperty()
  @IsNumber()
  tax_inclusive_price: number;

  @ApiProperty()
  @IsNumber()
  tax_id: number;

  @ApiProperty()
  @IsNumber()
  tax_percentage: number;

  @ApiProperty()
  @IsBoolean()
  is_custom_tax_inclusive_price: boolean;

  @ApiProperty()
  @IsNumber()
  price_category_custom_percentage: number;
}

class PriceCategoryDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  price_category_name: string;

  @ApiProperty()
  @IsNumber()
  percentage: number;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsBoolean()
  set_default: boolean;
}

class ProductVariantPriceDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @IsString()
  variant_id: string;

  @ApiProperty()
  @IsString()
  variant_name: string;

  @ApiProperty()
  @IsNumber()
  usd_price: number;

  @ApiProperty()
  @IsNumber()
  exchange_rate: number;

  @ApiProperty()
  @IsNumber()
  adjustment_percentage: number;

  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty({ type: [PriceCategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceCategoryDto)
  price_categories: PriceCategoryDto[];
}

class GlobalVolumeDiscountPriceCategoryDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inventory_product_global_discount_id: string | null;

  @ApiProperty()
  @IsNumber()
  price_category_id: number;

  @ApiProperty()
  @IsString()
  price_category_name: string;

  @ApiProperty()
  @IsNumber()
  price_category_percentage: number;

  @ApiProperty()
  @IsBoolean()
  price_category_set_default: boolean;

  @ApiProperty()
  @IsNumber()
  price: number;
}

class GlobalVolumeDiscountDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string | null;

  @ApiProperty()
  @IsNumber()
  inventory_product_pricing_information_id: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  discount_percentage: number;

  @ApiProperty({ type: [GlobalVolumeDiscountPriceCategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlobalVolumeDiscountPriceCategoryDto)
  global_volume_discount_price_categories: GlobalVolumeDiscountPriceCategoryDto[];
}

class VariantVolumeDiscountPriceCategoryDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inventory_product_vol_disc_variant_qty_id: string | null;

  @ApiProperty()
  @IsNumber()
  price_category_id: number;

  @ApiProperty()
  @IsString()
  price_category_name: string;

  @ApiProperty()
  @IsNumber()
  price_category_percentage: number;

  @ApiProperty()
  @IsBoolean()
  price_category_set_default: boolean;

  @ApiProperty()
  @IsNumber()
  price: number;
}

class VariantVolumeDiscountQuantityDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inventory_product_volume_discount_variant_id: string | null;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ type: [VariantVolumeDiscountPriceCategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantVolumeDiscountPriceCategoryDto)
  inventory_product_volume_discount_variant_price_categories: VariantVolumeDiscountPriceCategoryDto[];

  @ApiProperty()
  @IsNumber()
  discount_percentage: number;

  @ApiProperty()
  @IsBoolean()
  status: boolean;
}

class VariantVolumeDiscountDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string | null;

  @ApiProperty()
  @IsNumber()
  inventory_product_pricing_information_id: number;

  @ApiProperty()
  @IsString()
  inventory_product_by_variant_id: string;

  @ApiProperty()
  @IsString()
  inventory_product_by_variant_full_product_name: string;

  @ApiProperty()
  @IsString()
  inventory_product_by_variant_sku: string;

  @ApiProperty({ type: [VariantVolumeDiscountQuantityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantVolumeDiscountQuantityDto)
  inventory_product_volume_discount_variant_quantities: VariantVolumeDiscountQuantityDto[];

  @ApiProperty()
  @IsBoolean()
  status: boolean;
}

export class UpdateInventoryPriceDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  usd_price: number;

  @ApiProperty()
  @IsNumber()
  exchange_rate: number;

  @ApiProperty()
  @IsNumber()
  adjustment_percentage: number;

  @ApiProperty()
  @IsNumber()
  price_hb_real: number;

  @ApiProperty()
  @IsNumber()
  hb_adjustment_price: number;

  @ApiProperty()
  @IsBoolean()
  is_manual_product_variant_price_edit: boolean;

  @ApiProperty()
  @IsBoolean()
  is_enable_volume_discount: boolean;

  @ApiProperty()
  @IsBoolean()
  is_enable_volume_discount_by_product_variant: boolean;

  @ApiProperty({ type: [CustomerCategoryPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerCategoryPriceDto)
  customer_category_prices: CustomerCategoryPriceDto[];

  @ApiProperty({ type: [ProductVariantPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantPriceDto)
  product_variant_prices: ProductVariantPriceDto[];

  @ApiProperty({ type: [GlobalVolumeDiscountDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlobalVolumeDiscountDto)
  global_volume_discounts: GlobalVolumeDiscountDto[];

  @ApiProperty({ type: [VariantVolumeDiscountDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantVolumeDiscountDto)
  variant_volume_discounts: VariantVolumeDiscountDto[];
}
