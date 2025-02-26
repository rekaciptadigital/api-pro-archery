import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { InventoryPriceService } from "../applications/services/inventory-price.service";

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
}
