import { BaseRepository } from "@/common/repositories/base.repository";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, IsNull, Repository } from "typeorm";
import { InventoryProductByVariantPrice } from "../entities/inventory-product-by-variant-price.entity";
import { InventoryProductGlobalDiscountPriceCategory } from "../entities/inventory-product-global-discount-price-category.entity";
import { InventoryProductGlobalDiscount } from "../entities/inventory-product-global-discount.entity";
import { InventoryProductPricingInformation } from "../entities/inventory-product-pricing-information.entity";
import { InventoryProductVolumeDiscountVariantQty } from "../entities/inventory-product-volume-discount-variant-qty.entity";
import { InventoryProductVolumeDiscountVariant } from "../entities/inventory-product-volume-discount-variant.entity";
import { InventoryProductVolumeDiscountVariantHistory } from "../entities/inventory-product-volume-discount-variant-history.entity";
import { InventoryProductVolumeDiscountVariantPriceCategory } from "../entities/inventory-product-volume-discount-variant-price-category.entity";

@Injectable()
export class InventoryPriceRepository extends BaseRepository<InventoryProductPricingInformation> {
  constructor(
    @InjectRepository(InventoryProductPricingInformation)
    private readonly inventoryPriceRepository: Repository<InventoryProductPricingInformation>,
    @InjectRepository(InventoryProductByVariantPrice)
    private readonly inventoryProductByVariantPriceRepository: Repository<InventoryProductByVariantPrice>,
    @InjectRepository(InventoryProductGlobalDiscount)
    private readonly inventoryProductGlobalDiscountRepository: Repository<InventoryProductGlobalDiscount>,
    @InjectRepository(InventoryProductGlobalDiscountPriceCategory)
    private readonly inventoryProductGlobalDiscountPriceCategoryRepository: Repository<InventoryProductGlobalDiscountPriceCategory>,
    @InjectRepository(InventoryProductVolumeDiscountVariant)
    private readonly inventoryProductVolumeDiscountVariantRepository: Repository<InventoryProductVolumeDiscountVariant>,
    @InjectRepository(InventoryProductVolumeDiscountVariantHistory)
    private readonly inventoryProductVolumeDiscountVariantHistoryRepository: Repository<InventoryProductVolumeDiscountVariantHistory>,
    @InjectRepository(InventoryProductVolumeDiscountVariantQty)
    private readonly inventoryProductVolumeDiscountVariantQtyRepository: Repository<InventoryProductVolumeDiscountVariantQty>,
    @InjectRepository(InventoryProductVolumeDiscountVariantPriceCategory)
    private readonly inventoryProductVolumeDiscountVariantPriceCategoryRepository: Repository<InventoryProductVolumeDiscountVariantPriceCategory>
  ) {
    super(inventoryPriceRepository);
  }

  async findByProductId(
    productId: number
  ): Promise<InventoryProductPricingInformation | null> {
    return this.inventoryPriceRepository.findOne({
      where: {
        inventory_product_id: productId,
        deleted_at: IsNull(),
      },
    });
  }

  async findPrices(
    skip: number,
    take: number,
    sort: string = "created_at",
    order: "ASC" | "DESC" = "DESC",
    search?: string
  ): Promise<[InventoryProductPricingInformation[], number]> {
    const query = this.inventoryPriceRepository
      .createQueryBuilder("price")
      .where("price.deleted_at IS NULL");

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where("CAST(price.usd_price AS TEXT) LIKE :search", {
            search: `%${search}%`,
          })
            .orWhere("CAST(price.exchange_rate AS TEXT) LIKE :search", {
              search: `%${search}%`,
            })
            .orWhere("CAST(price.price_hb_real AS TEXT) LIKE :search", {
              search: `%${search}%`,
            });
        })
      );
    }

    query.orderBy(`price.${sort}`, order).skip(skip).take(take);

    return query.getManyAndCount();
  }

  async findOneWithDetails(
    id: number
  ): Promise<InventoryProductPricingInformation | null> {
    return this.inventoryPriceRepository.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      },
      relations: [
        "global_discounts",
        "global_discounts.price_categories",
        "volume_discount_variants",
        "volume_discount_variants.price_categories",
      ],
    });
  }

  async findByProductIdWithDetails(
    productId: number
  ): Promise<InventoryProductPricingInformation | null> {
    return this.inventoryPriceRepository.findOne({
      where: {
        inventory_product_id: productId,
        deleted_at: IsNull(),
      },
      relations: [
        "customer_category_prices",
        "marketplace_category_prices",
        "global_discounts",
        "global_discounts.price_categories",
        "volume_discount_variants",
        "volume_discount_variants.quantities",
        "volume_discount_variants.quantities.price_categories",
      ],
    });
  }

  async findProductVariantPriceById(
    id: string
  ): Promise<InventoryProductByVariantPrice[]> {
    const query = this.inventoryProductByVariantPriceRepository
      .createQueryBuilder("inventory_product_by_variant_price")
      .where(
        "inventory_product_by_variant_price.inventory_product_by_variant_id = :inventory_product_by_variant_id",
        { inventory_product_by_variant_id: id }
      )
      .getMany();

    return query;
  }

  async findGetDiscountGlobalNotId(
    id: string
  ): Promise<InventoryProductGlobalDiscount[]> {
    const query = this.inventoryProductGlobalDiscountRepository
      .createQueryBuilder("inventory_product_global_discounts")
      .leftJoinAndSelect(
        "inventory_product_global_discounts.price_categories",
        "price_categories"
      )
      .where("inventory_product_global_discounts.id != :id", { id })
      .getMany();

    return query;
  }

  async deleteDiscountGlobalById(id: string): Promise<void> {
    await this.inventoryProductGlobalDiscountPriceCategoryRepository
      .createQueryBuilder("inventory_product_global_discount_price_categories")
      .where(
        "inventory_product_global_discount_price_categories.inventory_product_global_discount_id = :inventory_product_global_discount_id",
        { inventory_product_global_discount_id: id }
      )
      .delete()
      .execute();

    await this.inventoryProductGlobalDiscountRepository.delete({ id });
  }

  async findGetDiscountVariantQtyNotId(
    pricingInformationId: number,
    qtyId: string
  ): Promise<InventoryProductVolumeDiscountVariant[]> {
    const query = this.inventoryProductVolumeDiscountVariantRepository
      .createQueryBuilder("inventory_product_volume_discount_variants")
      .leftJoinAndSelect(
        "inventory_product_volume_discount_variants.quantities",
        "quantities"
      )
      .leftJoinAndSelect("quantities.price_categories", "price_categories")
      .where(
        "inventory_product_volume_discount_variants.inventory_product_pricing_information_id = :pricingInformationId",
        { pricingInformationId }
      )
      .andWhere("quantities.id != :qtyId", { qtyId })
      .getMany();

    return query;
  }

  async findVariantHistory(
    idPricingInformation: string,
    idInventoryProductVariant: string
  ): Promise<InventoryProductVolumeDiscountVariantHistory | null> {
    const query = this.inventoryProductVolumeDiscountVariantHistoryRepository
      .createQueryBuilder("inventory_product_volume_discount_variant_histories")
      .where(
        "inventory_product_volume_discount_variant_histories.inventory_product_pricing_information_history_id = :idPricingInformation",
        { idPricingInformation }
      )
      .andWhere(
        "inventory_product_volume_discount_variant_histories.inventory_product_by_variant_id = :idInventoryProductVariant",
        { idInventoryProductVariant }
      )
      .getOne();

    return query;
  }

  async deleteDiscountVariantQtyById(id: string): Promise<void> {
    await this.inventoryProductVolumeDiscountVariantPriceCategoryRepository
      .createQueryBuilder(
        "inventory_product_volume_discount_variant_price_categories"
      )
      .where(
        "inventory_product_volume_discount_variant_price_categories.inventory_product_vol_disc_variant_qty_id = :inventory_product_vol_disc_variant_qty_id",
        { inventory_product_vol_disc_variant_qty_id: id }
      )
      .delete()
      .execute();

    await this.inventoryProductVolumeDiscountVariantQtyRepository.delete({
      id,
    });
  }
}
