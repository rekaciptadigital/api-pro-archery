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

  private async getProductVariantPrices(productId: number) {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select([
        "v.id as variant_id",
        "v.full_product_name as variant_name",
        "v.status",
        "vp.id",
        "vp.price_category_id",
        "vp.price",
        "pc.name as price_category_name",
        "pc.type as price_category_type",
        "pc.percentage as price_category_percentage",
        "pc.set_default as price_category_set_default",
        "v.created_at",
        "v.updated_at",
      ])
      .from("inventory_product_by_variants", "v")
      .leftJoin(
        "inventory_product_by_variant_prices",
        "vp",
        "vp.inventory_product_by_variant_id = v.id"
      )
      .leftJoin("price_categories", "pc", "pc.id = vp.price_category_id")
      .where("v.inventory_product_id = :productId", { productId })
      .andWhere("v.deleted_at IS NULL");

    const results = await queryBuilder.getRawMany();

    // Return empty array if no variants exist
    if (!results || results.length === 0) {
      return [];
    }

    // Group the results by variant
    const variantMap = new Map();
    results.forEach((row) => {
      if (!variantMap.has(row.variant_id)) {
        variantMap.set(row.variant_id, {
          id: row.variant_id,
          variant_id: row.variant_id,
          variant_name: row.variant_name,
          status: row.status,
          price_categories: [],
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      }

      if (row.vp_price_category_id) {
        const variant = variantMap.get(row.variant_id);
        variant.price_categories.push({
          id: row.vp_price_category_id,
          price: row.price,
          price_category_name: row.price_category_name,
          percentage: row.price_category_percentage,
          type: row.price_category_type,
          set_default: row.price_category_set_default,
        });
      }
    });

    // Convert map to array and sort by variant name
    return Array.from(variantMap.values()).sort((a, b) =>
      a.variant_name.localeCompare(b.variant_name)
    );
  }

  async findByProductId(productId: number) {
    const pricing =
      await this.inventoryPriceRepository.findByProductIdWithDetails(productId);

    if (!pricing) {
      throw new NotFoundException(
        `Pricing information not found for product ${productId}`
      );
    }

    const formattedResponse = {
      id: pricing.id,
      inventory_product_id: pricing.inventory_product_id,
      usd_price: pricing.usd_price,
      exchange_rate: pricing.exchange_rate,
      adjustment_percentage: pricing.adjustment_percentage,
      price_hb_real: pricing.price_hb_real,
      hb_adjustment_price: pricing.hb_adjustment_price,
      is_manual_product_variant_price_edit:
        pricing.is_manual_product_variant_price_edit,
      is_enable_volume_discount: pricing.is_enable_volume_discount,
      is_enable_volume_discount_by_product_variant:
        pricing.is_enable_volume_discount_by_product_variant,
      customer_category_prices:
        pricing.customer_category_prices?.map(
          (price: IInventoryProductCustomerCategoryPrice) => ({
            id: price.id,
            price_category_id: price.price_category_id,
            price_category_name: price.price_category_name,
            formula: `Formula: HB Naik + ${Number(price.price_category_percentage).toFixed(1)}% markup`,
            percentage: Number(price.price_category_percentage).toFixed(1),
            set_default: price.price_category_set_default,
            pre_tax_price: price.pre_tax_price,
            tax_inclusive_price: price.tax_inclusive_price,
            tax_id: price.tax_id,
            tax_percentage: Number(price.tax_percentage).toFixed(1),
            is_custom_tax_inclusive_price: price.is_custom_tax_inclusive_price,
            created_at: price.created_at,
            updated_at: price.updated_at,
          })
        ) || [],
      product_variant_prices: await this.getProductVariantPrices(
        pricing.inventory_product_id
      ),
      global_volume_discounts:
        pricing.global_discounts?.map((discount) => ({
          id: discount.id,
          quantity: discount.quantity,
          discount_percentage: discount.discount_percentage,
          created_at: discount.created_at,
          updated_at: discount.updated_at,
        })) || [],
      variant_volume_discounts:
        pricing.volume_discount_variants?.map((variant) => ({
          id: variant.id,
          variant_id: variant.inventory_product_by_variant_id,
          variant_name: variant.inventory_product_by_variant_full_product_name,
          quantity: variant.quantity,
          discount_percentage: variant.discount_percentage,
          status: variant.status,
          created_at: variant.created_at,
          updated_at: variant.updated_at,
        })) || [],
    };

    return this.responseTransformer.transform(formattedResponse);
  }
}
