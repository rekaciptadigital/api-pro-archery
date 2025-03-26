import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpStatus,
  Put,
  Body,
  Req,
  Delete,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { InventoryPriceService } from "../applications/services/inventory-price.service";
import { UpdateInventoryPriceDto } from "../domain/dtos/update-inventory-price.dto";

interface RequestUser {
  id: number;
  [key: string]: any;
}

@ApiTags("inventory-price")
@Controller("inventory-price")
export class InventoryPriceController {
  constructor(private readonly inventoryPriceService: InventoryPriceService) {}

  @Get(":inventory_product_id")
  @ApiOperation({ summary: "Get product pricing details" })
  @ApiParam({ name: "inventory_product_id", type: "number", required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Return product pricing information with all related data",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Product pricing not found",
  })
  async findByProductId(
    @Param("inventory_product_id", ParseIntPipe) productId: number
  ) {
    return this.inventoryPriceService.findByProductId(productId);
  }

  @Put(":inventory_product_id")
  @ApiOperation({ summary: "Update product pricing" })
  @ApiParam({ name: "inventory_product_id", type: "number", required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Product pricing updated successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Product pricing not found",
  })
  async updateByProductId(
    @Param("inventory_product_id", ParseIntPipe) productId: number,
    @Body() updateInventoryPriceDto: UpdateInventoryPriceDto,
    @Req() req: { user: RequestUser }
  ) {
    return this.inventoryPriceService.updateByProductId(
      productId,
      updateInventoryPriceDto,
      req.user.id
    );
  }

  @Delete("delete-global-discount/:id")
  @ApiOperation({ summary: "Delete global discount price" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Global Discount deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Global Discount not found",
  })
  @ApiParam({ name: "id", type: "string" })
  removeGlobalDiscount(@Param("id") id: string) {
    return this.inventoryPriceService.removeGlobalDiscount(id);
  }

  @Delete("delete-variant-discount-quantity/:id")
  @ApiOperation({ summary: "Delete variant discount quantity price" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Variant Discount quantity deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Variant Discount quantity not found",
  })
  @ApiParam({ name: "id", type: "string" })
  removeVariantDiscountQuantity(@Param("id") id: string) {
    return this.inventoryPriceService.removeVariantDiscountQuantity(id);
  }
}
