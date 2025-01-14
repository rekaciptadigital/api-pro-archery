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