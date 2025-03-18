import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, Brackets } from "typeorm";
import { InventoryProductPricingInformation } from "../entities/inventory-product-pricing-information.entity";
import { BaseRepository } from "@/common/repositories/base.repository";

@Injectable()
export class InventoryPriceRepository extends BaseRepository<InventoryProductPricingInformation> {
  constructor(
    @InjectRepository(InventoryProductPricingInformation)
    private readonly inventoryPriceRepository: Repository<InventoryProductPricingInformation>
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
}
