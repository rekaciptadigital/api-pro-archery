import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusToInventoryVariants1702432800010
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "inventory_product_by_variants",
      new TableColumn({
        name: "status",
        type: "boolean",
        default: true,
      })
    );

    await queryRunner.addColumn(
      "inventory_product_by_variant_histories",
      new TableColumn({
        name: "status",
        type: "boolean",
        default: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("inventory_product_by_variants", "status");
    await queryRunner.dropColumn(
      "inventory_product_by_variant_histories",
      "status"
    );
  }
}
