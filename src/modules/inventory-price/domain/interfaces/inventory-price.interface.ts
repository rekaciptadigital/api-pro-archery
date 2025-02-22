export interface IInventoryProductPricingInformationHistory {
  id: string;
  inventory_product_pricing_information: number;
  inventory_product_id: number;
  usd_price: number;
  exchange_rate: number;
  adjustment_percentage: number;
  price_hb_real: number;
  hb_adjustment_price: number;
  is_manual_product_variant_price_edit: boolean;
  is_enable_volume_discount: boolean;
  is_enable_volume_discount_by_product_variant: boolean;
  user_id: number;
  created_at: Date;
}

export interface IInventoryProductGlobalDiscount {
  id: string;
  inventory_product_pricing_information_id: number;
  quantity: number;
  discount_percentage: number;
  created_at: Date;
  updated_at: Date;
}

export interface IInventoryProductGlobalDiscountPriceCategory {
  id: string;
  inventory_product_global_discount_id: string;
  price_category_id: number;
  price_category_name: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface IInventoryProductGlobalDiscountPriceCategoryHistory {
  id: string;
  inventory_product_pricing_information_history_id: string;
  price_category_id: number;
  price_category_name: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  price: number;
  created_at: Date;
}

export interface IInventoryProductGlobalDiscountHistory {
  id: string;
  inventory_product_pricing_information_history_id: string;
  quantity: number;
  discount_percentage: number;
  created_at: Date;
}

export interface IInventoryProductCustomerCategoryPrice {
  id: number;
  inventory_product_pricing_information_id: number;
  price_category_id: number;
  price_category_name: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  pre_tax_price: number;
  tax_inclusive_price: number;
  tax_id: number;
  tax_percentage: number;
  is_custom_tax_inclusive_price: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IInventoryProductCustomerCategoryPriceHistory {
  id: string;
  inventory_product_pricing_information_history_id: string;
  inventory_product_id: number;
  price_category_id: number;
  price_category_name: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  pre_tax_price: number;
  tax_inclusive_price: number;
  tax_id: number;
  tax_percentage: number;
  is_custom_tax_inclusive_price: boolean;
  created_at: Date;
}

export interface IInventoryProductByVariantPrice {
  id: string;
  inventory_product_by_variant_id: string;
  price_category_id: number;
  price: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IInventoryProductByVariantPriceHistory {
  id: string;
  inventory_product_pricing_information_history_id: string;
  inventory_product_by_variant_id: string;
  price_category_id: number;
  price: number;
  status: boolean;
  created_at: Date;
}

export interface IInventoryProductPricingInformation {
  id: number;
  inventory_product_id: number;
  usd_price: number;
  exchange_rate: number;
  adjustment_percentage: number;
  price_hb_real: number;
  hb_adjustment_price: number;
  is_manual_product_variant_price_edit: boolean;
  is_enable_volume_discount: boolean;
  is_enable_volume_discount_by_product_variant: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface IInventoryProductVolumeDiscountVariant {
  id: string;
  inventory_product_pricing_information_id: number;
  inventory_product_by_variant_id: string;
  inventory_product_by_variant_full_product_name: string;
  inventory_product_by_variant_sku: string;
  quantity: number;
  discount_percentage: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IInventoryProductVolumeDiscountVariantPriceCategory {
  id: string;
  inventory_product_volume_discount_variant_id: string;
  price_category_id: number;
  price_category_name: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface IInventoryProductVolumeDiscountVariantPriceCategoryHistory {
  id: string;
  inventory_product_pricing_information_history_id: string;
  price_category_id: number;
  price_category_name: string;
  price_category_percentage: number;
  price_category_set_default: boolean;
  price: number;
  created_at: Date;
}

export interface IInventoryProductVolumeDiscountVariantHistory {
  id: string;
  inventory_product_pricing_information_history_id: string;
  inventory_product_by_variant_id: string;
  inventory_product_by_variant_full_product_name: string;
  inventory_product_by_variant_sku: string;
  quantity: number;
  discount_percentage: number;
  status: boolean;
  created_at: Date;
}

export interface Brand {
  brand_id: number;
  brand_code: string;
  brand_name: string;
}

export interface ProductType {
  product_type_id: number;
  product_type_code: string;
  product_type_name: string;
}

export interface Category {
  product_category_id: number;
  product_category_parent: number | null;
  product_category_name: string;
  category_hierarchy: number;
}

export interface VariantValue {
  variant_value_id: number;
  variant_value_name: string;
}

export interface Variant {
  variant_id: number;
  variant_name: string;
  variant_values: VariantValue[];
}

export interface ProductByVariant {
  full_product_name: string;
  sku: string;
  sku_product_unique_code: string;
}

export interface IInventoryProduct {
  id?: number;
  brand_id: number;
  brand_code: string;
  brand_name: string;
  product_type_id: number;
  product_type_code: string;
  product_type_name: string;
  unique_code?: string;
  sku: string;
  product_name: string;
  full_product_name: string;
  vendor_sku?: string;
  description?: string;
  unit: string;
  slug: string;
  categories: Category[];
  variants: Variant[];
  product_by_variant: ProductByVariant[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
