import { Injectable, NotFoundException } from "@nestjs/common";
import { PaginationHelper } from "@/common/pagination/helpers/pagination.helper";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { DataSource } from "typeorm";
import { InventoryPriceRepository } from "../../domain/repositories/inventory-price.repository";
import {
  IInventoryProductCustomerCategoryPrice,
  IInventoryProductGlobalDiscount,
  IInventoryProductVolumeDiscountVariant,
} from "../../domain/interfaces/inventory-price.interface";

@Injectable()
export class InventoryPriceService {
  constructor(
    private readonly inventoryPriceRepository: InventoryPriceRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
    private readonly dataSource: DataSource
  ) {}

  async findByProductId(productId: number) {
    const pricing =
      await this.inventoryPriceRepository.findByProductIdWithDetails(productId);

    if (!pricing) {
      throw new NotFoundException(
        `Pricing information not found for product ${productId}`
      );
    }

    const formattedResponse = {
      ...pricing,
      customer_category_prices: pricing.customer_category_prices?.map(
        (price: IInventoryProductCustomerCategoryPrice) => ({
          id: price.id,
          price_category_id: price.price_category_id,
          price_category_name: price.price_category_name,
          formula: `Formula: HB Naik + ${price.price_category_percentage}% markup`,
          percentage: price.price_category_percentage.toFixed(2),
          set_default: price.price_category_set_default,
          pre_tax_price: price.pre_tax_price,
          tax_inclusive_price: price.tax_inclusive_price,
          tax_id: price.tax_id,
          tax_percentage: price.tax_percentage,
          is_custom_tax_inclusive_price: price.is_custom_tax_inclusive_price,
          created_at: price.created_at,
          updated_at: price.updated_at,
        })
      ),
      product_variant_prices: pricing.volume_discount_variants?.map(
        (variant: IInventoryProductVolumeDiscountVariant) => ({
          id: variant.id,
          variant_id: variant.inventory_product_by_variant_id,
          variant_name: variant.inventory_product_by_variant_full_product_name,
          elite_price: 0.0, // Add logic for price categories
          super_price: 0.0,
          basic_price: 0.0,
          status: variant.status,
          created_at: variant.created_at,
          updated_at: variant.updated_at,
        })
      ),
      global_volume_discounts: pricing.global_discounts?.map(
        (discount: IInventoryProductGlobalDiscount) => ({
          id: discount.id,
          quantity: discount.quantity,
          discount_percentage: discount.discount_percentage,
          created_at: discount.created_at,
          updated_at: discount.updated_at,
        })
      ),
      variant_volume_discounts: pricing.volume_discount_variants?.map(
        (variant: IInventoryProductVolumeDiscountVariant) => ({
          id: variant.id,
          variant_id: variant.inventory_product_by_variant_id,
          variant_name: variant.inventory_product_by_variant_full_product_name,
          quantity: variant.quantity,
          discount_percentage: variant.discount_percentage,
          status: variant.status,
          created_at: variant.created_at,
          updated_at: variant.updated_at,
        })
      ),
    };

    return this.responseTransformer.transform(formattedResponse);
  }
}
